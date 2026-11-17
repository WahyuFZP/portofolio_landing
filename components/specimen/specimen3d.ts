import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LineCurve3,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from "three";

const HALF_H = Math.tan((35 / 2) * (Math.PI / 180)) * 8; // world units from centre to top edge at the camera distance
const SCAN_REACH = 1.0; // the scan plane travels this far above and below the specimen's centre

// Which specimen is on show while each section is in the middle of the screen.
const SECTION_SHAPE: Record<string, number> = { home: 0, projects: 0, skills: 1, experience: 1, about: 2, contact: 2 };

const cssColor = (name: string) => new Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);

/**
 * One glass specimen under a scanner, fixed behind the page. A plane of light sweeps up and down;
 * where it passes, the glass gives way to its wireframe, and on the bug it lights up the "defects".
 * The specimen changes with the section in view: bug (testing), API graph (skills), shield (security).
 * It sits beside the hero text, then shrinks to the edge of the screen as the page scrolls.
 * Returns a cleanup function.
 */
export function startSpecimen(canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 8;

  const uColor = { value: new Color() };
  const uScanY = { value: 0 };
  const uDim = { value: 1 }; // fades the scanner where it would sit behind text
  const vertexShader = `
    varying vec3 vN; varying vec3 vW;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;

  const geometries: BufferGeometry[] = [];
  /** A specimen: glass meshes plus their wireframes, sharing one "how visible am I" value. */
  function specimen(parts: BufferGeometry[]) {
    const uShow = { value: 0 };
    const glass = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: { uColor, uScanY, uShow },
      vertexShader,
      fragmentShader: `
        uniform vec3 uColor; uniform float uScanY; uniform float uShow;
        varying vec3 vN; varying vec3 vW;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 2.2); // bright at grazing angles, like glass
          float d = vW.y - uScanY;
          float line = exp(-d * d * 260.0);  // the thin bright line where the plane cuts the surface
          float band = exp(-d * d * 5.0);    // a wider zone around it, where the glass thins out
          vec3 col = uColor * (0.1 + rim * 0.95) + vec3(0.85, 0.95, 1.0) * line * 0.9;
          gl_FragColor = vec4(col, ((0.16 + rim * 0.75) * (1.0 - band * 0.7) + line * 0.8) * uShow);
        }`,
    });
    const wire = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uColor, uScanY, uShow },
      vertexShader: `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uScanY; uniform float uShow; varying vec3 vW;
        void main() { float d = vW.y - uScanY; gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.35), exp(-d * d * 5.0) * 0.85 * uShow); }`, // the wireframe shows only near the plane
    });
    const group = new Group();
    for (const geo of parts) {
      const lines = new WireframeGeometry(geo);
      geometries.push(geo, lines);
      group.add(new Mesh(geo, glass), new LineSegments(lines, wire));
    }
    return { group, uShow, glass, wire };
  }
  const tube = (a: Vector3, mid: Vector3, b: Vector3, r: number) => new TubeGeometry(new QuadraticBezierCurve3(a, mid, b), 14, r, 6);

  // ---- Bug: an oval body, a head, six legs, two antennae ----
  const bugParts: BufferGeometry[] = [new SphereGeometry(1, 40, 24).scale(0.5, 0.34, 0.78), new SphereGeometry(0.24, 24, 16).translate(0, 0.02, 0.9)];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.38 + i * 0.36;
      bugParts.push(tube(v3(s * 0.42, -0.05, z), v3(s * 0.95, 0.28, z + (i - 1) * 0.15), v3(s * 1.08, -0.45, z + (i - 1) * 0.32), 0.03));
    }
    bugParts.push(tube(v3(s * 0.1, 0.12, 1.05), v3(s * 0.3, 0.48, 1.3), v3(s * 0.52, 0.36, 1.55), 0.018));
  }
  const bug = specimen(bugParts);
  bug.group.rotation.x = 0.95; // seen from above and a little in front
  // Defects: three rings on the bug's back that light up as the plane crosses them.
  const ringGeo = new RingGeometry(0.055, 0.08, 28);
  geometries.push(ringGeo);
  const defects = [v3(0.2, 0.36, 0.25), v3(-0.26, 0.33, -0.2), v3(0.08, 0.3, -0.52)].map((p) => {
    const ring = new Mesh(ringGeo, new MeshBasicMaterial({ transparent: true, depthTest: false, opacity: 0 }));
    ring.position.copy(p);
    bug.group.add(ring);
    return ring;
  });

  // ---- API graph: one hub and four services, joined by thin links ----
  const hubs = [v3(0, 0, 0), v3(0.85, 0.5, 0.2), v3(-0.75, 0.58, -0.3), v3(0.55, -0.72, -0.4), v3(-0.65, -0.5, 0.5)];
  const graphParts: BufferGeometry[] = hubs.map((p, i) => new SphereGeometry(i ? 0.17 : 0.26, 24, 16).translate(p.x, p.y, p.z));
  for (const [a, b] of [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 4]]) graphParts.push(new TubeGeometry(new LineCurve3(hubs[a], hubs[b]), 1, 0.018, 6));
  const graph = specimen(graphParts);

  // ---- Shield ----
  const outline = new Shape();
  outline.moveTo(0, 0.95);
  outline.lineTo(0.72, 0.64);
  outline.lineTo(0.72, 0.02);
  outline.quadraticCurveTo(0.66, -0.62, 0, -1);
  outline.quadraticCurveTo(-0.66, -0.62, -0.72, 0.02);
  outline.lineTo(-0.72, 0.64);
  outline.closePath();
  const shield = specimen([new ExtrudeGeometry(outline, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 20 }).translate(0, 0, -0.1)]);

  const shapes = [bug, graph, shield];
  const stage = new Group(); // moves and turns whatever specimen is on show
  shapes.forEach((s) => stage.add(s.group));
  scene.add(stage);

  // The scanner's plane of light.
  const planeGeo = new PlaneGeometry(2.3, 2.3);
  geometries.push(planeGeo);
  const planeMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: { uColor, uDim },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uDim; varying vec2 vUv;
      void main() { vec2 e = abs(vUv - 0.5) * 2.0; float edge = smoothstep(0.9, 1.0, max(e.x, e.y)); gl_FragColor = vec4(uColor, (0.03 + edge * 0.3) * (1.0 - smoothstep(0.6, 1.0, length(e) / 1.414)) * uDim); }`,
  });
  const plane = new Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // ---- Page state ----
  let halfW = HALF_H;
  let shape = 0;
  let sections: { top: number; shape: number }[] = [];
  const measure = () => {
    sections = Object.entries(SECTION_SHAPE).flatMap(([id, s]) => {
      const el = document.getElementById(id);
      return el ? [{ top: el.getBoundingClientRect().top + window.scrollY, shape: s }] : [];
    });
  };
  const applyTheme = () => {
    uColor.value = cssColor("--accent");
    defects.forEach((d) => (d.material.color = cssColor("--line")));
  };
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfW = HALF_H * camera.aspect;
    measure();
  };
  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const pos = { x: 0, s: 1, dim: 1, tiltX: 0, tiltY: 0 };
  const world = new Vector3();
  let t = 0;
  let first = true;
  const draw = (dt: number) => {
    t += dt;
    const ease = first ? 1 : Math.min(1, dt * 3);
    first = false;

    // Which specimen: the last section whose top has passed the middle of the screen.
    const mid = window.scrollY + window.innerHeight / 2;
    for (const s of sections) if (s.top <= mid) shape = s.shape;

    // Beside the hero text at first; smaller and at the screen edge once the hero has scrolled away.
    const away = Math.min(1, window.scrollY / (window.innerHeight * 0.7));
    const wide = window.innerWidth >= 1500; // room outside the content column
    pos.x += ((halfW * 0.6 * (1 - away) + (halfW - 0.75) * away) - pos.x) * ease; // ends fully inside the right edge
    pos.s += ((1 - away * 0.5) - pos.s) * ease;
    pos.dim += ((1 - away * (wide ? 0.35 : 0.72)) - pos.dim) * ease; // fades where it would sit behind text
    pos.tiltX += (pointer.y * 0.18 - pos.tiltX) * ease * 0.5;
    pos.tiltY += (pointer.x * 0.3 - pos.tiltY) * ease * 0.5;

    const y = Math.sin(t * 0.6) * 0.06 + 0.35 * (1 - away); // a little above centre in the hero, clear of the proof chips
    stage.position.set(pos.x, y, 0);
    stage.scale.setScalar(pos.s);
    stage.rotation.set(pos.tiltX, t * 0.22 + pos.tiltY + window.scrollY * 0.0012, 0);

    uScanY.value = y + Math.sin(t * 0.8) * SCAN_REACH * pos.s;
    plane.position.set(pos.x, uScanY.value, 0);
    plane.scale.setScalar(pos.s);
    uDim.value = pos.dim;

    shapes.forEach((s, i) => {
      s.uShow.value += ((i === shape ? pos.dim : 0) - s.uShow.value) * ease * 0.6;
      s.group.visible = s.uShow.value > 0.01;
      const k = 0.7 + 0.3 * Math.min(1, s.uShow.value / Math.max(pos.dim, 0.01)); // grows in as it appears
      s.group.scale.setScalar(k);
    });
    for (const d of defects) {
      d.getWorldPosition(world);
      const gap = world.y - uScanY.value;
      d.material.opacity = Math.exp(-gap * gap * 30) * bug.uShow.value;
      d.quaternion.copy(camera.quaternion); // face the viewer
      d.quaternion.premultiply(stage.quaternion.clone().multiply(bug.group.quaternion).invert());
    }
    renderer.render(scene, camera);
  };

  let frame = 0;
  let last = performance.now();
  const loop = (now: number) => {
    frame = 0;
    if (document.hidden) return;
    draw(Math.min(now - last, 100) / 1000);
    last = now;
    frame = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (frame || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  };

  applyTheme();
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  ro.observe(document.body); // page height changes move the sections
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", kick);
  kick();

  return () => {
    cancelAnimationFrame(frame);
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", kick);
    geometries.forEach((g) => g.dispose());
    shapes.forEach((s) => {
      s.glass.dispose();
      s.wire.dispose();
    });
    defects.forEach((d) => d.material.dispose());
    planeMat.dispose();
    renderer.dispose();
  };
}
