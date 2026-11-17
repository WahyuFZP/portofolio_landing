"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import { categories, skills, skillLogo, type SkillCategory } from "@/content/skills";
import { afterLoadIdle, canRun3D } from "@/lib/scene";
import type { CrystalSpec } from "./crystals3d";

// Three tones only, repeated across the eight categories.
const TONES: CrystalSpec["tone"][] = ["--node-1", "--warm", "--node-2"];
const logosOf = (cat: SkillCategory) => skills.filter((s) => s.category === cat).flatMap((s) => (skillLogo(s.id) ? [{ id: s.id, src: skillLogo(s.id)! }] : []));

/**
 * A row of category links (always there: on phones they are plain jump links), with one floating
 * pixel crystal above each on desktop, orbited by that category's logos.
 */
export default function SkillCrystals({ labels }: { labels: Dictionary["skills"]["categories"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Record<string, HTMLElement | null>>({});
  const hot = useRef(-1);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startCrystals } = await import("./crystals3d");
        if (disposed || !canvasRef.current) return;
        const specs = categories.map((cat, i) => ({
          tone: TONES[i % TONES.length],
          tiles: logosOf(cat).flatMap((l) => tileRefs.current[l.id] ?? []),
        }));
        // The pause button lives in the wrapper around this component (MarqueePause sets data-paused).
        const pausedBy = rootRef.current?.closest<HTMLElement>("[data-paused]");
        stop = startCrystals(canvasRef.current, specs, () => hot.current, () => pausedBy?.dataset.paused === "true");
        setLive(true);
      } catch {
        // The links below still work without the scene.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Scene layer: desktop only, decorative. Tiles at z 10/30 pass behind and in front of the canvas (z 20). */}
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 hidden h-52 transition-opacity duration-700 md:block motion-reduce:md:hidden ${live ? "opacity-100" : "opacity-0"}`}>
        <canvas ref={canvasRef} data-crystals={live ? "live" : "off"} className="absolute inset-0 z-20 h-full w-full [image-rendering:pixelated]" />
        {categories.flatMap((cat) =>
          logosOf(cat).map((l) => (
            <span
              key={l.id}
              ref={(el) => {
                tileRefs.current[l.id] = el;
              }}
              className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center bg-white pixel-border will-change-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG */}
              <img src={l.src} alt="" width={22} height={22} loading="lazy" decoding="async" />
            </span>
          )),
        )}
      </div>

      <ul className="grid grid-cols-2 gap-y-1 sm:grid-cols-4 md:grid-cols-8 md:pt-52 motion-reduce:md:pt-0">
        {categories.map((cat, i) => (
          <li key={cat}>
            <a
              href={`#skills-${cat}`}
              onPointerEnter={() => (hot.current = i)}
              onPointerLeave={() => (hot.current = -1)}
              onFocus={() => (hot.current = i)}
              onBlur={() => (hot.current = -1)}
              className="flex min-h-11 items-center justify-center px-1 text-center font-pixel text-xs text-muted transition-colors hover:text-accent"
            >
              {labels[cat]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
