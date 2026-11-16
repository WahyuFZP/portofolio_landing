import { BufferAttribute, BufferGeometry, Camera, Color, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { cssColor } from "@/components/hero/constellation3d";
import { onThemeChange } from "@/lib/scene";

const PIXEL = 2; // same half-resolution pixel look as the hero scene
const COUNT = 600;

// Small seeded PRNG so the field looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sparse pixel dust at different depths. Depth is faked in the vertex shader (no camera):
 * near dots are bigger, brighter, and move further per scroll/pointer step, which reads as parallax.
 * Returns a cleanup function.
 */
export function startDeepField(canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);

  const rand = mulberry32(7);
  const pos = new Float32Array(COUNT * 3); // x, y in clip space (-1..1), z = depth 0 (far) .. 1 (near)
  const tint = new Float32Array(COUNT); // 1 = accent dot, 0 = neutral dot
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = rand() * 2 - 1;
    pos[i * 3 + 1] = rand() * 2 - 1;
    pos[i * 3 + 2] = rand() ** 2; // most dots are far away
    tint[i] = rand() < 0.12 ? 1 : 0;
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("tint", new BufferAttribute(tint, 1));

  const mat = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: {
      uScroll: { value: 0 },
      uTime: { value: 0 },
      uPointer: { value: [0, 0] },
      uPx: { value: 1 },
      uNeutral: { value: new Color() },
      uAccent: { value: new Color() },
      uAlpha: { value: 1 },
    },
    vertexShader: `
      attribute float tint;
      uniform float uScroll; uniform float uTime; uniform vec2 uPointer; uniform float uPx;
      varying float vTint; varying float vDepth;
      void main() {
        float d = position.z;
        float speed = 0.15 + d * 0.85;                       // near dots travel further
        float y = position.y + uScroll * speed + uTime * 0.01 * speed;
        y = mod(y + 1.0, 2.0) - 1.0;                         // wrap: the field never runs out
        float x = position.x + sin(uTime * 0.05 + position.y * 6.0) * 0.004 - uPointer.x * 0.03 * d;
        vTint = tint; vDepth = d;
        gl_PointSize = (1.0 + floor(d * 2.5)) * uPx;
        gl_Position = vec4(x, y + uPointer.y * 0.03 * d, 0.0, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uNeutral; uniform vec3 uAccent; uniform float uAlpha;
      varying float vTint; varying float vDepth;
      void main() { gl_FragColor = vec4(mix(uNeutral, uAccent, vTint), (0.25 + vDepth * 0.45) * uAlpha); }`,
  });

  const scene = new Scene();
  const points = new Points(geo, mat);
  points.frustumCulled = false; // positions are already in clip space
  scene.add(points);
  const camera = new Camera(); // identity: the shader writes clip space directly

  const applyTheme = () => {
    mat.uniforms.uNeutral.value = cssColor("--edge");
    mat.uniforms.uAccent.value = cssColor("--node-1");
    // Dark dots on a light page read much stronger than light dots on dark, so the light theme is dimmed in CSS.
    mat.uniforms.uAlpha.value = Number(getComputedStyle(document.documentElement).getPropertyValue("--field-alpha")) || 1;
  };
  const resize = () => {
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(Math.max(1, Math.ceil(canvas.clientWidth / PIXEL)), h, false);
    mat.uniforms.uPx.value = Math.max(1, Math.round(h / 400));
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
    const u = mat.uniforms;
    u.uTime.value += Math.min(now - last, 100) / 1000;
    last = now;
    // Eased toward the real scroll position: this is what makes the parallax feel smooth.
    scroll += (window.scrollY - scroll) * 0.08;
    u.uScroll.value = scroll / window.innerHeight;
    u.uPointer.value[0] += (targetX - u.uPointer.value[0]) * 0.04;
    u.uPointer.value[1] += (targetY - u.uPointer.value[1]) * 0.04;
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
    geo.dispose();
    mat.dispose();
    renderer.dispose();
  };
}
