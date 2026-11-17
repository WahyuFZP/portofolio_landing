"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, type ShaderMaterial } from "three";

// Stars live in a tall box in front of the camera. The camera travels down it as the page scrolls,
// so near stars pass quickly and far ones slowly: real depth, not a flat pattern.
const DEPTH = [-9, 1.5] as const;
const HEIGHT = 46;
const COUNT = 520;

function field(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    position.set([(rand() - 0.5) * 24, 6 - rand() * HEIGHT, DEPTH[0] + rand() * (DEPTH[1] - DEPTH[0])], i * 3);
    size[i] = rand() < 0.25 ? 1.9 : 0.9; // a quarter of them are big
  }
  return { position, size };
}

const VERTEX = `
  attribute float aSize;
  uniform float uTime; uniform vec2 uPointer; uniform float uAspect; uniform float uScale;
  void main() {
    vec3 p = position;
    // Each star wanders on its own slow loop.
    p.x += sin(uTime * 0.35 + position.y * 1.7 + position.z) * 0.22;
    p.y += cos(uTime * 0.28 + position.x * 1.3 + position.z) * 0.22;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    // Stars near the pointer are pushed away from it and swell, so the field parts around the cursor.
    vec2 d = clip.xy / clip.w - uPointer;
    d.x *= uAspect;
    float near = exp(-dot(d, d) * 14.0);
    clip.xy += normalize(d + 0.0001) * near * 0.09 * clip.w;
    float twinkle = 0.78 + 0.22 * sin(uTime * 1.6 + position.x * 31.0 + position.y * 17.0);
    gl_PointSize = aSize * twinkle * (1.0 + near * 1.6) * uScale / -mv.z;
    gl_Position = clip;
  }`;
const FRAGMENT = `
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;                          // round, not square
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.38, d));
  }`;

function Field() {
  const material = useRef<ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const { position, size } = useMemo(() => field(COUNT, 7), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPointer: { value: [0, 0] }, uAspect: { value: 1 }, uScale: { value: 46 }, uColor: { value: new Color("#f6d60a") } }), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ camera, size: view, viewport }, dt) => {
    const k = Math.min(1, dt * 4);
    // The pointer is followed with a little lag, so everything it drives moves smoothly.
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    const doc = document.documentElement;
    const progress = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight); // 0 at the top, 1 at the bottom
    camera.position.y += (-progress * (HEIGHT - 12) + eased.current.y * 0.3 - camera.position.y) * k;
    camera.position.x += (eased.current.x * 0.5 - camera.position.x) * k;
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    u.uPointer.value = [eased.current.x, eased.current.y];
    u.uAspect.value = view.width / view.height;
    u.uScale.value = 46 * viewport.dpr * (view.height / 900);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[position, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[size, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={VERTEX} fragmentShader={FRAGMENT} transparent depthWrite={false} />
    </points>
  );
}

/**
 * Page backdrop: a deep field of yellow stars, fixed behind the content. Each star drifts and twinkles,
 * the whole field moves with scroll, and it parts around the pointer. Decorative.
 */
export default function Stars() {
  return (
    <Canvas
      aria-hidden
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "fixed", inset: 0, zIndex: -10, pointerEvents: "none" }}
    >
      <Field />
    </Canvas>
  );
}
