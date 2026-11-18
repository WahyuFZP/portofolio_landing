import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon from "@/components/ui/PixelIcon";

/** Two short blocks (who I am, how I work) beside one pixel illustration: a magnifier over a bug. */
export default function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-10">
          <div>
            <h3 className="font-display text-4xl text-primary">{dict.whoTitle}</h3>
            <div className="mt-4 max-w-[62ch] space-y-4 leading-relaxed text-muted">
              {dict.bio.split("\n\n").map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-4xl text-primary">{dict.howTitle}</h3>
            <ul className="mt-4 max-w-[62ch] space-y-3">
              {dict.how.map((h) => (
                <li key={h.title} className="leading-relaxed text-muted">
                  <strong className="text-text">{h.title}.</strong> {h.body}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Decorative. The bug sits inside the lens; the whole piece floats slowly. */}
        <div aria-hidden className="bob relative mx-auto h-64 w-64 text-primary sm:h-80 sm:w-80">
          <PixelIcon name="search" className="h-full w-full" />
          <PixelIcon name="bug" className="absolute left-[19%] top-[19%] h-[30%] w-[30%] text-pink" />
        </div>
      </div>

      <dl className="mt-14 grid gap-6 sm:grid-cols-3">
        {dict.facts.map((f) => (
          <div key={f.label}>
            <dt className="text-sm uppercase text-accent">[{f.label}]</dt>
            <dd className="mt-1 font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
