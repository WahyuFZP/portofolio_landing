"use client";

import { useEffect, useRef } from "react";
import { animate, inView } from "motion";

/**
 * Dialog-box text that types itself once, when it scrolls into view.
 * The full text is always in the page (it reserves the space and is what screen readers,
 * no-JavaScript and reduced-motion users get); the typed copy is laid over it.
 */
export default function TypedText({ text, className = "" }: { text: string; className?: string }) {
  const full = useRef<HTMLSpanElement>(null);
  const typed = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const a = full.current;
    const b = typed.current;
    if (!a || !b || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    a.style.visibility = "hidden"; // keeps its space; the typed copy takes over
    b.hidden = false;
    let run: ReturnType<typeof animate> | undefined;
    const stop = inView(a, () => {
      stop();
      run = animate(0, text.length, { duration: text.length * 0.014, ease: "linear", onUpdate: (n) => (b.textContent = text.slice(0, Math.round(n))) });
    });
    return () => {
      stop();
      run?.stop();
      a.style.visibility = "";
      b.hidden = true;
    };
  }, [text]);

  return (
    <span className={`relative block whitespace-pre-line ${className}`}>
      <span ref={full}>{text}</span>
      <span ref={typed} hidden aria-hidden className="absolute inset-0" />
    </span>
  );
}
