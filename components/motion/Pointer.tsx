"use client";

import { useEffect, useRef } from "react";

// Pointer effects run only with a mouse, on 768px and wider, and when motion is allowed.
const allowed = () => window.innerWidth >= 768 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Shifts its content a few pixels with the mouse position (parallax). The CSS transition does the smoothing. */
export function Parallax({ strength = 16, className = "", children }: { strength?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed()) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2 * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * 2 * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [strength]);
  return (
    <div ref={ref} className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}>
      {children}
    </div>
  );
}

/** A card that lifts and tilts in 3D toward the mouse while it is hovered. */
export function Tilt({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !allowed()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(700px) rotateX(${(-y * 10).toFixed(1)}deg) rotateY(${(x * 10).toFixed(1)}deg) translateY(-4px)`;
  };
  return (
    <div onPointerMove={onMove} onPointerLeave={(e) => (e.currentTarget.style.transform = "")} className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}>
      {children}
    </div>
  );
}
