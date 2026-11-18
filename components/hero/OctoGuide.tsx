"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import Octopus from "./Octopus";

const SECTIONS = ["about", "skills", "process", "projects", "experience", "contact"] as const;
type Section = (typeof SECTIONS)[number];

/**
 * The mascot as a page guide: once the hero has scrolled away it sits in the bottom-right corner
 * with a speech bubble that sums up the section in view. The octopus is a button that opens and
 * closes the bubble. Until the visitor chooses, CSS decides: open from 768px up, closed on phones
 * (where the bubble would cover the content).
 */
export default function OctoGuide({ dict }: { dict: Dictionary["guide"] }) {
  const [section, setSection] = useState<Section | null>(null); // null while the hero is in view
  const [open, setOpen] = useState<boolean | null>(null); // null = not chosen yet, the breakpoint decides

  useEffect(() => {
    // A section counts as "in view" while it crosses the middle of the screen; the hero clears the guide.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          setSection(e.target.id === "home" ? null : (e.target.id as Section));
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["home", ...SECTIONS].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const shown = section !== null;
  return (
    <div
      // inert while hidden, so the off-screen button cannot be focused.
      inert={!shown}
      className={`fixed bottom-4 right-4 z-40 flex items-end gap-3 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"}`}
    >
      {open !== false && section && (
        <p key={section} role="status" className={`corners boot relative mb-6 max-w-[15rem] ${open === null ? "hidden md:block" : ""} bg-surface p-3 pr-7 text-sm leading-snug pixel-border`}>
          {dict[section]}
          <button type="button" onClick={() => setOpen(false)} aria-label={dict.close} className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center text-base leading-none">
            ×
          </button>
          {/* Tail of the bubble, pointing at the octopus. */}
          <span aria-hidden className="absolute -right-[9px] bottom-4 h-3 w-3 rotate-45 border-r-2 border-t-2 border-black bg-surface" />
        </p>
      )}
      <button type="button" onClick={() => setOpen((o) => (o === null ? window.innerWidth < 768 : !o))} aria-expanded={open ?? undefined} aria-label={dict.toggle} className="w-16 shrink-0 rounded-lg sm:w-20">
        <Octopus className="bob w-full" />
      </button>
    </div>
  );
}
