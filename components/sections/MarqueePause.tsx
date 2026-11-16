"use client";

import { useState } from "react";

/** Wraps the moving tech-stack band and adds a pause/resume button. CSS reads data-paused. */
export default function MarqueePause({ pause, play, children }: { pause: string; play: string; children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <div data-paused={paused} className="my-8">
      {children}
      {/* Outside the aria-hidden band so keyboard, touch, and assistive tech can reach it (WCAG 2.2.2). */}
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        className="ml-auto mt-2 flex min-h-11 items-center gap-2 px-3 font-pixel text-xs text-muted hover:text-text motion-reduce:hidden"
      >
        <span aria-hidden>{paused ? "▶" : "❚❚"}</span>
        {paused ? play : pause}
      </button>
    </div>
  );
}
