"use client";

import { useRef, useState } from "react";
import PixelIcon from "@/components/ui/PixelIcon";

// Where the bugs hide, as percentages of the panel (left, top).
const BUGS: [number, number][] = [[14, 24], [70, 16], [42, 46], [84, 60], [20, 76], [60, 82]];
const REACH = 52; // px: a bug this close to the centre of the lens is found

/**
 * A small game for the About section: move the magnifier over the map to find the hidden bugs.
 * Works with a mouse and with touch (drag or tap). The lens glides with a short CSS transition.
 */
export default function BugScan({ label, hint }: { label: string; hint: string }) {
  const lens = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState<boolean[]>(() => BUGS.map(() => false));
  const count = found.filter(Boolean).length;

  const scan = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (lens.current) lens.current.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
    const hit = BUGS.map(([bx, by], i) => found[i] || Math.hypot((bx / 100) * r.width - x, (by / 100) * r.height - y) < REACH);
    if (hit.some((h, i) => h !== found[i])) setFound(hit);
  };

  return (
    <figure>
      <div onPointerMove={scan} onPointerDown={scan} className="topo relative h-72 touch-pan-y overflow-hidden bg-surface pixel-border sm:h-80 md:cursor-none">
        {BUGS.map(([x, y], i) => (
          <span key={i} aria-hidden style={{ left: `${x}%`, top: `${y}%` }} className={`absolute -ml-4 -mt-4 transition-[color,transform] duration-300 ${found[i] ? "scale-125 text-pink" : "text-black/15"}`}>
            <PixelIcon name="bug" className="h-8 w-8" />
          </span>
        ))}
        {/* The lens: its glass (upper left of the icon) is centred on the pointer. Starts in the middle of the panel. */}
        <div ref={lens} aria-hidden style={{ transform: "translate(170px, 130px)" }} className="pointer-events-none absolute left-0 top-0 transition-transform duration-150 ease-out">
          <PixelIcon name="search" className="-ml-10 -mt-10 h-28 w-28 text-primary" />
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="uppercase text-accent">
          [{label}] {count}/{BUGS.length}
        </span>
        <span className="text-muted">{hint}</span>
      </figcaption>
    </figure>
  );
}
