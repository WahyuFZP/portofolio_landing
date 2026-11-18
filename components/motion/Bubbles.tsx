"use client";

import { useEffect, useRef } from "react";

const COUNT = 22;
const SPARKS = 10;
const REACH = 110; // px around the pointer where bubbles are pushed aside

/**
 * Particles for a colored section (the hero, the Experience band): pixel bubbles that rise and sway,
 * drift away from the mouse, and plus-shaped sparks that twinkle. Fills its positioned parent.
 * `color` is the name of a CSS color variable. Drawn only while on screen; off under reduced motion.
 */
export default function Bubbles({ color, className = "" }: { color: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fill = getComputedStyle(document.documentElement).getPropertyValue(color).trim() || "#fff";
    // Fixed pseudo-random spread, so the scene is the same on every visit.
    const rand = (n: number) => Math.abs((Math.sin(n * 127.1) * 43758.5453) % 1);
    const bubbles = Array.from({ length: COUNT }, (_, i) => ({ x: rand(i + 1), y: rand(i + 31), size: 8 + Math.round(rand(i + 61) * 3) * 4, speed: 16 + rand(i + 91) * 26, push: 0 }));
    const sparks = Array.from({ length: SPARKS }, (_, i) => ({ x: rand(i + 201), y: rand(i + 251), phase: rand(i + 301) * 6 }));
    const pointer = { x: -999, y: -999 };
    let w = 0;
    let h = 0;
    let visible = false;
    let frame = 0;

    const resize = () => {
      w = canvas.width = canvas.clientWidth;
      h = canvas.height = canvas.clientHeight;
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const ring = (x: number, y: number, s: number) => {
      const u = 2; // bar thickness; corners are left out, so it reads as a pixel circle
      ctx.fillRect(x + u, y, s - 2 * u, u);
      ctx.fillRect(x + u, y + s - u, s - 2 * u, u);
      ctx.fillRect(x, y + u, u, s - 2 * u);
      ctx.fillRect(x + s - u, y + u, u, s - 2 * u);
      ctx.fillRect(x + u * 2, y + u * 2, u, u); // highlight
    };
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      for (const b of bubbles) {
        const y = h + 40 - ((b.y * (h + 80) + t * b.speed) % (h + 80)); // rises, then starts again below
        const x0 = b.x * w + Math.sin(t * 0.9 + b.y * 9) * 16;
        // Near the pointer a bubble is nudged sideways, away from it; the nudge eases in and out.
        const dx = x0 - pointer.x;
        const near = Math.max(0, 1 - Math.hypot(dx, y - pointer.y) / REACH);
        b.push += ((dx < 0 ? -1 : 1) * near * 46 - b.push) * 0.08;
        ctx.globalAlpha = 0.35 + near * 0.5;
        ring(Math.round(x0 + b.push), Math.round(y), b.size);
      }
      for (const s of sparks) {
        ctx.globalAlpha = 0.12 + (0.5 + 0.5 * Math.sin(t * 1.5 + s.phase)) * 0.5;
        const x = Math.round(s.x * w);
        const y = Math.round(s.y * h);
        ctx.fillRect(x - 5, y - 1, 10, 2);
        ctx.fillRect(x - 1, y - 5, 2, 10);
      }
      frame = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", kick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", kick);
    };
  }, [color]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
