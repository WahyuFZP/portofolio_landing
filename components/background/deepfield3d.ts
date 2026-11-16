import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  LineBasicMaterial,
  LineSegments,
  NearestFilter,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { onThemeChange } from "@/lib/scene";

const PIXEL = 2; // same half-resolution pixel look as the hero scene
const DUST = 600;

// Small seeded PRNG so the star field looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 4x4 ordered dither (arithmetic form: no arrays, works in every GLSL version).
const BAYER = `
  float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  float bayer4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }`;

// Planets: x, y (clip space), scroll speed, diameter (low-res px), kind (0 gas / 1 ringed / 2 rocky).
// They sit near the screen edges so they frame the content instead of sitting under the text.
const PLANETS = [
  [0.9, 0.5, 0.12, 120, 0],
  [-0.92, -0.45, 0.2, 96, 1],
  [0.6, -1.15, 0.3, 30, 2],
] as const;

// Sprites, one char per pixel: # body, o dome, * lights.
const UFO = ["......oooo......", ".....oooooo.....", "....oooooooo....", "..############..", ".##*##*##*##*##.", "################", "..############..", "....##....##...."];
const ROCK = ["..####..", ".######.", "###.####", "########", "####.###", "########", ".######.", "..###..."];

/** 16x16 atlas: UFO in rows 0-7, asteroid at (0, 8). The red channel carries the palette index. */
function spriteAtlas(): DataTexture {
  const data = new Uint8Array(16 * 16 * 4);
  const put = (rows: string[], oy: number) =>
    rows.forEach((row, y) =>
      [...row].forEach((c, x) => {
        const idx = " #o*".indexOf(c);
        if (idx > 0) data.set([idx * 60, 0, 0, 255], ((oy + y) * 16 + x) * 4);
      }),
    );
  put(UFO, 0);
  put(ROCK, 8);
  const tex = new DataTexture(data, 16, 16, RGBAFormat);
  tex.magFilter = tex.minFilter = NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

// Actor slots in one Points object: 0 = UFO, 1 = asteroid, 2..9 = debris.
const ACTORS = 10;
const DEBRIS = 8;

/**
 * Page background: pixel dust at different depths, three dithered planets, and now and then
 * a UFO that crosses the sky and shoots an asteroid. Depth is faked in the shaders (no camera).
 * Returns a cleanup function.
 */
export function startDeepField(canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  const scene = new Scene();
  const camera = new Camera(); // identity: every shader writes clip space directly

  // Uniform objects shared by all materials, so one write updates every layer.
  const shared = {
    uScroll: { value: 0 },
    uTime: { value: 0 },
    uPointer: { value: [0, 0] },
    uPx: { value: 1 },
    uAlpha: { value: 1 },
    uNeutral: { value: new Color() },
    uAccent: { value: new Color() },
    uCyan: { value: new Color() },
    uWarm: { value: new Color() },
    uBody: { value: new Color() },
    uSky: { value: new Color() },
  };
  const material = (vertexShader: string, fragmentShader: string, extra = {}) =>
    new ShaderMaterial({ transparent: true, depthTest: false, uniforms: { ...shared, ...extra }, vertexShader, fragmentShader });
  const layer = (geo: BufferGeometry, mat: ShaderMaterial, order: number) => {
    const pts = new Points(geo, mat);
    pts.frustumCulled = false; // positions are already in clip space
    pts.renderOrder = order;
    scene.add(pts);
    return pts;
  };

  // ---- Dust ----
  const rand = mulberry32(7);
  const dustPos = new Float32Array(DUST * 3); // x, y in clip space, z = depth 0 (far) .. 1 (near)
  const dustTint = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos.set([rand() * 2 - 1, rand() * 2 - 1, rand() ** 2], i * 3); // squared: most dots are far away
    dustTint[i] = rand() < 0.12 ? 1 : 0;
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("tint", new BufferAttribute(dustTint, 1));
  const dustMat = material(
    `attribute float tint;
     uniform float uScroll; uniform float uTime; uniform vec2 uPointer; uniform float uPx;
     varying float vTint; varying float vDepth;
     void main() {
       float d = position.z;
       float speed = 0.15 + d * 0.85;                        // near dots travel further
       float y = mod(position.y + uScroll * speed + uTime * 0.01 * speed + 1.0, 2.0) - 1.0;
       float x = position.x + sin(uTime * 0.05 + position.y * 6.0) * 0.004 - uPointer.x * 0.03 * d;
       vTint = tint; vDepth = d;
       gl_PointSize = (1.0 + floor(d * 2.5)) * uPx;
       gl_Position = vec4(x, y + uPointer.y * 0.03 * d, 0.0, 1.0);
     }`,
    `uniform vec3 uNeutral; uniform vec3 uAccent; uniform float uAlpha;
     varying float vTint; varying float vDepth;
     void main() { gl_FragColor = vec4(mix(uNeutral, uAccent, vTint), (0.25 + vDepth * 0.45) * uAlpha); }`,
  );
  layer(dustGeo, dustMat, 0);

  // ---- Planets: lit spheres drawn inside point quads, shaded in 4 dithered steps ----
  const planetGeo = new BufferGeometry();
  planetGeo.setAttribute("position", new BufferAttribute(new Float32Array(PLANETS.flatMap((p) => [p[0], p[1], p[2]])), 3));
  planetGeo.setAttribute("aSize", new BufferAttribute(new Float32Array(PLANETS.map((p) => p[3])), 1));
  planetGeo.setAttribute("aKind", new BufferAttribute(new Float32Array(PLANETS.map((p) => p[4])), 1));
  const planetMat = material(
    `attribute float aSize; attribute float aKind;
     uniform float uScroll; uniform vec2 uPointer; uniform float uPx;
     varying float vKind;
     void main() {
       float speed = position.z;
       float y = mod(position.y + uScroll * speed + 1.6, 3.2) - 1.6;  // leaves the screen fully before wrapping
       vKind = aKind;
       gl_PointSize = aSize * uPx;
       gl_Position = vec4(position.x - uPointer.x * 0.02, y + uPointer.y * 0.02, 0.0, 1.0);
     }`,
    `uniform vec3 uAccent; uniform vec3 uCyan; uniform vec3 uWarm; uniform vec3 uBody; uniform vec3 uSky; uniform float uAlpha;
     varying float vKind;
     ${BAYER}
     void main() {
       vec2 uv = gl_PointCoord * 2.0 - 1.0; uv.y = -uv.y;
       bool ringed = vKind > 0.5 && vKind < 1.5;
       vec2 p = uv / (ringed ? 0.58 : 0.96);                 // ringed planets leave room for the ring
       float r2 = dot(p, p);
       float ring = length(vec2(uv.x, uv.y * 3.4));
       bool onRing = ringed && ring > 0.74 && ring < 0.98;
       if (onRing && (r2 > 1.0 || uv.y < 0.0)) {              // ring passes in front on the lower half
         gl_FragColor = vec4(uCyan, 0.55 * uAlpha); return;
       }
       if (r2 > 1.0) discard;
       vec3 n = vec3(p, sqrt(1.0 - r2));
       float lit = clamp(dot(n, normalize(vec3(-0.55, 0.6, 0.58))), 0.0, 1.0);
       if (vKind < 1.5) lit *= 0.82 + 0.18 * sin(p.y * 9.0 + sin(p.x * 3.0) * 1.5);   // gas bands
       else lit *= 1.0 - 0.22 * step(0.72, fract(sin(dot(floor(p * 5.0), vec2(12.9898, 78.233))) * 43758.5453)); // craters
       float level = clamp(floor(lit * 4.0 + bayer4(gl_FragCoord.xy)) / 4.0, 0.0, 1.0);
       vec3 base = vKind < 0.5 ? uAccent : (vKind < 1.5 ? uWarm : uBody);
       gl_FragColor = vec4(mix(uSky, base, level), 0.85 * uAlpha);   // night side fades into the sky
     }`,
  );
  layer(planetGeo, planetMat, 1);

  // ---- Actors: UFO, asteroid, debris ----
  const aPos = new Float32Array(ACTORS * 3);
  const aSize = new Float32Array(ACTORS);
  const aKind = new Float32Array(ACTORS).fill(2);
  const aAlpha = new Float32Array(ACTORS);
  aKind[0] = 0;
  aKind[1] = 1;
  const actorGeo = new BufferGeometry();
  actorGeo.setAttribute("position", new BufferAttribute(aPos, 3));
  actorGeo.setAttribute("aSize", new BufferAttribute(aSize, 1));
  actorGeo.setAttribute("aKind", new BufferAttribute(aKind, 1));
  actorGeo.setAttribute("aAlpha", new BufferAttribute(aAlpha, 1));
  const atlas = spriteAtlas();
  const actorMat = material(
    `attribute float aSize; attribute float aKind; attribute float aAlpha;
     uniform float uPx;
     varying float vKind; varying float vAlpha;
     void main() { vKind = aKind; vAlpha = aAlpha; gl_PointSize = aSize * uPx; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    `uniform sampler2D uAtlas; uniform vec3 uBody; uniform vec3 uCyan; uniform vec3 uWarm; uniform float uAlpha;
     varying float vKind; varying float vAlpha;
     void main() {
       if (vAlpha <= 0.0) discard;
       float a = vAlpha * max(uAlpha, 0.75);
       if (vKind > 1.5) { gl_FragColor = vec4(uWarm, a); return; }          // debris
       vec2 t = vKind < 0.5 ? vec2(gl_PointCoord.x * 16.0, gl_PointCoord.y * 16.0 - 4.0) : gl_PointCoord * 8.0;
       if (t.y < 0.0 || t.y >= 8.0) discard;                                 // UFO is 16x8 inside a square quad
       vec2 cell = floor(t) + vec2(0.0, vKind < 0.5 ? 0.0 : 8.0);
       float idx = floor(texture2D(uAtlas, (cell + 0.5) / 16.0).r * 255.0 / 60.0 + 0.5);
       if (idx < 0.5) discard;
       gl_FragColor = vec4(idx < 1.5 ? uBody : (idx < 2.5 ? uCyan : uWarm), a);
     }`,
    { uAtlas: { value: atlas } },
  );
  layer(actorGeo, actorMat, 2);

  const laserPos = new Float32Array(6);
  const laserGeo = new BufferGeometry();
  laserGeo.setAttribute("position", new BufferAttribute(laserPos, 3));
  const laserMat = new LineBasicMaterial({ transparent: true, depthTest: false });
  const laser = new LineSegments(laserGeo, laserMat);
  laser.frustumCulled = false;
  laser.renderOrder = 3;
  laser.visible = false;
  scene.add(laser);

  // ---- UFO attack: every 15-25 s a saucer crosses the sky, shoots an asteroid, and leaves ----
  const show = { phase: "idle" as "idle" | "fly", nextAt: 5, dir: 1, y: 0, x: 0, rockX: 0, rockY: 0, firedAt: -1 };
  const hide = () => {
    aAlpha.fill(0);
    laser.visible = false;
  };
  const stepShow = (t: number, dt: number) => {
    if (show.phase === "idle") {
      if (t < show.nextAt) return;
      Object.assign(show, {
        phase: "fly",
        dir: Math.random() < 0.5 ? 1 : -1,
        y: 0.62 + Math.random() * 0.22, // flight lane just under the navbar, above most of the text
        rockX: Math.random() * 1.2 - 0.6,
        firedAt: -1,
      });
      show.x = -1.15 * show.dir;
      show.rockY = show.y - 0.2 - Math.random() * 0.15;
      aAlpha[0] = aAlpha[1] = 1;
      aSize[0] = 32; // 16 sprite px at 2x
      aSize[1] = 16;
    }

    show.x += show.dir * 0.36 * dt; // ~6 s to cross
    const ufoY = show.y + Math.sin(t * 2.2) * 0.02;
    aPos.set([show.x, ufoY, 0], 0);
    show.rockX -= show.dir * 0.01 * dt; // the asteroid drifts slowly the other way
    aPos.set([show.rockX, show.rockY, 0], 3);

    if (show.firedAt < 0 && (show.x - show.rockX) * show.dir >= 0) {
      show.firedAt = t;
      aAlpha[1] = 0;
      laserPos.set([show.x, ufoY - 0.03, 0, show.rockX, show.rockY, 0]);
      laserGeo.attributes.position.needsUpdate = true;
    }
    if (show.firedAt >= 0) {
      const age = t - show.firedAt;
      laser.visible = age < 0.22;
      for (let i = 0; i < DEBRIS; i++) {
        const ang = (i / DEBRIS) * Math.PI * 2 + 0.4;
        const reach = 0.02 + age * (0.1 + (i % 3) * 0.04);
        aPos.set([show.rockX + Math.cos(ang) * reach, show.rockY + Math.sin(ang) * reach * 1.6, 0], (2 + i) * 3);
        aSize[2 + i] = age < 0.25 ? 3 : 2;
        aAlpha[2 + i] = Math.max(0, 1 - age / 0.8);
      }
    }
    if (Math.abs(show.x) > 1.2 && (show.x > 0) === (show.dir > 0)) {
      hide();
      show.phase = "idle";
      show.nextAt = t + 15 + Math.random() * 10;
    }
    for (const name of ["position", "aSize", "aAlpha"]) actorGeo.attributes[name].needsUpdate = true;
  };

  const applyTheme = () => {
    shared.uNeutral.value = cssColor("--edge");
    shared.uAccent.value = cssColor("--node-1");
    shared.uCyan.value = cssColor("--node-2");
    shared.uBody.value = cssColor("--node-3");
    shared.uWarm.value = cssColor("--warm");
    shared.uSky.value = cssColor("--bg");
    laserMat.color = cssColor("--node-2");
    // Dark shapes on a light page read much stronger than light shapes on dark, so the light theme is dimmed in CSS.
    shared.uAlpha.value = Number(getComputedStyle(document.documentElement).getPropertyValue("--field-alpha")) || 1;
  };
  const resize = () => {
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(Math.max(1, Math.ceil(canvas.clientWidth / PIXEL)), h, false);
    shared.uPx.value = Math.max(1, Math.round(h / 400));
  };

  let targetX = 0;
  let targetY = 0;
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    targetX = e.clientX / window.innerWidth - 0.5;
    targetY = e.clientY / window.innerHeight - 0.5;
  };

  let frame = 0;
  let last = performance.now();
  let scroll = window.scrollY;
  const loop = (now: number) => {
    frame = 0;
    if (document.hidden) return; // no frames in a background tab
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    shared.uTime.value += dt;
    // Eased toward the real scroll position: this is what makes the parallax feel smooth.
    scroll += (window.scrollY - scroll) * 0.08;
    shared.uScroll.value = scroll / window.innerHeight;
    shared.uPointer.value[0] += (targetX - shared.uPointer.value[0]) * 0.04;
    shared.uPointer.value[1] += (targetY - shared.uPointer.value[1]) * 0.04;
    stepShow(shared.uTime.value, dt);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (frame || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };

  applyTheme();
  resize();
  const offTheme = onThemeChange(applyTheme);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", kick);
  kick();

  return () => {
    cancelAnimationFrame(frame);
    offTheme();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", kick);
    for (const g of [dustGeo, planetGeo, actorGeo, laserGeo]) g.dispose();
    for (const m of [dustMat, planetMat, actorMat, laserMat]) m.dispose();
    atlas.dispose();
    renderer.dispose();
  };
}
