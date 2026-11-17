"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import type { Dictionary } from "@/lib/dictionary";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";

// One icon per card, in the order of dictionaries/*.json about.how.
const ICONS: PixelIconName[] = ["check", "shield", "doc"];
// Where each gate sits along the track: the centre of each of the three card columns.
const GATES = [1 / 6, 3 / 6, 5 / 6];
const TRAVEL = { duration: 1000, ease: "inOutCubic" };
const HOLD = 1100;

/**
 * The three "How I work" cards. On desktop a build "packet" glides along a track above them,
 * stops at each gate (test, security, document), lights that card, then ships and starts again.
 */
export default function HowIWork({ items }: { items: Dictionary["about"]["how"] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(-1); // -1 travelling, 0..2 at that gate, 3 shipped

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const packet = track.querySelector<HTMLElement>("[data-packet]");
    const fill = track.querySelector<HTMLElement>("[data-fill]");
    if (!packet || !fill) return;

    const state = { x: 0 };
    let shown = -1;
    const run = animate(state, {
      x: [
        ...GATES.flatMap((g) => [
          { to: g, ...TRAVEL },
          { to: g, duration: HOLD }, // wait at the gate
        ]),
        { to: 1, duration: 800, ease: "inCubic" },
        { to: 1, duration: 900 }, // shipped: all three stay lit for a moment
      ],
      loop: true,
      autoplay: false,
      onUpdate: () => {
        packet.style.transform = `translateX(${(state.x * track.clientWidth).toFixed(1)}px)`;
        fill.style.transform = `scaleX(${state.x.toFixed(4)})`;
        const next = state.x > 0.999 ? 3 : GATES.findIndex((g) => Math.abs(state.x - g) < 0.004);
        if (next !== shown) {
          shown = next;
          setStage(next);
        }
      },
    });
    // Runs only while the track is on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? run.play() : run.pause()));
    io.observe(track);
    return () => {
      io.disconnect();
      run.cancel();
    };
  }, []);

  const lit = (i: number) => stage === i || stage === 3;

  return (
    <>
      {/* Decorative: the cards say the same thing. Hidden on phones (cards stack there) and under reduced motion. */}
      <div ref={trackRef} aria-hidden className="relative mt-6 hidden h-10 md:block motion-reduce:md:hidden">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <div data-fill className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-accent" />
        {GATES.map((g, i) => (
          <span
            key={g}
            style={{ left: `${g * 100}%` }}
            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 transition-colors duration-300 ${lit(i) ? "border-accent bg-accent" : "border-border bg-bg"}`}
          >
            {lit(i) && <span className="absolute -inset-1.5 animate-ping border border-accent" />}
          </span>
        ))}
        <span data-packet className="absolute left-0 top-1/2 -ml-1.5 -mt-1.5 h-3 w-3 bg-accent shadow-[0_0_14px_3px_var(--accent)]" />
      </div>

      <ol data-stagger className="mt-6 grid gap-6 md:mt-4 md:grid-cols-3">
        {items.map((h, i) => (
          <li
            key={h.title}
            data-lit={lit(i) || undefined}
            className="corners bg-surface p-6 transition-colors duration-300 pixel-border data-[lit]:bg-accent-soft data-[lit]:[--pb:var(--accent)]"
          >
            <span className="flex h-10 w-10 items-center justify-center border-2 border-accent text-accent" aria-hidden>
              <PixelIcon name={ICONS[i] ?? "check"} className="h-5 w-5" />
            </span>
            <h4 className="mt-4 text-lg font-semibold tracking-tight">{h.title}</h4>
            <p className="mt-2 text-muted">{h.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
