"use client";

import { useEffect, useRef, useState } from "react";
import type { ConstellationData } from "@/lib/constellation";

type Mode = "poster" | "live";

function canRun3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  // Phones keep the poster: the scene sits faded behind the text there, so live 3D is cost without benefit.
  if (window.innerWidth < 768) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

// Calls `fn` once the page has loaded and the main thread is idle, so 3D never competes with LCP.
function afterLoadIdle(fn: () => void): () => void {
  let cancelled = false;
  const hasIdle = typeof window.requestIdleCallback === "function"; // missing in Safari
  let idleId: number | undefined;
  const schedule = () => {
    if (cancelled) return;
    idleId = hasIdle ? window.requestIdleCallback(fn, { timeout: 3000 }) : window.setTimeout(fn, 1500);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleId === undefined) return;
    if (hasIdle) window.cancelIdleCallback(idleId);
    else window.clearTimeout(idleId);
  };
}

// Same URL the Skills chips use; ProjectFilter reads it through useSearchParams.
function showProjectsFor(skillId: string) {
  window.history.replaceState(null, "", `${window.location.pathname}?skill=${skillId}#projects`);
  document.getElementById("projects")?.scrollIntoView();
}

export default function HeroScene({ data, hint, children }: { data: ConstellationData; hint: string; children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>("poster");

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startConstellation } = await import("./constellation3d");
        if (disposed || !canvasRef.current || !labelRef.current) return;
        stop = startConstellation(canvasRef.current, data, { label: labelRef.current, onPick: showProjectsFor });
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
      <span ref={labelRef} hidden className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap bg-text px-2 py-1 font-pixel text-xs text-bg" />
      {live && <p className="absolute inset-x-0 -bottom-6 hidden text-center font-mono text-xs text-muted md:block">{hint}</p>}
    </div>
  );
}
