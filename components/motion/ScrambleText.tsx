"use client";

import { useEffect, useRef } from "react";
import { animate, steps } from "animejs";

const NOISE = "ABCDEFGHKMNPRSTUVWXYZ0123456789#/<>_";

/**
 * Text that "decodes": after load the letters turn to noise and lock in one by one, left to right.
 * The real text is what the server renders, so it is what search engines, screen readers and
 * reduced-motion users get. Put the accessible name on the parent (aria-label); this span is decorative.
 */
export default function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const state = { locked: 0 };
    const run = animate(state, {
      locked: text.length,
      duration: 1400,
      delay: 300,
      ease: steps(text.length * 2), // stepped: the noise changes about every 30ms, like a sprite, not every frame
      onUpdate: () => {
        el.textContent = [...text].map((c, i) => (c === " " || i < state.locked ? c : NOISE[Math.floor(Math.random() * NOISE.length)])).join("");
      },
      onComplete: () => {
        el.textContent = text;
      },
    });
    return () => {
      run.cancel();
      el.textContent = text;
    };
  }, [text]);

  return (
    <span ref={ref} aria-hidden>
      {text}
    </span>
  );
}
