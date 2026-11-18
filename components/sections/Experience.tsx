import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { certificates } from "@/content/certificates";
import SectionHeading from "@/components/ui/SectionHeading";
import ExperienceTimeline from "./ExperienceTimeline";
import Bubbles from "@/components/motion/Bubbles";
import { Fish, Seaweed } from "@/components/ui/Reef";

interface Props {
  locale: Locale;
  dict: Dictionary["experience"];
}

export default function Experience({ locale, dict }: Props) {
  const fmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { year: "numeric", month: "short", timeZone: "UTC" });
  const month = (ym: string) => fmt.format(new Date(`${ym}-01T00:00:00Z`));

  return (
    // Full-bleed: wider than <main>, content re-centred inside. overflow-hidden clips the lines that run off the left edge.
    <section id="experience" className="band-night relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden py-24">
      <Bubbles color="--action" className="-z-10" />
      <Fish shape="angel" color="var(--primary)" top="7%" time="38s" delay="-9s" className="-z-10 h-9 w-10" />
      <Fish shape="long" color="var(--action)" top="33%" time="24s" delay="-17s" rev className="-z-10 h-4 w-14" />
      <Fish shape="puffer" color="var(--pink)" top="58%" time="46s" delay="-31s" className="-z-10 h-7 w-10" />
      <Fish shape="fish" color="var(--action)" top="84%" time="30s" delay="-3s" rev className="-z-10 h-6 w-10" />
      <Seaweed colors={["var(--action)", "var(--primary)"]} className="absolute bottom-0 left-0 -z-10 h-28 w-24 sm:h-48 sm:w-40" />
      <Seaweed colors={["var(--primary)", "var(--action)"]} fronds={4} className="absolute bottom-0 right-0 -z-10 h-24 w-20 -scale-x-100 sm:h-40 sm:w-32" />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <SectionHeading index="03" title={dict.title} />

      <div className="space-y-20">
        <ExperienceTimeline jobs={dict.list} label={dict.title} showAll={dict.showAll} />

        {/* Keep the old #certificates anchor working. */}
        <div id="certificates" className="scroll-mt-24">
          <h3 className="mb-6 font-display text-4xl uppercase text-accent">{dict.credentialsTitle}</h3>
          <ul data-stagger className="grid gap-4 md:grid-cols-2">
            {certificates.map((c) => (
              <li key={c.name} className="corners bg-surface p-4 pixel-border">
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {c.issuer} · {dict.issued} <time dateTime={c.date}>{month(c.date)}</time>
                </p>
                {c.credentialId && (
                  <p className="mt-1 font-mono text-xs text-muted">
                    {dict.credentialId}: {c.credentialId}
                  </p>
                )}
                {c.verifyUrl && (
                  <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block py-2 font-pixel text-sm text-accent underline underline-offset-4">
                    {dict.verify} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </section>
  );
}
