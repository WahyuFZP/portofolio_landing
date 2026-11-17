"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { Dictionary } from "@/lib/dictionary";
import { tag } from "@/components/ui/styles";

type Job = Dictionary["experience"]["list"][number];

/**
 * Horizontal timeline as a tab list: oldest on the left, newest on the right and open by default.
 * Arrow keys move between roles (standard tabs pattern); the panel below shows the selected one.
 */
export default function ExperienceTimeline({ jobs, label }: { jobs: Job[]; label: string }) {
  const ordered = [...jobs].reverse(); // the dictionary lists newest first
  const [active, setActive] = useState(ordered.length - 1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const job = ordered[active];

  const onKey = (e: React.KeyboardEvent) => {
    const next = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: ordered.length - 1 }[e.key];
    if (next === undefined || next < 0 || next >= ordered.length) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="relative grid" style={{ gridTemplateColumns: `repeat(${ordered.length}, minmax(0, 1fr))` }}>
        {/* Rail: the filled part runs up to the selected role. Dots sit at the centre of each column. */}
        <span className="absolute left-0 right-0 top-[13px] h-0.5 bg-border" aria-hidden />
        <span
          className="absolute left-0 top-[13px] h-0.5 bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${((active + 0.5) / ordered.length) * 100}%` }}
          aria-hidden
        />
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
              className="group relative flex flex-col items-center gap-3 px-1 pb-2 text-center"
            >
              <span
                className={`relative z-10 h-7 w-7 transition-transform duration-300 ${selected ? "scale-100 bg-accent" : "scale-[0.6] bg-surface pixel-border group-hover:scale-75 group-hover:[--pb:var(--accent)]"}`}
                aria-hidden
              />
              <span className={`font-mono text-xs ${selected ? "text-accent" : "text-muted"}`}>{j.period}</span>
              <span className={`text-sm font-semibold tracking-tight sm:text-base ${selected ? "text-text" : "text-muted group-hover:text-text"}`}>{j.role}</span>
            </button>
          );
        })}
      </div>

      <div id="exp-panel" role="tabpanel" aria-labelledby={`exp-tab-${active}`} tabIndex={0} className="mt-8 min-h-72 bg-surface p-6 pixel-border sm:p-8">
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
