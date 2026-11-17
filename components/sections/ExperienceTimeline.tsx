import type { Dictionary } from "@/lib/dictionary";
import { tag } from "@/components/ui/styles";

type Job = Dictionary["experience"]["list"][number];

/**
 * Work history as a timeline, newest first. Each row: a thin line coming in from the left edge of the
 * screen, a numbered tile, then the role. Every role is shown in full (no tabs).
 * Rows come in one by one on scroll (data-stagger, see Reveal).
 */
export default function ExperienceTimeline({ jobs, label }: { jobs: Job[]; label: string }) {
  return (
    <ol aria-label={label} data-stagger className="space-y-16">
      {jobs.map((j, i) => {
        const n = String(jobs.length - i).padStart(2, "0"); // oldest role is 01
        return (
          <li key={`${j.company}-${j.role}`} className="grid items-start gap-6 md:grid-cols-[minmax(2rem,1fr)_auto_2.4fr] md:gap-8">
            {/* The line runs from the left edge of the screen to the tile. */}
            <span aria-hidden className="relative mt-20 hidden h-px bg-text/70 before:absolute before:right-full before:h-px before:w-screen before:bg-text/70 md:block" />
            <span aria-hidden className="dots flex h-40 w-40 items-end rounded-2xl bg-text p-4 font-display text-6xl leading-none text-bg">
              {n}
            </span>
            <div>
              <p className="flex items-center gap-3 text-sm uppercase tracking-wide">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                {n} — {j.period}
              </p>
              <h3 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{j.role}</h3>
              <p className="mt-2 text-lg">{j.company}</p>
              <p className="text-sm text-muted">
                {j.type} · {j.location}
              </p>
              {j.description.length > 0 && (
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-muted marker:text-accent">
                  {j.description.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
              {j.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {j.tags.map((t) => (
                    <li key={t} className={tag}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
