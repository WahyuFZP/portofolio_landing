import { BufferAttribute, BufferGeometry, Color, Mesh, OctahedronGeometry, OrthographicCamera, PlaneGeometry, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { onThemeChange } from "@/lib/scene";

const PIXEL = 2; // half-resolution render, upscaled pixelated
const HALF_H = 1.6; // world units from centre to top edge
const SPARKS = 40;
const RING_Y = 0.3; // ring centre, a little above the middle
const TURN = 0.1; // rad/s: the ring goes round once every ~63 s

interface Options {
  tones: string[]; // gem color per crystal (hex): gems are self-lit, so the same in both themes
  tabs: HTMLElement[]; // one button per crystal, moved to follow it
  tiles: () => HTMLElement[]; // logo tiles of the selected category (they change with the selection)
  selected: () => number;
  hovered: () => number; // crystal under the pointer or focus, or -1
  paused: () => boolean;
}

/**
 * Skill categories as crystals orbiting in one tilted ring: near ones large, far ones small.
 * The selected crystal leaves the ring and floats in the middle, with its logos circling it.
 * Soft pixel look: each facet one clean flat color (no dither), a smooth tinted glow, slow sparks.
 * Returns a cleanup function.
 */
export function startCrystals(canvas: HTMLCanvasElement, { tones, tabs, tiles, selected, hovered, paused }: Options): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, HALF_H, -HALF_H, 0.1, 20);
  camera.position.z = 8;

  const uTime = { value: 0 };

  const crystalGeo = new OctahedronGeometry(0.3);
  const glowGeo = new PlaneGeometry(1.5, 2.0);
  const crystals = tones.map((tone, i) => {
    const uColor = { value: new Color(tone) };
    const uLift = { value: 0 }; // 0..1: brighter while hovered or selected
    const uniforms = { uColor, uTime, uLift, uPhase: { value: i * 1.7 } };
    const body = new Mesh(
      crystalGeo,
      new ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec3 vView;
          void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uTime; uniform float uLift; uniform float uPhase;
          varying vec3 vView;
          void main() {
            vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));            // one normal per facet = one flat color per facet
            float key = max(dot(n, normalize(vec3(-0.5, 0.7, 0.6))), 0.0);
            float lit = clamp(0.2 + key * 0.8 + 0.04 * sin(uTime * 1.3 + uPhase) + uLift * 0.1, 0.0, 1.0);
            // Shadow and highlight stay inside the gem's own hue, so it never turns muddy on a light page.
            vec3 col = lit < 0.6 ? mix(uColor * 0.5, uColor, lit / 0.6) : mix(uColor, mix(uColor, vec3(1.0), 0.6), (lit - 0.6) / 0.4);
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    );
    const glow = new Mesh(
      glowGeo,
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms,
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uTime; uniform float uLift; uniform float uPhase;
          varying vec2 vUv;
          void main() {
            float d = length((vUv - 0.5) * 2.0);                              // reaches 0 at every edge of the quad
            float f = max(1.0 - d, 0.0);
            float a = f * f * (0.26 + 0.04 * sin(uTime * 1.3 + uPhase) + uLift * 0.06); // smooth falloff, no dither
            gl_FragColor = vec4(uColor, a);                                  // tinted, so it reads on light and dark
          }`,
      }),
    );
    scene.add(glow, body);
    return { tone, body, glow, uColor, uLift, x: 0, y: 0, s: 1, d: 0 }; // x, y, scale, depth: eased every frame
  });

  // Sparks: small points drifting up across the stage; all motion is in the vertex shader.
  const seed = new Float32Array(SPARKS * 3);
  for (let i = 0; i < SPARKS; i++) seed.set([(i * 0.754877) % 1, (i * 0.618034) % 1, (i * 0.377) % 1], i * 3);
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute("position", new BufferAttribute(seed, 3));
  const sparkMat = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: { uTime, uHalfW: { value: 1 }, uColor: { value: new Color() }, uPx: { value: 1 } },
    vertexShader: `
      uniform float uTime; uniform float uHalfW; uniform float uPx;
      varying float vAlpha;
      void main() {
        float rise = fract(position.y + uTime * (0.03 + position.z * 0.04));
        vec3 p = vec3((position.x * 2.0 - 1.0) * uHalfW + sin(uTime * 0.5 + position.y * 20.0) * 0.05, -${HALF_H.toFixed(1)} + rise * ${(HALF_H * 2).toFixed(1)}, 3.0);
        vAlpha = sin(rise * 3.14159);                                     // fade in, then out
        gl_PointSize = (1.0 + step(0.6, position.z)) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vAlpha; void main() { gl_FragColor = vec4(uColor, vAlpha * 0.7); }`,
  });
  const sparks = new Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  scene.add(sparks);

  let halfW = 1;
  const applyTheme = () => {
    sparkMat.uniforms.uColor.value = cssColor("--star");
  };
  const resize = () => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL));
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(w, h, false);
    halfW = HALF_H * (w / h);
    camera.left = -halfW;
    camera.right = halfW;
    camera.updateProjectionMatrix();
    sparkMat.uniforms.uHalfW.value = halfW;
    sparkMat.uniforms.uPx.value = Math.max(1, Math.round(h / 110));
  };

  let ring = 0; // current ring rotation
  let orbit = 0; // logo orbit angle
  let first = true;
  const draw = (dt: number) => {
    const still = paused();
    if (!still) {
      uTime.value += dt;
      ring += dt * TURN;
      orbit += dt * 0.4;
    }
    const t = uTime.value;
    const sel = selected();
    const hot = hovered();
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const toX = (wx: number) => ((wx / halfW + 1) / 2) * W;
    const toY = (wy: number) => ((1 - wy / HALF_H) / 2) * H;
    const rx = Math.min(halfW * 0.8, 4.4);
    const ease = first ? 1 : 0.07;
    first = false;

    crystals.forEach((c, i) => {
      // Ring slot, or the middle of the stage for the selected one.
      const a = ring + (i * Math.PI * 2) / crystals.length;
      const depth = Math.sin(a); // 1 = nearest
      const picked = i === sel;
      const tx = picked ? 0 : Math.cos(a) * rx;
      const ty = picked ? 0.05 : RING_Y - depth * 0.42;
      const ts = picked ? 2.3 : 0.72 + ((depth + 1) / 2) * 0.5;
      c.x += (tx - c.x) * ease;
      c.y += (ty - c.y) * ease;
      c.s += (ts - c.s) * ease;
      c.d += ((picked ? 1.6 : depth) - c.d) * ease;
      c.uLift.value += ((picked || i === hot ? 1 : 0) - c.uLift.value) * 0.1;

      const bob = Math.sin(t * 0.7 + i * 0.9) * 0.05;
      c.body.position.set(c.x, c.y + bob, c.d);
      c.body.scale.set(c.s, c.s * 1.55, c.s);
      // Each crystal leans and turns on its own rhythm, so no two move alike.
      c.body.rotation.set(Math.sin(t * 0.4 + i) * 0.22, t * (picked ? 0.5 : 0.3) + i, 0.16 + Math.sin(t * 0.5 + i * 1.3) * 0.26);
      c.glow.position.set(c.x, c.y + bob, c.d - 0.3);
      c.glow.scale.setScalar(c.s);

      // The tab button rides on its crystal: that is what makes each crystal clickable and focusable.
      const el = tabs[i];
      if (el) {
        el.style.transform = `translate(${toX(c.x).toFixed(1)}px, ${toY(c.y + bob).toFixed(1)}px) translate(-50%, -50%) scale(${Math.min(c.s, 1.25).toFixed(3)})`;
        el.style.zIndex = String(40 + Math.round(c.d * 5));
        // Only the front half of the ring is labelled, so labels never pile up or hide behind a crystal.
        // The picked one is named by the panel heading below.
        el.style.opacity = picked ? "0" : Math.min(1, Math.max(0, c.d * 2)).toFixed(2);
        el.style.pointerEvents = picked ? "none" : ""; // the middle one is already selected; let its logos take the pointer
      }
    });

    // Logos of the selected category circle the middle crystal, passing in front of and behind it.
    const mid = crystals[sel];
    const list = tiles();
    list.forEach((el, j) => {
      const a = orbit + (j * Math.PI * 2) / list.length;
      const front = Math.sin(a);
      el.style.transform = `translate(${toX(mid.x + Math.cos(a) * 1.45).toFixed(1)}px, ${toY(mid.y - front * 0.34).toFixed(1)}px) translate(-50%, -50%) scale(${(0.85 + front * 0.15).toFixed(3)})`;
      el.style.zIndex = front > 0 ? "60" : "10"; // canvas at 20, crystal buttons at 35-48: front logos stay hoverable
      el.style.opacity = (0.8 + front * 0.2).toFixed(2);
    });

    renderer.render(scene, camera);
  };

  let frame = 0;
  let visible = false;
  let last = performance.now();
  const loop = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return; // nothing is drawn while the section is off-screen
    draw(Math.min(now - last, 100) / 1000);
    last = now;
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };

  applyTheme();
  resize();
  const offTheme = onThemeChange(applyTheme);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", kick);

  return () => {
    cancelAnimationFrame(frame);
    offTheme();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", kick);
    crystalGeo.dispose();
    glowGeo.dispose();
    sparkGeo.dispose();
    sparkMat.dispose();
    crystals.forEach((c) => {
      c.body.material.dispose();
      c.glow.material.dispose();
    });
    renderer.dispose();
  };
}
