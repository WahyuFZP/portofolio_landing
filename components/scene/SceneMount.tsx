"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

// Loaded only in the browser, after the page is idle: text always renders first.
const Island = dynamic(() => import("./Island"), { ssr: false });

/** Mounts the 3D scene only where it should run: 768px and wider, motion allowed, WebGL present, not data-saver. */
export default function SceneMount() {
  const [show, setShow] = useState(false);
  useEffect(() => afterLoadIdle(() => setShow(canRun3D())), []);
  return show ? <Island /> : null;
}

/** Static pixel drawing of the island, for phones and reduced motion (where the 3D scene is not mounted). */
export function IslandStill({ className = "" }: { className?: string }) {
  const px: [number, number, number, number, string][] = [
    // x, y, width, height, color (on a 32 x 28 grid)
    [15, 1, 2, 3, "var(--gold)"],
    [14, 2, 4, 1, "var(--gold)"],
    [9, 8, 6, 2, "var(--pink)"],
    [8, 10, 8, 1, "var(--pink)"],
    [9, 11, 6, 4, "var(--text)"],
    [11, 12, 2, 3, "var(--night)"],
    [21, 6, 2, 2, "#3fbf8f"],
    [20, 8, 4, 2, "#3fbf8f"],
    [19, 10, 6, 2, "#3fbf8f"],
    [21, 12, 2, 3, "#b98a4a"],
    [4, 15, 24, 2, "var(--mint)"],
    [5, 17, 22, 2, "#4a4e8a"],
    [7, 19, 18, 2, "#4a4e8a"],
    [10, 21, 12, 2, "#3b3f73"],
    [13, 23, 6, 2, "#3b3f73"],
    [15, 25, 2, 2, "#2d3059"],
  ];
  return (
    <svg viewBox="0 0 32 28" shapeRendering="crispEdges" aria-hidden className={className}>
      {px.map(([x, y, w, h, fill]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </svg>
  );
}
