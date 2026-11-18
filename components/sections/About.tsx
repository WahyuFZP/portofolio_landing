import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";
import BugScan from "@/components/about/BugScan";

// One icon per "how I work" card, in the order of dictionaries/*.json about.how.
const ICONS: PixelIconName[] = ["check", "shield", "doc"];

/** A short introduction and the facts on the left, the bug-finding game on the right, then three cards on how I work. */
export default function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid items-start gap-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h3 className="font-display text-4xl text-primary">{dict.whoTitle}</h3>
          <p className="mt-4 max-w-[46ch] text-lg leading-relaxed">{dict.short}</p>
          <dl className="mt-8 space-y-4">
            {dict.facts.map((f) => (
              <div key={f.label} className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                <dt className="text-sm uppercase text-accent">[{f.label}]</dt>
                <dd className="text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <BugScan label={dict.scan} hint={dict.scanHint} />
      </div>

      <h3 className="mb-6 mt-16 font-display text-4xl text-primary">{dict.howTitle}</h3>
      <ol data-stagger className="grid gap-7 md:grid-cols-3">
        {dict.how.map((h, i) => (
          <li key={h.title} className="corners bg-surface p-5 pixel-border">
            <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-md bg-action text-black pixel-border">
              <PixelIcon name={ICONS[i] ?? "check"} className="h-6 w-6" />
            </span>
            <h4 className="mt-4 text-lg font-semibold">{h.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
