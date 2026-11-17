import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  OctahedronGeometry,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { onThemeChange } from "@/lib/scene";

const PIXEL = 2; // half-resolution render, upscaled pixelated
const HALF_H = 1.2; // world units from centre to top edge
const SPARKS = 6; // per crystal

// 4x4 ordered dither: turns the few light levels into a smooth-looking ramp without losing the pixel grid.
const BAYER = `
  float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  float bayer4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }`;

export interface CrystalSpec {
  tone: "--node-1" | "--node-2" | "--warm"; // CSS color variable
  tiles: HTMLElement[]; // logo tiles that orbit this crystal
}

/**
 * One floating crystal per skill category, in a row. Soft pixel look: faceted crystals lit in
 * dithered steps, a faint glow behind each, a few rising sparks, and the category's logos in orbit.
 * `hovered()` returns the column under the pointer (or -1); `paused()` freezes time. Returns a cleanup function.
 */
export function startCrystals(canvas: HTMLCanvasElement, specs: CrystalSpec[], hovered: () => number, paused: () => boolean): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, HALF_H, -HALF_H, 0.1, 20);
  camera.position.z = 5;

  const uSky = { value: new Color() };
  const uTime = { value: 0 };

  const crystalGeo = new OctahedronGeometry(0.34);
  const glowGeo = new PlaneGeometry(1.5, 2.0);
  const crystals = specs.map((spec, i) => {
    const uColor = { value: new Color() };
    const uLift = { value: 0 }; // 0..1, eased toward 1 while hovered
    const body = new Mesh(
      crystalGeo,
      new ShaderMaterial({
        uniforms: { uColor, uSky, uTime, uLift, uPhase: { value: i * 1.7 } },
        vertexShader: `
          varying vec3 vView;
          void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
          uniform vec3 uColor; uniform vec3 uSky; uniform float uTime; uniform float uLift; uniform float uPhase;
          varying vec3 vView;
          ${BAYER}
          void main() {
            vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));            // one normal per facet
            float key = max(dot(n, normalize(vec3(-0.5, 0.7, 0.6))), 0.0);
            float rim = pow(1.0 - abs(n.z), 2.0) * 0.35;                     // lighter toward the silhouette
            float pulse = 0.06 * sin(uTime * 1.3 + uPhase) + uLift * 0.18;   // slow breathing, brighter on hover
            float lit = clamp(0.18 + key * 0.72 + rim + pulse, 0.0, 1.0);
            float level = floor(lit * 5.0 + bayer4(gl_FragCoord.xy)) / 5.0;  // 6 steps, dithered between them
            vec3 shade = mix(uSky, uColor, 0.35);
            vec3 col = level < 0.8 ? mix(shade, uColor, level / 0.8) : mix(uColor, vec3(1.0), (level - 0.8) / 0.2 * 0.75);
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    );
    body.scale.y = 1.6;
    const glow = new Mesh(
      glowGeo,
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor, uTime, uLift, uPhase: { value: i * 1.7 } },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          uniform vec3 uColor; uniform float uTime; uniform float uLift; uniform float uPhase;
          varying vec2 vUv;
          ${BAYER}
          void main() {
            float d = length((vUv - 0.5) * vec2(2.0, 1.6));
            float a = smoothstep(1.0, 0.0, d) * (0.3 + 0.06 * sin(uTime * 1.3 + uPhase) + uLift * 0.25);
            a = floor(a * 8.0 + bayer4(gl_FragCoord.xy)) / 8.0;             // stepped falloff keeps it pixel art
            gl_FragColor = vec4(uColor, a);                                  // tinted, so it reads on light and dark
          }`,
      }),
    );
    glow.position.z = -1;
    scene.add(glow, body);
    return { spec, body, glow, uColor, uLift, x: 0 };
  });

  // Sparks: small points that rise beside each crystal and fade; all motion is in the vertex shader.
  const n = specs.length * SPARKS;
  const seed = new Float32Array(n * 3); // crystal index, random a, random b
  for (let i = 0; i < n; i++) seed.set([Math.floor(i / SPARKS), (i * 0.618) % 1, (i * 0.377) % 1], i * 3);
  const sparkGeo = new BufferGeometry();
  sparkGeo.setAttribute("position", new BufferAttribute(seed, 3));
  const sparkMat = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: { uTime, uXs: { value: new Float32Array(16) }, uColor: { value: new Color() }, uPx: { value: 1 } },
    vertexShader: `
      uniform float uTime; uniform float uXs[16]; uniform float uPx;
      varying float vAlpha;
      void main() {
        float rise = fract(position.y + uTime * (0.05 + position.z * 0.05));
        vec3 p = vec3(uXs[int(position.x)] + (position.z - 0.5) * 0.9 + sin(uTime * 0.6 + position.y * 20.0) * 0.04, -0.75 + rise * 1.5, 1.0);
        vAlpha = sin(rise * 3.14159);                                     // fade in, then out
        gl_PointSize = (1.0 + step(0.6, position.y)) * uPx;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vAlpha; void main() { gl_FragColor = vec4(uColor, vAlpha * 0.8); }`,
  });
  const sparks = new Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  scene.add(sparks);

  let halfW = 1;
  const applyTheme = () => {
    uSky.value = cssColor("--bg");
    sparkMat.uniforms.uColor.value = cssColor("--star");
    crystals.forEach((c) => (c.uColor.value = cssColor(c.spec.tone)));
  };
  const resize = () => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL));
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(w, h, false);
    halfW = HALF_H * (w / h);
    camera.left = -halfW;
    camera.right = halfW;
    camera.updateProjectionMatrix();
    sparkMat.uniforms.uPx.value = Math.max(1, Math.round(h / 90));
    // One crystal above the centre of each of the equal columns below.
    crystals.forEach((c, i) => {
      c.x = (-1 + (2 * i + 1) / crystals.length) * halfW;
      sparkMat.uniforms.uXs.value[i] = c.x;
    });
  };

  const draw = (dt: number) => {
    if (!paused()) uTime.value += dt;
    const t = uTime.value;
    const hot = hovered();
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    crystals.forEach((c, i) => {
      c.uLift.value += ((i === hot ? 1 : 0) - c.uLift.value) * 0.1;
      const lift = c.uLift.value;
      const y = 0.12 + Math.sin(t * 0.7 + i * 0.9) * 0.06 + lift * 0.08; // slow bob
      c.body.position.set(c.x, y, 0);
      c.body.rotation.y = t * 0.3 + i; // one turn every ~21 s
      c.body.scale.set(1 + lift * 0.15, 1.6 * (1 + lift * 0.15), 1 + lift * 0.15);
      c.glow.position.set(c.x, y, -1);

      // Logos orbit on a tilted ring. They are DOM tiles (sharp), sorted in front of or behind the canvas.
      c.spec.tiles.forEach((el, j) => {
        const a = t * 0.35 + (j * Math.PI * 2) / c.spec.tiles.length;
        const front = Math.sin(a); // 1 = nearest, -1 = behind the crystal
        const px = ((c.x + Math.cos(a) * 0.62) / halfW + 1) / 2 * W;
        const py = (1 - (y - front * 0.16) / HALF_H) / 2 * H;
        el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -50%) scale(${(0.82 + front * 0.18).toFixed(3)})`;
        el.style.zIndex = front > 0 ? "30" : "10"; // the canvas sits at 20
        el.style.opacity = (0.75 + front * 0.25).toFixed(2);
      });
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
