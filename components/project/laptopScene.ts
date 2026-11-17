import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from "three";

const SCREEN_W = 2.9;
const SCREEN_H = SCREEN_W / 1.6; // 16:10
const OPEN = -0.26; // lid angle when open (leaning back a little)
const CLOSED = Math.PI / 2; // lid folded onto the keyboard

/**
 * A real 3D laptop showing `imageUrl` on its screen. The lid opens when it scrolls into view,
 * then it floats and turns slowly; dragging rotates it. Returns a cleanup function.
 */
export function startLaptop(canvas: HTMLCanvasElement, imageUrl: string): () => void {
  // Full resolution here (unlike the pixel scenes): the screenshot has to stay readable.
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 1.9, 7.6);
  camera.lookAt(0, 0.8, 0);
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-2, 3, 4);
  scene.add(sun, new AmbientLight(0xffffff, 1.1));

  const shell = new MeshLambertMaterial({ color: 0x52525b });
  const dark = new MeshLambertMaterial({ color: 0x18181b });
  const screenMat = new MeshBasicMaterial({ color: 0x0a0f1a }); // unlit: the screenshot keeps its own colors

  const laptop = new Group();
  const base = new Mesh(new BoxGeometry(3.2, 0.14, 2.2), shell);
  const keys = new Mesh(new BoxGeometry(2.8, 0.02, 1.2), dark);
  keys.position.set(0, 0.08, -0.25);
  const pad = new Mesh(new BoxGeometry(1.0, 0.02, 0.5), dark);
  pad.position.set(0, 0.08, 0.72);

  const lid = new Group(); // pivots on the back edge of the base
  lid.position.set(0, 0.07, -1.1);
  const back = new Mesh(new BoxGeometry(3.2, 2.1, 0.1), shell);
  back.position.y = 1.05;
  const bezel = new Mesh(new BoxGeometry(3.1, 2.0, 0.02), dark);
  bezel.position.set(0, 1.05, 0.055);
  const screen = new Mesh(new PlaneGeometry(SCREEN_W, SCREEN_H), screenMat);
  screen.position.set(0, 1.05, 0.07);
  lid.add(back, bezel, screen);
  lid.rotation.x = CLOSED;
  laptop.add(base, keys, pad, lid);
  scene.add(laptop);

  let disposed = false;
  const texture = new TextureLoader().load(imageUrl, (tex) => {
    if (disposed) return;
    tex.colorSpace = SRGBColorSpace;
    // "cover", anchored to the top: show the top of the page, like a browser would.
    const ratio = tex.image.width / tex.image.height / 1.6;
    if (ratio < 1) {
      tex.repeat.set(1, ratio);
      tex.offset.set(0, 1 - ratio);
    } else {
      tex.repeat.set(1 / ratio, 1);
      tex.offset.set((1 - 1 / ratio) / 2, 0);
    }
    screenMat.color.set(0xffffff);
    screenMat.map = tex;
    screenMat.needsUpdate = true;
  });

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  // Drag to rotate, within limits so the screen never turns fully away.
  let yaw = 0;
  let pitch = 0;
  let drag: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    yaw = Math.max(-1.1, Math.min(1.1, yaw + (e.clientX - drag.x) * 0.008));
    pitch = Math.max(-0.25, Math.min(0.45, pitch + (e.clientY - drag.y) * 0.005));
    drag = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => (drag = null);

  let frame = 0;
  let visible = false;
  let t = 0;
  let last = performance.now();
  const loop = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return; // idle while off-screen
    t += Math.min(now - last, 100) / 1000;
    last = now;
    lid.rotation.x += (OPEN - lid.rotation.x) * 0.035; // opens once, slowly
    // One gentle sway every ~14 s, plus a small float.
    laptop.rotation.y += (-0.35 + Math.sin(t * 0.45) * 0.28 + yaw - laptop.rotation.y) * 0.06;
    laptop.rotation.x += (0.08 + pitch - laptop.rotation.x) * 0.06;
    laptop.position.y = Math.sin(t * 0.8) * 0.05;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };

  resize();
  canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", kick);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", kick);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    scene.traverse((o) => o instanceof Mesh && o.geometry.dispose());
    for (const m of [shell, dark, screenMat]) m.dispose();
    texture.dispose();
    renderer.dispose();
  };
}
