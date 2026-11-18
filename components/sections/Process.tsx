import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";

// One icon per step, in the order of dictionaries/*.json process.steps: plan, test, report, verify.
const ICONS: PixelIconName[] = ["doc", "bug", "send", "check"];

/** The QA process as four cards over a contour-map pattern, joined by a dashed route. A card turns lime while hovered or focused. */
export default function Process({ dict }: { dict: Dictionary["process"] }) {
  return (
    <section id="process" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="topo relative p-5 pixel-border sm:p-8">
        {/* The route the cards sit on (desktop). Decorative. */}
        <svg aria-hidden viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute left-8 top-1/2 hidden h-24 w-[calc(100%-4rem)] -translate-y-1/2 md:block">
          <path d="M 0 50 C 120 0 220 100 340 50 S 560 0 680 50 S 900 100 1000 50" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 10" vectorEffect="non-scaling-stroke" className="march" />
        </svg>
        <ol data-stagger className="relative grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {dict.steps.map((s, n) => (
            <li key={s.title} tabIndex={0} className="corners relative overflow-hidden bg-surface p-5 transition-colors duration-300 pixel-border hover:bg-action focus-visible:bg-action">
              <span aria-hidden className="step-on absolute inset-x-0 top-0 h-2 bg-action" style={{ "--n": n } as React.CSSProperties} />
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl leading-none text-primary">0{n + 1}</span>
                <PixelIcon name={ICONS[n] ?? "check"} className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold uppercase">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
