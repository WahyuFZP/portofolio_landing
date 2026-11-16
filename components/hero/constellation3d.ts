import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import type { ConstellationData } from "@/lib/constellation";

const PIXEL = 2; // render at 1/2 resolution, upscaled with image-rendering: pixelated (fine pixels)
const BASE_Z = 3.1;
const BASE_ROT_X = 0.35;
const BASE_ROT_Y = 0.6; // matches the SVG poster's starting angle
const HOVER_RADIUS = 22; // CSS px

const cssColor = (name: string) =>
  new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888888");

interface Options {
  label: HTMLElement; // tooltip element, positioned over the canvas
  onPick: (skillId: string) => void; // click on a skill that has projects
}

/** Starts the scene on `canvas`. Returns a cleanup function. */
export function startConstellation(canvas: HTMLCanvasElement, data: ConstellationData, { label, onPick }: Options): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.z = BASE_Z;
  const group = new Group();
  group.rotation.set(BASE_ROT_X, BASE_ROT_Y, 0);
  group.scale.setScalar(0.6); // eases to 1: intro
  scene.add(group);

  // Points: GL points are squares by default, i.e. pixels.
  const n = data.nodes.length;
  const positions = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const colors = new Float32Array(n * 3);
  data.nodes.forEach((node, i) => {
    positions.set(node.pos, i * 3);
    sizes[i] = node.size;
  });
  const pointGeo = new BufferGeometry();
  pointGeo.setAttribute("position", new BufferAttribute(positions, 3));
  pointGeo.setAttribute("size", new BufferAttribute(sizes, 1));
  pointGeo.setAttribute("color", new BufferAttribute(colors, 3));
  const pointMat = new ShaderMaterial({
    uniforms: { uPx: { value: 1 } },
    vertexShader: `
      attribute float size; attribute vec3 color; varying vec3 vColor; uniform float uPx;
      void main() { vColor = color; gl_PointSize = (size + 1.0) * uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }`,
  });
  group.add(new Points(pointGeo, pointMat));

  const linePos = new Float32Array(data.edges.length * 6);
  data.edges.forEach(([a, b], i) => {
    linePos.set(data.nodes[a].pos, i * 6);
    linePos.set(data.nodes[b].pos, i * 6 + 3);
  });
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new BufferAttribute(linePos, 3));
  const lineMat = new LineBasicMaterial({ transparent: true, opacity: 0.5 });
  group.add(new LineSegments(lineGeo, lineMat));

  let palette: Color[] = [];
  let highlight = new Color();
  const paint = (hovered: number) => {
    data.nodes.forEach((node, i) => (i === hovered ? highlight : palette[node.color - 1]).toArray(colors, i * 3));
    sizes.forEach((_, i) => (sizes[i] = data.nodes[i].size + (i === hovered ? 2 : 0)));
    pointGeo.attributes.color.needsUpdate = true;
    pointGeo.attributes.size.needsUpdate = true;
  };
  const applyTheme = () => {
    palette = [cssColor("--node-1"), cssColor("--node-2"), cssColor("--node-3")];
    highlight = cssColor("--text");
    lineMat.color = cssColor("--edge");
    paint(hovered);
  };

  const resize = () => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL));
    const h = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    pointMat.uniforms.uPx.value = Math.max(1, Math.round(h / 90));
  };

  // --- Interaction: drag to rotate, hover for the skill name, click to filter projects. ---
  let hovered = -1;
  let mouse: { x: number; y: number } | null = null; // canvas-local CSS px
  let parallaxX = 0;
  let parallaxY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let drag: { x: number; y: number; moved: number } | null = null;
  const v = new Vector3();

  const findHovered = () => {
    if (!mouse || drag) return -1;
    let best = -1;
    let bestD = HOVER_RADIUS;
    for (let i = 0; i < n; i++) {
      v.fromArray(data.nodes[i].pos).applyMatrix4(group.matrixWorld).project(camera);
      if (v.z > 1) continue;
      const d = Math.hypot(((v.x + 1) / 2) * canvas.clientWidth - mouse.x, ((1 - v.y) / 2) * canvas.clientHeight - mouse.y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };
  const showLabel = () => {
    if (hovered < 0 || !mouse) {
      label.hidden = true;
      canvas.style.cursor = drag ? "grabbing" : "grab";
      return;
    }
    label.hidden = false;
    label.textContent = data.nodes[hovered].name;
    label.style.transform = `translate(${Math.round(mouse.x + 12)}px, ${Math.round(mouse.y - 28)}px)`;
    canvas.style.cursor = data.nodes[hovered].linked ? "pointer" : "grab";
  };

  const onWindowPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    parallaxX = (e.clientY / window.innerHeight - 0.5) * 0.3;
    parallaxY = (e.clientX / window.innerWidth - 0.5) * 0.4;
  };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY, moved: drag.moved + Math.abs(dx) + Math.abs(dy) };
      dragYaw += dx * 0.008;
      dragPitch = Math.max(-1, Math.min(1, dragPitch + dy * 0.008));
    }
  };
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  };
  const onUp = () => {
    const wasClick = drag && drag.moved < 5;
    drag = null;
    if (wasClick && hovered >= 0 && data.nodes[hovered].linked) onPick(data.nodes[hovered].id);
  };
  const onLeave = () => {
    mouse = null;
  };
  const onScroll = () => {
    camera.position.z = BASE_Z + Math.min(window.scrollY / 700, 1) * 1.2;
  };

  let visible = true;
  let frame = 0;
  let spin = 0;
  const loop = () => {
    frame = 0;
    if (!visible || document.hidden) return; // paused: no frames while off-screen or in a background tab
    if (!drag && hovered < 0) spin += 0.002; // hold still while the user inspects a node
    group.rotation.y += (BASE_ROT_Y + spin + dragYaw + parallaxY - group.rotation.y) * 0.08;
    group.rotation.x += (BASE_ROT_X + dragPitch + parallaxX - group.rotation.x) * 0.08;
    group.scale.setScalar(group.scale.x + (1 - group.scale.x) * 0.06);
    group.updateMatrixWorld();

    const next = findHovered();
    if (next !== hovered) {
      hovered = next;
      paint(hovered);
    }
    showLabel();

    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop);
  };

  applyTheme();
  resize();
  canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  // Theme can change from the OS or from the navbar toggle (html[data-theme]).
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", applyTheme);
  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  window.addEventListener("pointermove", onWindowPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", kick);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onLeave);
  kick();

  return () => {
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    scheme.removeEventListener("change", applyTheme);
    window.removeEventListener("pointermove", onWindowPointer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", kick);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("pointerleave", onLeave);
    pointGeo.dispose();
    pointMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
    renderer.dispose();
  };
}
