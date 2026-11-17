"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

// Where the island sits while each section is in the middle of the screen.
// x: share of half the viewport width (negative = left), y: world units, turn: radians, size: scale.
const POSES: Record<string, { x: number; y: number; turn: number; size: number }> = {
  home: { x: 0.68, y: -0.1, turn: 0.5, size: 0.78 },
  // Small and out at the screen edge beside the content, alternating sides.
  projects: { x: 0.9, y: -0.3, turn: 1.7, size: 0.36 },
  skills: { x: -0.9, y: 0.2, turn: 2.9, size: 0.36 },
  experience: { x: 0.9, y: 0.3, turn: 4.1, size: 0.36 },
  about: { x: -0.9, y: -0.2, turn: 5.3, size: 0.36 },
  contact: { x: 0.88, y: 0, turn: 6.6, size: 0.42 },
};
const IDS = Object.keys(POSES);

/** A small floating island built from primitives: rock, grass, a house, a tree and a floating save crystal. */
function Diorama() {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    // The pose of the last section whose top has passed the middle of the screen.
    let pose = POSES.home;
    for (const id of IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) pose = POSES[id];
    }
    const k = Math.min(1, dt * 2.6); // frame-rate independent easing toward the pose
    g.position.x += (pose.x * (viewport.width / 2) - g.position.x) * k;
    g.position.y += (pose.y + Math.sin(state.clock.elapsedTime * 0.7) * 0.06 - g.position.y) * k;
    g.rotation.y += (pose.turn + pointer.current.x * 0.35 - g.rotation.y) * k;
    g.rotation.x += (0.18 + pointer.current.y * 0.12 - g.rotation.x) * k;
    g.scale.setScalar(g.scale.x + (pose.size - g.scale.x) * k);
  });

  return (
    <group ref={group}>
      {/* Rock: an upside-down seven-sided cone. */}
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.25, 1.5, 7]} />
        <meshLambertMaterial color="#4a4e8a" flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.32, 1.25, 0.28, 7]} />
        <meshLambertMaterial color="#7cf5c4" flatShading />
      </mesh>
      {/* House */}
      <mesh position={[-0.35, 0.52, 0.1]}>
        <boxGeometry args={[0.5, 0.36, 0.42]} />
        <meshLambertMaterial color="#edebff" flatShading />
      </mesh>
      <mesh position={[-0.35, 0.86, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.44, 0.34, 4]} />
        <meshLambertMaterial color="#ff6b9d" flatShading />
      </mesh>
      {/* Tree */}
      <mesh position={[0.55, 0.52, -0.25]}>
        <cylinderGeometry args={[0.06, 0.08, 0.36, 5]} />
        <meshLambertMaterial color="#b98a4a" flatShading />
      </mesh>
      <mesh position={[0.55, 0.95, -0.25]}>
        <coneGeometry args={[0.3, 0.62, 6]} />
        <meshLambertMaterial color="#3fbf8f" flatShading />
      </mesh>
      {/* Save crystal, hovering over the island. */}
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={[0.2, 1.75, 0.3]}>
          <octahedronGeometry args={[0.22]} />
          <meshLambertMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.35} flatShading />
        </mesh>
      </Float>
    </group>
  );
}

/**
 * The one 3D scene of the site: fixed behind the page, rendered at 30% resolution and scaled up
 * with hard pixels, no anti-aliasing, flat shading. Decorative. Mounted by SceneMount only on
 * wide screens with motion allowed.
 */
export default function Island() {
  return (
    <Canvas
      aria-hidden
      dpr={0.3}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 1.1, 7.5], fov: 35 }}
      style={{ position: "fixed", inset: 0, zIndex: -10, pointerEvents: "none", imageRendering: "pixelated" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[-3, 4, 5]} intensity={2.4} />
      <Diorama />
    </Canvas>
  );
}
