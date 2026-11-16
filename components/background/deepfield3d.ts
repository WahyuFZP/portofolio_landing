import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  DirectionalLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  OrthographicCamera,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { onThemeChange } from "@/lib/scene";
import { buildLandmark, landmarkIds, type Palette } from "./landmarks";

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

// Sprites, one char per pixel: # body, o glass/dome, * lights.
const UFO = ["......oooo......", ".....oooooo.....", "....oooooooo....", "..############..", ".##*##*##*##*##.", "################", "..############..", "....##....##...."];
const ROCK = ["..####..", ".######.", "###.####", "########", "####.###", "########", ".######.", "..###..."];
const GUARDIAN = [".....##.....", ".....##.....", "....#oo#....", "....#oo#....", "...######...", "..########..", ".##########.", "############", "##.##**##.##", "#...#**#...#", "....*..*....", "............"];

/** 32x16 atlas: UFO at (0,0), asteroid at (0,8), guardian ship at (16,0). The red channel carries the palette index. */
function spriteAtlas(): DataTexture {
  const W = 32;
  const data = new Uint8Array(W * 16 * 4);
  const put = (rows: string[], ox: number, oy: number) =>
    rows.forEach((row, y) =>
      [...row].forEach((c, x) => {
        const idx = " #o*".indexOf(c);
        if (idx > 0) data.set([idx * 60, 0, 0, 255], ((oy + y) * W + ox + x) * 4);
      }),
    );
  put(UFO, 0, 0);
  put(ROCK, 0, 8);
  put(GUARDIAN, 16, 0);
  const tex = new DataTexture(data, W, 16, RGBAFormat);
  tex.magFilter = tex.minFilter = NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

// Actor slots in one Points object (kind: 0 UFO, 1 rock, 2 debris, 3 guardian).
const UFOS = 3;
const ROCKS = 3;
const BLASTS = 2;
const DEBRIS = 8; // per blast
const GUARD = UFOS;
const ROCK0 = GUARD + 1;
const DEBRIS0 = ROCK0 + ROCKS;
const ACTORS = DEBRIS0 + BLASTS * DEBRIS;

/**
 * Page background: pixel dust at different depths, three dithered planets, UFOs that cross the sky from
 * random directions, a guardian ship that shoots down meteoroids, and one 3D object beside each section.
 * Returns a cleanup function.
 */
export function startDeepField(canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.autoClear = false; // two passes per frame: sky (clip space), then section objects (orthographic)
  const scene = new Scene();
  const camera = new Camera(); // identity: the sky shaders write clip space directly

  // Uniform objects shared by all sky materials, so one write updates every layer.
  const shared = {
    uScroll: { value: 0 },
    uTime: { value: 0 },
    uPointer: { value: [0, 0] },
    uPx: { value: 1 },
    uAlpha: { value: 1 },
    uStar: { value: new Color() },
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
    `uniform vec3 uStar; uniform vec3 uAccent; uniform float uAlpha;
     varying float vTint; varying float vDepth;
     void main() { gl_FragColor = vec4(mix(uStar, uAccent, vTint), (0.3 + vDepth * 0.5) * uAlpha); }`,
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

  // ---- Actors: UFOs, guardian ship, meteoroids, debris ----
  const aPos = new Float32Array(ACTORS * 3);
  const aSize = new Float32Array(ACTORS);
  const aKind = new Float32Array(ACTORS).fill(2);
  const aAlpha = new Float32Array(ACTORS);
  aKind.fill(0, 0, UFOS);
  aKind[GUARD] = 3;
  aKind.fill(1, ROCK0, ROCK0 + ROCKS);
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
       vec2 pc = gl_PointCoord; vec2 cell;
       if (vKind < 0.5) {                                        // UFO: 16x8 inside a square quad
         vec2 t = vec2(pc.x * 16.0, pc.y * 16.0 - 4.0);
         if (t.y < 0.0 || t.y >= 8.0) discard;
         cell = floor(t);
       } else if (vKind < 1.5) { cell = floor(pc * 8.0) + vec2(0.0, 8.0);   // meteoroid
       } else if (vKind < 2.5) { gl_FragColor = vec4(uWarm, a); return;      // debris
       } else { cell = floor(pc * 12.0) + vec2(16.0, 0.0); }                 // guardian ship
       float idx = floor(texture2D(uAtlas, (cell + 0.5) / vec2(32.0, 16.0)).r * 255.0 / 60.0 + 0.5);
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

  // ---- Sky traffic ----
  const ufos = Array.from({ length: UFOS }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, age: 0 }));
  const rocks = Array.from({ length: ROCKS }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0 }));
  const blasts = Array.from({ length: BLASTS }, () => ({ at: -10, x: 0, y: 0 }));
  const HOME = { x: 0.78, y: -0.72 };
  const guard = { x: HOME.x, y: HOME.y, shotAt: -10 };
  const next = { ufo: 2, rock: 3 };
  aAlpha[GUARD] = 1;
  aSize[GUARD] = 24; // 12 sprite px at 2x

  // A UFO enters from a random edge and heads for a random point on the far side.
  const spawnUfo = () => {
    const u = ufos.find((o) => !o.on);
    if (!u) return;
    const edge = Math.floor(Math.random() * 4);
    const along = Math.random() * 1.6 - 0.8;
    const [x, y] = [[-1.15, along], [1.15, along], [along, 1.15], [along, -1.15]][edge];
    const [tx, ty] = [[1.15, Math.random() * 1.6 - 0.8], [-1.15, Math.random() * 1.6 - 0.8], [Math.random() * 1.6 - 0.8, -1.15], [Math.random() * 1.6 - 0.8, 1.15]][edge];
    const len = Math.hypot(tx - x, ty - y);
    const speed = 0.3 + Math.random() * 0.2;
    Object.assign(u, { on: true, x, y, vx: ((tx - x) / len) * speed, vy: ((ty - y) / len) * speed, age: 0 });
  };
  const spawnRock = () => {
    const r = rocks.find((o) => !o.on);
    if (!r) return;
    Object.assign(r, { on: true, x: Math.random() * 1.7 - 0.85, y: 1.15, vx: Math.random() * 0.14 - 0.07, vy: -(0.09 + Math.random() * 0.07) });
    aSize[ROCK0 + rocks.indexOf(r)] = 12 + Math.floor(Math.random() * 3) * 4;
  };

  const stepSky = (t: number, dt: number) => {
    if (t >= next.ufo) {
      spawnUfo();
      next.ufo = t + 4 + Math.random() * 2; // about every 5 s
    }
    if (t >= next.rock) {
      spawnRock();
      next.rock = t + 3 + Math.random() * 2;
    }

    ufos.forEach((u, i) => {
      if (u.on) {
        u.age += dt;
        u.x += u.vx * dt;
        u.y += u.vy * dt;
        if (u.age > 1 && (Math.abs(u.x) > 1.2 || Math.abs(u.y) > 1.2)) u.on = false;
      }
      aAlpha[i] = u.on ? 1 : 0;
      aSize[i] = 32; // 16 sprite px at 2x
      aPos.set([u.x, u.y + Math.sin(t * 2.5 + i) * 0.012, 0], i * 3);
    });

    rocks.forEach((r, i) => {
      if (r.on) {
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        if (r.y < -1.2 || Math.abs(r.x) > 1.2) r.on = false;
      }
      aAlpha[ROCK0 + i] = r.on ? 1 : 0;
      aPos.set([r.x, r.y, 0], (ROCK0 + i) * 3);
    });

    // Guardian: slides under the lowest meteoroid on screen, fires when lined up, otherwise returns home.
    const target = rocks.filter((r) => r.on && r.y < 0.95 && r.y > guard.y + 0.15).sort((a, b) => a.y - b.y)[0];
    const goalX = target ? target.x : HOME.x;
    const goalY = target ? Math.max(-0.85, Math.min(0.4, target.y - 0.4)) : HOME.y;
    const ease = Math.min(1, dt * 1.8);
    guard.x += (goalX - guard.x) * ease;
    guard.y += (goalY - guard.y) * ease;
    aPos.set([guard.x, guard.y + Math.sin(t * 1.7) * 0.008, 0], GUARD * 3);

    if (target && Math.abs(guard.x - target.x) < 0.035 && t - guard.shotAt > 0.9) {
      guard.shotAt = t;
      target.on = false;
      laserPos.set([guard.x, guard.y + 0.05, 0, target.x, target.y, 0]);
      laserGeo.attributes.position.needsUpdate = true;
      const blast = blasts.reduce((a, b) => (a.at < b.at ? a : b)); // reuse the oldest slot
      Object.assign(blast, { at: t, x: target.x, y: target.y });
    }
    laser.visible = t - guard.shotAt < 0.16;

    blasts.forEach((b, bi) => {
      const age = t - b.at;
      for (let i = 0; i < DEBRIS; i++) {
        const slot = DEBRIS0 + bi * DEBRIS + i;
        const ang = (i / DEBRIS) * Math.PI * 2 + 0.4;
        const reach = 0.02 + age * (0.1 + (i % 3) * 0.04);
        aPos.set([b.x + Math.cos(ang) * reach, b.y + Math.sin(ang) * reach * 1.6, 0], slot * 3);
        aSize[slot] = age < 0.25 ? 3 : 2;
        aAlpha[slot] = age < 0.8 ? 1 - age / 0.8 : 0;
      }
    });

    for (const name of ["position", "aSize", "aAlpha"]) actorGeo.attributes[name].needsUpdate = true;
  };

  // ---- Section objects: one lit low-poly model beside each section, in a second (orthographic) pass ----
  const objScene = new Scene();
  const ortho = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const sun = new DirectionalLight(0xffffff, 2.4);
  sun.position.set(-1, 1.2, 1.5);
  objScene.add(sun, new AmbientLight(0xffffff, 0.9));
  const pal: Palette = {
    body: new MeshLambertMaterial({ flatShading: true, transparent: true }),
    accent: new MeshLambertMaterial({ flatShading: true, transparent: true }),
    cyan: new MeshLambertMaterial({ flatShading: true, transparent: true }),
    warm: new MeshLambertMaterial({ flatShading: true, transparent: true }),
  };
  const landmarks = landmarkIds.map((id, i) => {
    const group = buildLandmark(id, pal);
    group.visible = false;
    objScene.add(group);
    return { id, group, side: i % 2 ? -1 : 1, top: 0, found: false };
  });
  // Section positions in page coordinates; re-measured when the page height changes.
  const measure = () => {
    for (const l of landmarks) {
      const el = document.getElementById(l.id);
      l.found = !!el;
      if (el) l.top = el.getBoundingClientRect().top + window.scrollY;
    }
  };
  const stepObjects = (t: number, scrollPx: number) => {
    const aspect = ortho.right;
    const narrow = window.innerWidth < 1200;
    for (const l of landmarks) {
      const y = 1 - (2 * (l.top + 220 - scrollPx)) / window.innerHeight; // anchored near the section heading
      l.group.visible = l.found && Math.abs(y) < 1.4;
      if (!l.group.visible) continue;
      l.group.position.set(l.side * (aspect - (narrow ? 0.16 : 0.27)), y + Math.sin(t * 0.6 + l.top) * 0.02, 0);
      l.group.rotation.set(0.35 + Math.sin(t * 0.4) * 0.1, t * 0.25 + scrollPx * 0.0025, 0.12);
      l.group.scale.setScalar(narrow ? 0.11 : 0.17);
    }
  };

  const applyTheme = () => {
    shared.uStar.value = cssColor("--star");
    shared.uAccent.value = cssColor("--node-1");
    shared.uCyan.value = cssColor("--node-2");
    shared.uBody.value = cssColor("--node-3");
    shared.uWarm.value = cssColor("--warm");
    shared.uSky.value = cssColor("--bg");
    laserMat.color = cssColor("--node-2");
    // Dark shapes on a light page read much stronger than light shapes on dark, so the light theme is dimmed in CSS.
    const alpha = Number(getComputedStyle(document.documentElement).getPropertyValue("--field-alpha")) || 1;
    shared.uAlpha.value = alpha;
    pal.body.color = cssColor("--node-3");
    pal.accent.color = cssColor("--node-1");
    pal.cyan.color = cssColor("--node-2");
    pal.warm.color = cssColor("--warm");
    for (const m of Object.values(pal)) m.opacity = Math.max(alpha, 0.6);
  };
  const resize = () => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL));
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(w, h, false);
    shared.uPx.value = Math.max(1, Math.round(h / 400));
    ortho.left = -w / h;
    ortho.right = w / h;
    ortho.updateProjectionMatrix();
    measure();
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
    stepSky(shared.uTime.value, dt);
    stepObjects(shared.uTime.value, scroll);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(objScene, ortho);
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
  const pageRo = new ResizeObserver(measure); // sections move when content above them loads
  pageRo.observe(document.body);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", kick);
  kick();

  return () => {
    cancelAnimationFrame(frame);
    offTheme();
    ro.disconnect();
    pageRo.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", kick);
    for (const g of [dustGeo, planetGeo, actorGeo, laserGeo]) g.dispose();
    for (const m of [dustMat, planetMat, actorMat, laserMat, ...Object.values(pal)]) m.dispose();
    objScene.traverse((o) => o instanceof Mesh && o.geometry.dispose());
    atlas.dispose();
    renderer.dispose();
  };
}
