"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CanvasTexture } from "three";

// Stars live in a tall box in front of the camera. The camera travels down it as the page scrolls,
// so near stars pass quickly and far ones slowly: real depth, not a flat pattern.
const DEPTH = [-9, 1.5] as const;
const HEIGHT = 46;

function field(count: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) out.set([(rand() - 0.5) * 24, 6 - rand() * HEIGHT, DEPTH[0] + rand() * (DEPTH[1] - DEPTH[0])], i * 3);
  return out;
}

function Field() {
  const pointer = useRef({ x: 0, y: 0 });
  const big = useMemo(() => field(140, 7), []);
  const small = useMemo(() => field(420, 23), []);
  // Points are squares by default; this round mask makes them dots.
  const dot = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    return new CanvasTexture(c);
  }, []);
  useEffect(() => () => dot.dispose(), [dot]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ camera }, dt) => {
    const k = Math.min(1, dt * 4);
    const doc = document.documentElement;
    const progress = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight); // 0 at the top, 1 at the bottom
    camera.position.y += (-progress * (HEIGHT - 12) - pointer.current.y * 0.25 - camera.position.y) * k;
    camera.position.x += (pointer.current.x * 0.45 - camera.position.x) * k;
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[big, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f6d60a" size={0.11} sizeAttenuation map={dot} alphaTest={0.5} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[small, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f6d60a" size={0.05} sizeAttenuation map={dot} alphaTest={0.5} />
      </points>
    </>
  );
}

/** Page backdrop: a deep field of yellow stars, fixed behind the content. It moves with scroll and pointer. Decorative. */
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
