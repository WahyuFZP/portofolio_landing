"use client";

import { useEffect, useRef } from "react";
import { animate, steps } from "animejs";

/**
 * Types each phrase letter by letter, holds it, deletes it, then moves to the next one, forever.
 * The server renders the first phrase, so that is what shows without JavaScript or under reduced motion.
 * Screen readers get the whole list once (sr-only) instead of text that keeps changing.
 */
export default function Typewriter({ phrases }: { phrases: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let stopped = false;
    let run: ReturnType<typeof animate> | undefined;
    const cycle = () => {
      const text = phrases[i % phrases.length];
      const state = { n: i === 0 ? text.length : 0 }; // the first phrase is already on screen: hold it, then delete
      run = animate(state, {
        n: [
          { to: text.length, duration: (text.length - state.n) * 45, ease: steps(Math.max(1, text.length - state.n)) },
          { to: text.length, duration: 1700 },
          { to: 0, duration: text.length * 18, ease: steps(text.length) },
        ],
        onUpdate: () => {
          el.textContent = text.slice(0, Math.round(state.n));
        },
        onComplete: () => {
          i++;
          if (!stopped) cycle();
        },
      });
    };
    cycle();
    return () => {
      stopped = true;
      run?.cancel();
      el.textContent = phrases[0];
    };
  }, [phrases]);

  return (
    <>
      <span ref={ref} aria-hidden>
        {phrases[0]}
      </span>
      <span className="cursor ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-accent" aria-hidden />
      <span className="sr-only">{phrases.join(", ")}</span>
    </>
  );
}
