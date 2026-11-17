"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, DoubleSide, SRGBColorSpace, type Group } from "three";

const BLUE = "#2b4396";
const PAPER = "#fbecc8";
const INK = "#16181d";
const PANELS = 7;
const TURN = (Math.PI * 2) / PANELS;
// What each panel of the band carries: a glyph in paper color, or nothing.
const GLYPHS = ["Q", "", "A", "", "✓", "", ""];

/** A square texture drawn with the 2D canvas, so no font or image is fetched. */
function texture(draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, size);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function Scene() {
  const band = useRef<Group>(null);
  const all = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const panels = useMemo(
    () =>
      GLYPHS.map((glyph) =>
        texture((ctx, s) => {
          ctx.fillStyle = BLUE;
          ctx.fillRect(0, 0, s, s);
          if (!glyph) return;
          ctx.fillStyle = PAPER;
          ctx.font = `bold ${s * 0.78}px Georgia, "Times New Roman", serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(glyph, s / 2, s * 0.54);
        }),
      ),
    [],
  );
  // The ball in the middle: a warm sphere with a "bug not allowed" badge.
  const ball = useMemo(
    () =>
      texture((ctx, s) => {
        const g = ctx.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, "#fff3d6");
        g.addColorStop(1, "#f4a44c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        // A sphere stretches its texture twice as wide as tall, so the badge is drawn at half width to come out round.
        ctx.translate(s / 2, s / 2);
        ctx.scale(0.5, 1);
        ctx.lineWidth = s * 0.03;
        ctx.strokeStyle = INK;
        ctx.fillStyle = PAPER;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.font = `bold ${s * 0.15}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("QA", 0, s * 0.01);
      }),
    [],
  );
  useEffect(() => () => [...panels, ball].forEach((t) => t.dispose()), [panels, ball]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    if (band.current) band.current.rotation.y = state.clock.elapsedTime * 0.3 + window.scrollY * 0.003; // turns on its own and with the scroll
    if (!all.current) return;
    const k = Math.min(1, dt * 3);
    all.current.rotation.x += (0.32 + pointer.current.y * 0.12 - all.current.rotation.x) * k;
    all.current.rotation.z += (-0.1 - pointer.current.x * 0.08 - all.current.rotation.z) * k;
    all.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
  });

  return (
    <group ref={all}>
      {/* The band: seven curved panels of slightly different height, each a slice of an open cylinder. */}
      <group ref={band} position={[0, 0.55, 0]}>
        {panels.map((map, i) => (
          <mesh key={i} position={[0, ((i * 37) % 5) * 0.06 - 0.12, 0]}>
            <cylinderGeometry args={[1.75, 1.75, 0.78 + ((i * 53) % 4) * 0.08, 14, 1, true, i * TURN, TURN * 0.9]} />
            <meshBasicMaterial map={map} side={DoubleSide} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.62, 0]} rotation={[0, -1.4, 0]}>
        <sphereGeometry args={[0.66, 40, 28]} />
        <meshBasicMaterial map={ball} />
      </mesh>
      {/* A phone lying under the ring: dark body, blue screen. */}
      <group position={[0.15, -1.25, 0.2]} rotation={[0.1, -0.5, 0.06]}>
        <RoundedBox args={[2.5, 0.16, 1.25]} radius={0.07} smoothness={3}>
          <meshBasicMaterial color={INK} />
        </RoundedBox>
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.34, 1.09]} />
          <meshBasicMaterial color={BLUE} />
        </mesh>
      </group>
    </group>
  );
}

/** The hero's 3D piece: a band of blue panels orbiting a ball, above a phone. Flat colors, smooth edges. Decorative. */
export default function Ring() {
  return (
    <Canvas aria-hidden flat dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} camera={{ position: [0, 0.5, 7.2], fov: 35 }}>
      <Scene />
    </Canvas>
  );
}
