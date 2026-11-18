"use client";

import { useEffect, useRef } from "react";

const GAP = 30; // px between squares
const REACH = 150; // px around the pointer where squares react
const BUBBLES = 16;
const SPARKS = 12;

/**
 * Backdrop for the white sections, in three layers on one 2D canvas:
 * a grid of small blue squares (a slow wave runs through it; squares near the mouse grow and darken),
 * pixel bubbles that rise and sway, and plus-shaped sparks that twinkle in place.
 * The blue hero, the deep band and the cards paint over it. Redrawn only while the tab is visible.
 * Not mounted on phones or under reduced motion.
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
    // Fixed pseudo-random spread, so the scene is the same on every visit.
    const rand = (n: number) => (Math.sin(n * 127.1) * 43758.5453) % 1;
    const bubbles = Array.from({ length: BUBBLES }, (_, i) => ({ x: Math.abs(rand(i + 1)), y: Math.abs(rand(i + 31)), size: 8 + Math.round(Math.abs(rand(i + 61)) * 3) * 4, speed: 14 + Math.abs(rand(i + 91)) * 22 }));
    const sparks = Array.from({ length: SPARKS }, (_, i) => ({ x: Math.abs(rand(i + 201)), y: Math.abs(rand(i + 251)), phase: Math.abs(rand(i + 301)) * 6 }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    /** A hollow pixel bubble: four bars with the corners left out. */
    const bubble = (x: number, y: number, s: number) => {
      const u = 2; // bar thickness
      ctx.fillRect(x + u, y, s - 2 * u, u);
      ctx.fillRect(x + u, y + s - u, s - 2 * u, u);
      ctx.fillRect(x, y + u, u, s - 2 * u);
      ctx.fillRect(x + s - u, y + u, u, s - 2 * u);
      ctx.fillRect(x + u * 2, y + u * 2, u, u); // highlight
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

      ctx.globalAlpha = 0.28;
      for (const b of bubbles) {
        const y = h + 40 - ((b.y * (h + 80) + t * b.speed) % (h + 80)); // rises, then starts again below the screen
        const x = b.x * w + Math.sin(t * 0.8 + b.y * 9) * 14;
        bubble(Math.round(x), Math.round(y), b.size);
      }
      for (const s of sparks) {
        const on = 0.5 + 0.5 * Math.sin(t * 1.4 + s.phase);
        ctx.globalAlpha = 0.08 + on * 0.3;
        const x = Math.round(s.x * w);
        const y = Math.round(s.y * h);
        ctx.fillRect(x - 5, y - 1, 10, 2);
        ctx.fillRect(x - 1, y - 5, 2, 10);
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
