"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

// Loaded only in the browser, after the page is idle: text always renders first.
const Ring = dynamic(() => import("./Ring"), { ssr: false });

/**
 * The hero illustration. A flat SVG drawing is always there (server-rendered); on wide screens with
 * motion allowed and WebGL present, the live 3D ring fades in over it.
 */
export default function HeroArt() {
  const [live, setLive] = useState(false);
  useEffect(() => afterLoadIdle(() => setLive(canRun3D())), []);

  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 200 200" className={`h-full w-full transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}>
        {/* Back half of the band, the ball, the front half, then the phone. */}
        <path d="M 30 78 A 70 20 0 0 1 170 78 L 170 58 A 70 20 0 0 0 30 58 Z" fill="var(--blue)" opacity="0.75" />
        <circle cx="100" cy="72" r="27" fill="var(--peach)" />
        <circle cx="100" cy="72" r="9" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
        <path d="M 30 78 A 70 20 0 0 0 170 78 L 170 104 A 70 20 0 0 1 30 104 Z" fill="var(--blue)" />
        <path d="M 62 150 L 138 132 L 156 146 L 80 166 Z" fill="var(--ink)" />
        <path d="M 66 150 L 137 134 L 151 145 L 81 162 Z" fill="var(--blue)" />
      </svg>
      {live && (
        <div className="absolute inset-0">
          <Ring />
        </div>
      )}
    </div>
  );
}
