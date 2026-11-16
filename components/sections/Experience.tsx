import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { certificates } from "@/content/certificates";
import SectionHeading from "@/components/ui/SectionHeading";
import { tag } from "@/components/ui/styles";

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

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <ol className="relative space-y-10 pl-8">
          {/* Timeline line draws itself on scroll (CSS scroll-driven animation). */}
          <span className="timeline-line absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" aria-hidden />
          {dict.list.map((job) => (
            <li key={`${job.company}-${job.role}`} className="reveal relative">
              <span className="absolute -left-8 top-1.5 h-4 w-4 bg-accent" aria-hidden />
              <p className="font-mono text-xs text-muted">
                {job.period} · {job.type} · {job.location}
              </p>
              {job.kind === "other" ? (
                <h3 className="mt-1 text-base">
                  {job.role} <span className="text-muted">— {job.company}</span>
                </h3>
              ) : (
                <>
                  <h3 className="mt-1 font-pixel text-xl">{job.role}</h3>
                  <p className="text-muted">{job.company}</p>
                  <ul className="mt-3 list-[square] space-y-1.5 pl-5 text-muted">
                    {job.description.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <li key={t} className={tag}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ol>

        {/* Keep the old #certificates anchor working. */}
        <div id="certificates" className="scroll-mt-24">
          <h3 className="reveal mb-5 font-pixel text-xl">{dict.credentialsTitle}</h3>
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
