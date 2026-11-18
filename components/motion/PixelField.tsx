"use client";

import { useEffect, useRef } from "react";

const GAP = 30; // px between squares
const REACH = 150; // px around the pointer where squares react

/**
 * Backdrop for the white sections: a fixed grid of small blue squares. A slow wave runs through it,
 * and squares near the mouse grow and darken. The blue hero, the deep band and the cards paint over it.
 * 2D canvas, redrawn only while the tab is visible. Not mounted on phones or under reduced motion.
 */
export default function PixelField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.innerWidth < 768 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#0079e4";
    const pointer = { x: -999, y: -999 };
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    let frame = 0;
    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const t = now / 1000;
      const shift = window.scrollY % GAP; // the grid scrolls with the page
      for (let y = -shift; y < h + GAP; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const near = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / REACH);
          const wave = 0.5 + 0.5 * Math.sin(x * 0.012 + (y + window.scrollY) * 0.012 - t * 0.9);
          const size = 2 + wave * 1.5 + near * near * 9;
          ctx.globalAlpha = 0.1 + wave * 0.06 + near * 0.5;
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), Math.round(size), Math.round(size));
        }
      }
      frame = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", kick);
    kick();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", kick);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden h-full w-full md:block motion-reduce:md:hidden" />;
}
