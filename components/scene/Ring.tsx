"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Outlines, RoundedBox } from "@react-three/drei";
import { CanvasTexture, DoubleSide, ExtrudeGeometry, Shape, SRGBColorSpace, type Group } from "three";

const BLUE = "#2b4396";
const PAPER = "#fbecc8";
const INK = "#16181d";
const RADIUS = 1.75;
const PANELS = 7;
const TURN = (Math.PI * 2) / PANELS;
// Per panel: height, lift, and the glyph it carries (paper color) or nothing. Uneven on purpose, like cut paper.
const BAND = [
  { h: 1.05, y: 0.02, glyph: "✓" },
  { h: 0.7, y: 0.2, glyph: "" },
  { h: 0.95, y: -0.1, glyph: "" },
  { h: 0.62, y: 0.12, glyph: "" },
  { h: 1.1, y: -0.02, glyph: "" },
  { h: 0.74, y: 0.22, glyph: "" },
  { h: 0.88, y: -0.14, glyph: "" },
];
// Extruded check marks stand on the band at these panels, facing outwards.
const CHECKS = [1, 4];

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
      BAND.map(({ glyph }) =>
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
  // The ball in the middle: warm, with a round check-mark badge.
  const ball = useMemo(
    () =>
      texture((ctx, s) => {
        const g = ctx.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, "#fff3d6");
        g.addColorStop(1, "#f4a44c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        // A sphere stretches its texture twice as wide as tall, so the badge is drawn at half width to come out round.
        ctx.translate(s / 2, s * 0.46);
        ctx.scale(0.5, 1);
        ctx.lineWidth = s * 0.03;
        ctx.strokeStyle = INK;
        ctx.fillStyle = PAPER;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = s * 0.05;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(-s * 0.08, s * 0.005);
        ctx.lineTo(-s * 0.02, s * 0.06);
        ctx.lineTo(s * 0.09, -s * 0.06);
        ctx.stroke();
      }),
    [],
  );
  // One check mark, as a flat outline pushed into a thick slab.
  const check = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.42, 0.02);
    s.lineTo(-0.24, 0.2);
    s.lineTo(-0.1, 0.04);
    s.lineTo(0.3, 0.52);
    s.lineTo(0.48, 0.36);
    s.lineTo(-0.1, -0.36);
    s.closePath();
    return new ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: false });
  }, []);
  // The phone's screen. The canvas is square but the screen is about 2.1:1, so shapes are drawn 2.1x narrower to come out true.
  const screen = useMemo(
    () =>
      texture((ctx, s) => {
        const k = 1 / 2.1;
        ctx.fillStyle = BLUE;
        ctx.beginPath();
        ctx.roundRect(0, 0, s, s, [s * 0.11 * k, s * 0.11 * k].map((r) => r * 2.1)); // rounded screen corners; outside stays transparent
        ctx.fill();
        for (let row = 0; row < 3; row++) {
          const y = s * (0.2 + row * 0.24);
          ctx.fillStyle = "rgba(251, 236, 200, 0.16)";
          ctx.beginPath();
          ctx.roundRect(s * 0.16, y, s * 0.74, s * 0.17, s * 0.04);
          ctx.fill();
          ctx.fillStyle = PAPER;
          ctx.beginPath();
          ctx.ellipse(s * 0.215, y + s * 0.085, s * 0.055 * k, s * 0.055, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(s * 0.27, y + s * 0.05, s * (0.34 + row * 0.08), s * 0.028);
          ctx.fillStyle = "rgba(251, 236, 200, 0.55)";
          ctx.fillRect(s * 0.27, y + s * 0.105, s * 0.22, s * 0.02);
        }
      }),
    [],
  );
  useEffect(
    () => () => {
      [...panels, ball, screen].forEach((t) => t.dispose());
      check.dispose();
    },
    [panels, ball, screen, check],
  );

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
    all.current.rotation.x += (0.08 + pointer.current.y * 0.1 - all.current.rotation.x) * k;
    all.current.rotation.z += (-0.1 - pointer.current.x * 0.08 - all.current.rotation.z) * k;
    all.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
  });

  return (
    <group ref={all}>
      {/* The band: seven curved panels, each a slice of an open cylinder, with check marks standing on it. */}
      <group ref={band}>
        {BAND.map((p, i) => (
          <mesh key={i} position={[0, p.y, 0]}>
            <cylinderGeometry args={[RADIUS, RADIUS, p.h, 16, 1, true, i * TURN, TURN * 0.88]} />
            <meshBasicMaterial map={panels[i]} side={DoubleSide} />
          </mesh>
        ))}
        {CHECKS.map((i) => {
          const a = (i + 0.44) * TURN; // the middle of that panel
          return (
            <mesh key={i} geometry={check} position={[Math.sin(a) * (RADIUS + 0.05), BAND[i].y + 0.1, Math.cos(a) * (RADIUS + 0.05)]} rotation={[0, a, 0]} scale={1.15}>
              {/* Paper face, blue edge: the edge is what makes it read against the paper background. */}
              <meshBasicMaterial attach="material-0" color={PAPER} />
              <meshBasicMaterial attach="material-1" color={BLUE} />
            </mesh>
          );
        })}
      </group>

      {/* The ball rides high enough to show over the band. */}
      <mesh position={[0, 0.72, -0.2]} rotation={[0.25, -1.57, 0]}>
        <sphereGeometry args={[0.72, 48, 32]} />
        <meshBasicMaterial map={ball} />
        <Outlines thickness={0.06} color={INK} />
      </mesh>

      {/* Two coins drifting beside the ring. */}
      <Float speed={1.6} rotationIntensity={0.9} floatIntensity={1}>
        <mesh position={[-1.7, 1.3, -0.6]} rotation={[1.2, 0.3, 0.4]}>
          <cylinderGeometry args={[0.36, 0.36, 0.1, 36]} />
          <meshBasicMaterial attach="material-0" color={BLUE} />
          <meshBasicMaterial attach="material-1" color={PAPER} />
          <meshBasicMaterial attach="material-2" color={PAPER} />
        </mesh>
      </Float>
      <Float speed={1.3} rotationIntensity={0.7} floatIntensity={0.8}>
        <mesh position={[1.7, 1.5, -0.8]} rotation={[1.1, -0.4, -0.5]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 36]} />
          <meshBasicMaterial attach="material-0" color={BLUE} />
          <meshBasicMaterial attach="material-1" color={INK} />
          <meshBasicMaterial attach="material-2" color={INK} />
        </mesh>
      </Float>

      {/* A phone hovering under the ring. Lit (unlike the flat ring), so its rounded edges catch the light. */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[-3, 5, 4]} intensity={2.4} />
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
        <group position={[0.2, -1.75, 0.3]} rotation={[0.12, -0.5, 0.06]}>
          <RoundedBox args={[2.8, 0.2, 1.4]} radius={0.095} smoothness={8}>
            <meshStandardMaterial color="#20232c" roughness={0.42} metalness={0.35} />
          </RoundedBox>
          {/* Screen: a rounded picture of a test run (rows with check marks), set just above the body. */}
          <mesh position={[0, 0.102, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.66, 1.26]} />
            <meshBasicMaterial map={screen} transparent />
          </mesh>
          {/* Camera island and two side buttons */}
          <mesh position={[-1.12, 0.104, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.035, 0.2, 6, 14]} />
            <meshStandardMaterial color="#0c0d11" roughness={0.3} />
          </mesh>
          <RoundedBox args={[0.34, 0.06, 0.03]} radius={0.012} smoothness={4} position={[0.55, 0, -0.71]}>
            <meshStandardMaterial color="#2c303b" roughness={0.4} metalness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.2, 0.06, 0.03]} radius={0.012} smoothness={4} position={[0.12, 0, -0.71]}>
            <meshStandardMaterial color="#2c303b" roughness={0.4} metalness={0.4} />
          </RoundedBox>
        </group>
      </Float>
    </group>
  );
}

/**
 * The hero's 3D piece: a band of blue panels orbiting a ball, above a phone, seen from a little above.
 * Flat colors (no tone mapping, so the blue matches the page) with ink outlines. Decorative.
 */
export default function Ring() {
  return (
    <Canvas aria-hidden flat dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} camera={{ position: [0, 2.6, 7.6], fov: 35 }}>
      <Scene />
    </Canvas>
  );
}
