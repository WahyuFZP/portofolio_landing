"use client";

import { useEffect, useRef, useState } from "react";
import type { ConstellationData } from "@/lib/constellation";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

type Mode = "poster" | "live";

// Same URL the Skills chips use; ProjectFilter reads it through useSearchParams.
function showProjectsFor(skillId: string) {
  window.history.replaceState(null, "", `${window.location.pathname}?skill=${skillId}#projects`);
  document.getElementById("projects")?.scrollIntoView();
}

export default function HeroScene({ data, hint, children }: { data: ConstellationData; hint: string; children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const iconRefs = useRef<(HTMLElement | null)[]>([]);
  const [mode, setMode] = useState<Mode>("poster");

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startConstellation } = await import("./constellation3d");
        if (disposed || !canvasRef.current || !labelRef.current) return;
        stop = startConstellation(canvasRef.current, data, { label: labelRef.current, onPick: showProjectsFor, icons: data.nodes.map((_, i) => iconRefs.current[i] ?? null) });
        setMode("live");
      } catch {
        // Keep the poster if the chunk or WebGL fails.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, [data]);

  const live = mode === "live";
  return (
    // Decorative for assistive tech: the Skills section offers the same data and links by keyboard.
    <div data-scene={mode} aria-hidden className="relative h-full w-full">
      <div className={`absolute inset-0 transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`}>{children}</div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 [image-rendering:pixelated] ${live ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      {/* Logo tiles for the live scene. They ignore the pointer: hover and click are resolved on the canvas. */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${live ? "opacity-100" : "opacity-0"}`}>
        {data.nodes.map(
          (n, i) =>
            n.icon && (
              <span
                key={n.id}
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center bg-white pixel-border will-change-transform data-[hover]:[--pb:var(--accent)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG, no optimisation to gain */}
                <img src={n.icon} alt="" width={28} height={28} loading="lazy" decoding="async" />
              </span>
            ),
        )}
      </div>
      <span ref={labelRef} hidden className="pointer-events-none absolute left-0 top-0 z-[200] whitespace-nowrap bg-text px-2 py-1 font-pixel text-xs text-bg" />
      {live && <p className="absolute inset-x-0 -bottom-6 hidden text-center font-mono text-xs text-muted md:block">{hint}</p>}
    </div>
  );
}
