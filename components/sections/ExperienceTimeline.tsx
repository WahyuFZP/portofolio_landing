import type { Dictionary } from "@/lib/dictionary";
import { tag } from "@/components/ui/styles";

type Job = Dictionary["experience"]["list"][number];

// Decorative 7-character "commit hash", stable for a given role (FNV-1a).
const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

/**
 * Career drawn like a git graph, newest commit on top, in hard pixel blocks.
 * Tech roles sit on the main lane (blue). A role outside tech sits on a side lane (amber) that joins main above it.
 * Every role is listed in full: no tabs. Rows step in one by one (data-stagger, see PixelMotion).
 * Lane geometry: main lane at x=8px, side lane at x=32px, node centre at y=31px, joins at y=12px from the row edges.
 */
export default function ExperienceTimeline({ jobs, label }: { jobs: Job[]; label: string }) {
  return (
    <ol aria-label={label} data-stagger>
      {jobs.map((j, i) => {
        const first = i === 0;
        const last = i === jobs.length - 1;
        const side = j.kind === "other";
        return (
          <li key={`${j.company}-${j.role}`} className="relative grid grid-cols-[3.5rem_1fr]">
            <div aria-hidden className="relative">
              {/* Main lane: starts at the newest commit; on a side row at the very bottom it stops at the join. */}
              <span
                className={`absolute left-2 w-1 bg-accent ${first ? "top-[31px]" : "top-0"} ${last ? (side ? "h-4" : "h-[31px]") : "bottom-0"}`}
              />
              {side ? (
                <>
                  <span className="absolute left-2 top-3 h-1 w-7 bg-line" />
                  <span className={`absolute left-8 top-3 w-1 bg-line ${last ? "h-5" : "bottom-3"}`} />
                  {!last && <span className="absolute bottom-3 left-2 h-1 w-7 bg-line" />}
                  <span className="absolute left-[27px] top-6 h-3.5 w-3.5 bg-line" />
                </>
              ) : (
                <span className={`absolute left-[3px] top-6 h-3.5 w-3.5 bg-accent ${first ? "outline outline-4 outline-accent/25" : ""}`} />
              )}
            </div>

            <div className={last ? "pt-4" : "pb-10 pt-4"}>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span aria-hidden className={side ? "text-line" : "text-accent"}>{hash(j.company + j.role)}</span>
                {first && <span aria-hidden className="bg-accent-soft px-1.5 py-0.5 font-pixel text-accent">HEAD → main</span>}
                {side && <span aria-hidden className="px-1.5 py-0.5 font-pixel text-line outline outline-1 outline-line">branch</span>}
                <span>
                  {j.period} · {j.type} · {j.location}
                </span>
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{j.role}</h3>
              <p className="text-muted">{j.company}</p>
              {j.description.length > 0 && (
                <ul className="mt-4 list-[square] space-y-1.5 pl-5 text-muted">
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
