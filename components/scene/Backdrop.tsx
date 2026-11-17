"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

// Loaded only in the browser, after the page is idle: text always renders first.
const Stars = dynamic(() => import("./Stars"), { ssr: false });

/** A small light that trails the mouse: a dot that keeps up closely and a ring that lags behind it. */
function Firefly() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = { x: -100, y: -100 };
    const d = { ...target };
    const r = { ...target };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
    };
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      // Exponential easing: frame-rate independent, and it never overshoots.
      const fast = 1 - Math.exp(-dt * 18);
      const slow = 1 - Math.exp(-dt * 5);
      d.x += (target.x - d.x) * fast;
      d.y += (target.y - d.y) * fast;
      r.x += (target.x - r.x) * slow;
      r.y += (target.y - r.y) * slow;
      if (dot.current) dot.current.style.transform = `translate(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px)`;
      if (ring.current) ring.current.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`;
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const base = "pointer-events-none fixed left-0 top-0 z-50 rounded-full [transform:translate(-100px,-100px)]";
  return (
    <>
      <span ref={ring} aria-hidden data-firefly="ring" className={`${base} -ml-5 -mt-5 h-10 w-10 border border-[var(--sun)] opacity-70`} />
      <span ref={dot} aria-hidden data-firefly="dot" className={`${base} -ml-1 -mt-1 h-2 w-2 bg-[var(--sun)]`} />
    </>
  );
}

/** Mounts the star-field backdrop and the pointer light only on wide screens with motion allowed and WebGL present. */
export default function Backdrop() {
  const [show, setShow] = useState(false);
  useEffect(() => afterLoadIdle(() => setShow(canRun3D())), []);
  return show ? (
    <>
      <Stars />
      <Firefly />
    </>
  ) : null;
}
