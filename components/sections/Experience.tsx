import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { certificates } from "@/content/certificates";
import SectionHeading from "@/components/ui/SectionHeading";
import ExperienceTimeline from "./ExperienceTimeline";

interface Props {
  locale: Locale;
  dict: Dictionary["experience"];
}

export default function Experience({ locale, dict }: Props) {
  const fmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { year: "numeric", month: "short", timeZone: "UTC" });
  const month = (ym: string) => fmt.format(new Date(`${ym}-01T00:00:00Z`));

  return (
    <section id="experience" className="py-20">
      <SectionHeading index="03" title={dict.title} />

      <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr]">
        <ExperienceTimeline jobs={dict.list} label={dict.title} />

        {/* Keep the old #certificates anchor working. */}
        <div id="certificates" className="scroll-mt-24">
          <h3 className="reveal mb-5 text-xl font-semibold tracking-tight">{dict.credentialsTitle}</h3>
          <ul className="space-y-4">
            {certificates.map((c) => (
              <li key={c.name} className="reveal bg-surface p-4 pixel-border">
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
                  <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-pixel text-sm text-accent underline underline-offset-4">
                    {dict.verify} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
