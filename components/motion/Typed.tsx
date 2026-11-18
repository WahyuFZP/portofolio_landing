"use client";

import { useEffect, useState } from "react";

/**
 * Typewriter: types the text once, letter by letter, with a blinking block cursor.
 * The server renders the whole text and the untyped part keeps its space (invisible), so nothing shifts
 * and nothing is lost without JavaScript or under reduced motion. Screen readers get the full text at once.
 */
export default function Typed({ text, speed = 28 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState(text.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const timer = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <span aria-label={text} role="text">
      <span aria-hidden>{text.slice(0, shown)}</span>
      <span aria-hidden className="cursor -mr-[0.6em] inline-block h-[1em] w-[0.6em] translate-y-[0.12em] bg-action" />
      <span aria-hidden className="invisible">{text.slice(shown)}</span>
    </span>
  );
}
