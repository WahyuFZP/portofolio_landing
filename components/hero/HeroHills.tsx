"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * The landscape at the foot of the hero: paper-colored hills with ink patches, and a small figure looking at the sky.
 * Three layers slide at different speeds as the hero scrolls away (parallax). Decorative, drawn here: no image files.
 */
export default function HeroHills() {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["end end", "end start"] }); // 0 = hero fully in view, 1 = scrolled away
  const far = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : 110]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : 55]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-x-0 bottom-0 h-[44svh]">
    <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      {/* Far hills */}
      <m.g style={{ y: far }}>
        <path d="M -40 300 C 160 150 430 150 800 420 L -40 420 Z" fill="var(--paper)" />
        <path d="M 120 250 C 190 205 300 215 330 262 C 350 300 250 318 190 305 C 130 294 90 275 120 250 Z" fill="var(--ink-black)" />
        <path d="M 400 262 C 450 240 520 268 560 308 C 510 326 430 312 400 262 Z" fill="var(--ink-black)" />
        <path d="M 1480 250 C 1280 250 1090 330 960 420 L 1480 420 Z" fill="var(--paper)" />
        <path d="M 1300 300 C 1350 280 1420 290 1440 318 C 1400 342 1320 338 1300 300 Z" fill="var(--ink-black)" />
      </m.g>
      {/* Near ground and the figure standing on it */}
      <m.g style={{ y: mid }}>
        <path d="M -40 372 C 300 300 620 292 760 300 C 960 312 1220 340 1480 304 L 1480 520 L -40 520 Z" fill="var(--ink-black)" />
        <path d="M 60 382 C 220 338 420 336 520 356 C 430 392 190 410 60 382 Z" fill="var(--paper)" />
        <path d="M 600 318 C 700 300 860 304 930 326 C 850 350 680 350 600 318 Z" fill="var(--paper)" />
        <path d="M 1010 352 C 1130 330 1300 340 1400 366 C 1290 398 1090 392 1010 352 Z" fill="var(--paper)" />
        <path d="M 300 408 C 520 384 820 392 980 412 L 980 430 L 300 430 Z" fill="var(--paper)" />
        {/* Figure: head, long coat, legs, and a small lantern */}
        <g transform="translate(748 196)">
          <circle cx="12" cy="8" r="9" fill="var(--ink-black)" />
          <path d="M 2 20 L 22 20 L 30 86 L -6 86 Z" fill="var(--ink-black)" />
          <path d="M 6 86 L 6 112 M 18 86 L 18 112" stroke="var(--ink-black)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="36" cy="58" r="4" fill="var(--sun)" />
        </g>
      </m.g>
    </svg>
    </div>
  );
}
