"use client";

import { useEffect, useRef } from "react";

// The mascot: a pixel octopus, drawn cell by cell on a 28 x 27 grid (no image file).
const W = 28;
const H = 27;
const EYES = [7, 17]; // left edge of each eye (4 cells wide, rows 8-11)
const SWAY_FROM = 15; // rows from here down are tentacles and sway

/** Builds the grid once: "." empty, "o" outline, "p" body, "h" highlight, "w" eye white, "k" mouth. Pupils are drawn separately. */
function build(): string[][] {
  const g = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (((x - 13.5) / 9.6) ** 2 + ((y - 9.5) / 8.4) ** 2 <= 1) set(x, y, "p");
  [4, 8, 12, 15, 19, 23].forEach((x0, i) => {
    for (let y = 15; y < 25; y++) {
      const x = x0 + Math.round(Math.sin((y - 15) * 0.8 + i * 1.3));
      set(x, y, "p");
      set(x + 1, y, "p");
    }
  });
  for (let y = 2; y < 7; y++) for (let x = 6; x < 12; x++) if (g[y][x] === "p" && ((x - 9) / 3) ** 2 + ((y - 4.5) / 2.2) ** 2 <= 1) set(x, y, "h");
  for (const ex of EYES) for (let y = 8; y < 12; y++) for (let x = ex; x < ex + 4; x++) set(x, y, "w");
  set(13, 14, "k");
  set(14, 14, "k");
  const body = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && g[y][x] !== "." && g[y][x] !== "o";
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "." && (body(x + 1, y) || body(x - 1, y) || body(x, y + 1) || body(x, y - 1))) g[y][x] = "o";
  return g;
}

const GRID = build();
const FILL: Record<string, string> = { o: "var(--ink)", p: "var(--pink)", h: "#ffb3d1", w: "var(--paper)", k: "var(--ink)" };

/**
 * The octopus blinks (CSS, see .blink-eye). With a mouse, on 768px and wider and with motion allowed,
 * its pupils look toward the pointer and its tentacles sway and lean toward it, always in whole cells
 * so the drawing stays pixel-sharp.
 */
export default function Octopus({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el || window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pupils = el.querySelector<SVGGElement>("[data-pupils]");
    const rows = [...el.querySelectorAll<SVGGElement>("[data-row]")];
    const look = { x: 0, y: 0 }; // -1..1, direction from the octopus to the pointer
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.37); // eye level
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 120); // close to the face the eyes centre again
      look.x = (dx / d) * reach;
      look.y = (dy / d) * reach;
    };
    let frame = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      pupils?.setAttribute("transform", `translate(${Math.round(look.x)} ${Math.round(look.y)})`);
      for (const row of rows) {
        const depth = Number(row.dataset.row) - SWAY_FROM; // 0 at the top of the tentacles, 10 at the tips
        // A travelling wave plus a lean toward the pointer, both stronger toward the tips.
        const shift = Math.round(Math.sin(t * 2.2 - depth * 0.7) * (depth / 9) + look.x * (depth / 5));
        row.setAttribute("transform", `translate(${shift} 0)`);
      }
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={svg} viewBox={`-2 0 ${W + 4} ${H}`} shapeRendering="crispEdges" aria-hidden className={className}>
      {GRID.map((row, y) => (
        <g key={y} data-row={y >= SWAY_FROM ? y : undefined}>
          {row.map((c, x) => (c === "." ? null : <rect key={x} x={x} y={y} width={1} height={1} fill={FILL[c]} />))}
        </g>
      ))}
      <g data-pupils>
        {EYES.map((ex) => (
          <rect key={ex} x={ex + 1} y={9} width={2} height={2} fill="var(--ink)" />
        ))}
      </g>
      {/* Eyelids: closed for a moment every few seconds. */}
      {EYES.map((ex) => (
        <rect key={ex} className="blink-eye" x={ex} y={8} width={4} height={4} fill="var(--pink)" />
      ))}
    </svg>
  );
}
