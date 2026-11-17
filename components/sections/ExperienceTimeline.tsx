"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, m } from "motion/react";
import type { Dictionary } from "@/lib/dictionary";
import { tag } from "@/components/ui/styles";

type Job = Dictionary["experience"]["list"][number];

// The road, in a 1000 x 300 box: it dips to each stop and climbs between them, like a slide.
// shortcut: three stops are drawn; add a segment (and its stop below) when a fourth role is added.
const ROAD = "M 0 50 C 70 50 100 230 170 230 S 270 40 335 40 S 430 230 500 230 S 600 40 665 40 S 760 230 830 230 S 930 60 1000 60";
const STOPS = [
  { x: 170, y: 230, at: 0.1657 }, // `at` = share of the road's length up to this stop (measured numerically)
  { x: 500, y: 230, at: 0.5024 },
  { x: 830, y: 230, at: 0.8392 },
];

/**
 * Career as a winding road: oldest role on the left, newest on the right and open by default.
 * A marker drives along the curve to the selected stop and the road behind it turns blue.
 * Still a standard tab list: click a stop, or use the arrow keys.
 */
export default function ExperienceTimeline({ jobs, label }: { jobs: Job[]; label: string }) {
  const ordered = [...jobs].reverse().slice(0, STOPS.length); // the dictionary lists newest first
  const [active, setActive] = useState(ordered.length - 1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const at = useRef(0); // marker position, as a share of the road's length
  const job = ordered[active];

  // Drive the marker along the curve to the selected stop.
  useEffect(() => {
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return;
    const total = path.getTotalLength();
    const place = (v: number) => {
      at.current = v;
      const p = path.getPointAtLength(total * v);
      const q = path.getPointAtLength(Math.min(total, total * v + 1)); // a point just ahead gives the heading
      marker.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${((Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI).toFixed(1)})`);
    };
    const target = STOPS[active].at;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return place(target);
    const run = animate(at.current, target, { duration: 1.1, ease: [0.45, 0, 0.2, 1], onUpdate: place });
    return () => run.stop();
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: ordered.length - 1 }[e.key];
    if (next === undefined || next < 0 || next >= ordered.length) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div className="relative mb-20 aspect-[1000/300] sm:mb-24">
        <svg viewBox="0 0 1000 300" aria-hidden className="absolute inset-0 h-full w-full overflow-visible" fill="none" strokeLinecap="round">
          <defs>
            {/* The road is wiped in from the left as it scrolls into view. */}
            <clipPath id="road-wipe">
              <rect className="road-wipe" x="-20" y="-40" width="1040" height="380" />
            </clipPath>
          </defs>
          <g clipPath="url(#road-wipe)">
            <path d={ROAD} stroke="var(--border)" strokeWidth="30" />
            <path d={ROAD} stroke="var(--surface)" strokeWidth="26" />
            {/* Travelled part: fills up to the selected stop. pathLength=1 makes the dash maths unit-free. */}
            <path
              d={ROAD}
              pathLength={1}
              stroke="var(--accent)"
              strokeWidth="26"
              strokeOpacity="0.35"
              strokeDasharray="1"
              strokeDashoffset={1 - STOPS[active].at}
              className="transition-[stroke-dashoffset] duration-[1100ms] ease-[cubic-bezier(0.45,0,0.2,1)]"
            />
            <path ref={pathRef} d={ROAD} stroke="var(--line)" strokeWidth="2" strokeDasharray="10 12" strokeLinecap="butt" />
          </g>
          <g ref={markerRef}>
            {/* Drawn beside the road (44 units to its left), so the stop marker never hides it. */}
            <path d="M -11 -51 L 11 -44 L -11 -37 L -6 -44 Z" fill="var(--line)" stroke="var(--bg)" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </svg>

        <div role="tablist" aria-label={label} onKeyDown={onKey}>
          {ordered.map((j, i) => {
            const selected = i === active;
            return (
              <button
                key={`${j.company}-${j.role}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`exp-tab-${i}`}
                aria-selected={selected}
                aria-controls="exp-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                style={{ left: `${STOPS[i].x / 10}%`, top: `${STOPS[i].y / 3}%` }}
                className="group absolute flex w-28 -translate-x-1/2 flex-col items-center gap-2 pt-0 text-center sm:w-40"
              >
                {/* The stop itself sits on the road; -translate-y centres it on the curve. */}
                <span
                  className={`h-6 w-6 -translate-y-1/2 rotate-45 transition-transform duration-300 ${selected ? "scale-100 bg-accent" : "scale-[0.65] bg-surface pixel-border group-hover:scale-90 group-hover:[--pb:var(--accent)]"}`}
                  aria-hidden
                />
                <span className={`font-mono text-[11px] sm:text-xs ${selected ? "text-accent" : "text-muted"}`}>{j.period}</span>
                <span className={`hidden text-sm font-semibold tracking-tight sm:block ${selected ? "text-text" : "text-muted group-hover:text-text"}`}>{j.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="exp-panel" role="tabpanel" aria-labelledby={`exp-tab-${active}`} tabIndex={0} className="corners min-h-72 bg-surface p-6 pixel-border sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <p className="font-mono text-xs text-muted">
              {job.period} · {job.type} · {job.location}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{job.role}</h3>
            <p className="text-muted">{job.company}</p>
            {job.description.length > 0 && (
              <ul className="mt-4 list-[square] space-y-1.5 pl-5 text-muted">
                {job.description.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
            {job.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <li key={t} className={tag}>{t}</li>
                ))}
              </ul>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
