import type { Dictionary } from "@/lib/dictionary";
import { tag } from "@/components/ui/styles";
import { skillLogo, skills } from "@/content/skills";

// Tag text -> logo, for the tags that name a skill with a logo.
const logoOf = (name: string) => {
  const s = skills.find((k) => k.name === name);
  return s && skillLogo(s.id);
};

type Job = Dictionary["experience"]["list"][number];
const SHOWN = 2; // bullets visible before "show all"

/**
 * Work history as a compact timeline, newest first. A spine on the left fills in as the section scrolls
 * (CSS scroll-driven, see .timeline-line), each role hangs off a square node, and a role lists its first
 * two points with the rest behind a native <details>. Rows come in one by one on scroll (data-stagger).
 */
export default function ExperienceTimeline({ jobs, label, showAll }: { jobs: Job[]; label: string; showAll: string }) {
  return (
    <div className="relative">
      {/* The spine: a faint track, and over it the bright part that grows with the scroll. */}
      <span aria-hidden className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-text/20" />
      <span aria-hidden className="timeline-line absolute bottom-2 left-[11px] top-2 w-0.5 bg-accent" />

      <ol aria-label={label} data-stagger className="space-y-10">
        {jobs.map((j, i) => {
          const n = String(jobs.length - i).padStart(2, "0"); // oldest role is 01
          const rest = j.description.slice(SHOWN);
          return (
            <li key={`${j.company}-${j.role}`} className="relative grid gap-x-6 gap-y-3 pl-10 sm:grid-cols-[5.5rem_1fr]">
              {/* Node on the spine; the newest one pulses. */}
              <span aria-hidden className={`absolute left-[5px] top-2 h-3.5 w-3.5 bg-accent ${i === 0 ? "animate-ping" : "hidden"}`} />
              <span aria-hidden className="absolute left-[5px] top-2 h-3.5 w-3.5 bg-accent" />

              <span aria-hidden className="dots hidden h-[5.5rem] w-[5.5rem] items-end rounded-lg bg-text p-2.5 font-display text-4xl leading-none text-bg sm:flex">
                {n}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-accent">
                  [{n}] {j.period} · {j.type}
                </p>
                <h3 className="mt-1.5 text-2xl font-semibold leading-tight">{j.role}</h3>
                <p className="mt-1 text-sm text-muted">
                  {j.company} · {j.location}
                </p>
                {j.description.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted marker:text-accent">
                    {j.description.slice(0, SHOWN).map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
                {rest.length > 0 && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer py-2 text-accent underline underline-offset-4">
                      {showAll} (+{rest.length})
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-muted marker:text-accent">
                      {rest.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {j.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {j.tags.map((t) => (
                      <li key={t} className={`${tag} gap-1.5 !py-1`}>
                        {logoOf(t) ? (
                          // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG
                          <img src={logoOf(t)} alt="" width={16} height={16} loading="lazy" decoding="async" className="h-4 w-4 rounded-sm bg-white" />
                        ) : (
                          <span aria-hidden className="h-2 w-2 bg-accent" />
                        )}
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
