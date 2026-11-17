import { AmbientLight, BoxGeometry, DirectionalLight, Group, Mesh, MeshLambertMaterial, OrthographicCamera, Scene, WebGLRenderer } from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { buildLandmark, type Palette } from "@/components/background/landmarks";
import { onThemeChange } from "@/lib/scene";

const PIXEL = 2; // half-resolution render, upscaled pixelated (same look as the other scenes)
const HALF_H = 1.25; // world units from centre to top edge
const GROUND = -0.45;
const GATE_YAW = -0.65; // gates are turned toward the viewer; seen edge-on they are just a line

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * "Release pipeline" for the How I work cards, driven by scroll:
 * a feature cube slides along a track through three gates (test scan, security sweep that
 * knocks the bugs off, documentation stamp) and leaves as a rocket.
 * `onStage`: -1 not started, 0..2 the gate the cube is at, 3 shipped. Returns a cleanup function.
 */
export function startPipeline(canvas: HTMLCanvasElement, onStage: (stage: number) => void): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, HALF_H, -HALF_H, 0.1, 30);
  camera.position.set(0, 3.4, 6); // looking down a little, so depth reads
  camera.lookAt(0, 0.15, 0);
  const sun = new DirectionalLight(0xffffff, 2.4);
  sun.position.set(-1, 1.5, 1.5);
  scene.add(sun, new AmbientLight(0xffffff, 0.9));

  const mat = () => new MeshLambertMaterial({ flatShading: true });
  const pal: Palette = { body: mat(), accent: mat(), cyan: mat(), warm: mat() };
  const edge = mat();
  const beamMat = new MeshLambertMaterial({ flatShading: true, transparent: true, opacity: 0.55 });
  const box = (w: number, h: number, d: number, m: MeshLambertMaterial, x = 0, y = 0, z = 0) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    return mesh;
  };

  const track = box(1, 0.06, 0.55, edge, 0, GROUND, 0);
  scene.add(track);

  // Gates sit above the three cards (card centres are at 1/6, 1/2, 5/6 of the width).
  const gates = [0, 1, 2].map(() => {
    const g = new Group();
    const top = box(0.14, 0.12, 1.1, pal.accent, 0, 1.0, 0);
    g.add(box(0.1, 1.5, 0.1, pal.accent, 0, 0.25, 0.5), box(0.1, 1.5, 0.1, pal.accent, 0, 0.25, -0.5), top);
    g.rotation.y = GATE_YAW;
    scene.add(g);
    return { g, top };
  });
  const scan = box(0.05, 1.25, 0.9, beamMat, 0, 0.2, 0); // gate 1: test scanner
  const sweep = box(0.05, 1.25, 0.9, beamMat, 0, 0.2, 0); // gate 2: security sweep
  const stamp = box(0.34, 0.5, 0.34, pal.body); // gate 3: documentation stamp
  scan.rotation.y = sweep.rotation.y = GATE_YAW;
  scene.add(scan, sweep, stamp);

  // The feature: a cube carrying three bugs, sealed after the last gate.
  const cube = new Group();
  const cubeBody = box(0.6, 0.6, 0.6, pal.body);
  const seal = box(0.32, 0.05, 0.32, pal.cyan, 0, 0.33, 0);
  const bugHome: [number, number, number][] = [[0.33, 0.12, 0.1], [-0.1, 0.33, -0.15], [0.05, -0.05, 0.33]];
  const bugs = bugHome.map((p) => box(0.14, 0.14, 0.14, pal.warm, ...p));
  cube.add(cubeBody, seal, ...bugs);
  scene.add(cube);

  const rocket = buildLandmark("experience", pal); // same rocket that floats beside the Experience section
  rocket.rotation.z = -Math.PI / 2; // nose toward +x
  scene.add(rocket);

  let halfW = 1;
  let gateX = [0, 0, 0];
  const applyTheme = () => {
    pal.body.color = cssColor("--node-3");
    pal.accent.color = cssColor("--node-1");
    pal.cyan.color = beamMat.color = cssColor("--node-2");
    pal.warm.color = cssColor("--warm");
    edge.color = cssColor("--edge");
  };
  const resize = () => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL));
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(w, h, false);
    halfW = HALF_H * (w / h);
    camera.left = -halfW;
    camera.right = halfW;
    camera.updateProjectionMatrix();
    gateX = [(-2 * halfW) / 3, 0, (2 * halfW) / 3];
    gates.forEach(({ g }, i) => (g.position.x = gateX[i]));
    track.scale.x = halfW * 2;
    scan.position.x = gateX[0];
    sweep.position.x = gateX[1];
  };

  let p = 0; // eased progress 0..1
  let stage = -2;
  const draw = () => {
    // Progress follows the strip's position: 0 as it enters near the bottom of the viewport, 1 near the top.
    const top = canvas.getBoundingClientRect().top;
    const vh = window.innerHeight;
    const target = clamp01((vh * 0.92 - top) / (vh * 0.72));
    p += (target - p) * 0.1;

    const travel = clamp01(p / 0.84); // the cube uses the first 84%, the launch uses the rest
    const x = -halfW * 0.93 + travel * (gateX[2] + 1.0 + halfW * 0.93);
    const launch = clamp01((p - 0.84) / 0.16);

    cube.position.set(x, GROUND + 0.33 + Math.abs(Math.sin(x * 4)) * 0.03, 0);
    cube.rotation.y = travel * Math.PI;
    cube.scale.setScalar(1 - launch);
    cubeBody.material = x > gateX[0] ? pal.accent : pal.body; // tested = blue

    // Gate 1: scanner beam while the cube is inside.
    scan.visible = Math.abs(x - gateX[0]) < 0.6;
    // Gate 2: sweep beam, then the bugs fly off and shrink away.
    sweep.visible = Math.abs(x - gateX[1]) < 0.6;
    const shed = clamp01((x - gateX[1]) / 1.4);
    bugs.forEach((b, i) => {
      const [hx, hy, hz] = bugHome[i];
      b.position.set(hx * (1 + shed * 5), hy + shed * (1.2 + i * 0.3), hz * (1 + shed * 5));
      b.scale.setScalar(1 - shed);
      b.visible = shed < 1;
    });
    // Gate 3: the stamp drops onto the cube as it passes, and leaves a seal.
    const press = clamp01(1 - Math.abs(x - gateX[2]) / 0.4);
    stamp.position.set(gateX[2], 0.72 - press * 0.36, 0);
    seal.visible = x > gateX[2];

    gates.forEach(({ top: beam }, i) => (beam.material = Math.abs(x - gateX[i]) < 0.6 ? pal.cyan : pal.accent));

    // Launch: the cube becomes the rocket and accelerates out to the right.
    rocket.visible = launch > 0;
    rocket.scale.setScalar(0.7 * clamp01(launch * 3));
    // Starts where the cube stopped and only leaves the frame at the very end of the scroll range.
    rocket.position.set(x + launch * launch * (halfW + 1.2 - x), GROUND + 0.5, 0);
    rocket.rotation.x = p * 6;

    const next = p < 0.02 ? -1 : launch > 0.35 ? 3 : x < (gateX[0] + gateX[1]) / 2 ? 0 : x < (gateX[1] + gateX[2]) / 2 ? 1 : 2;
    if (next !== stage) onStage((stage = next));

    renderer.render(scene, camera);
  };

  let frame = 0;
  let visible = false;
  const loop = () => {
    frame = 0;
    if (!visible || document.hidden) return; // nothing is drawn while the section is off-screen
    draw();
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
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
    scene.traverse((o) => o instanceof Mesh && o.geometry.dispose());
    for (const m of [...Object.values(pal), edge, beamMat]) m.dispose();
    renderer.dispose();
  };
}
