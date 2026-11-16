import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading, { Words } from "@/components/ui/SectionHeading";

export default function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid gap-10 md:grid-cols-[auto_1fr]">
        <div className="reveal mx-auto md:mx-0">
          <div className="h-[120px] w-[120px] overflow-hidden bg-surface pixel-border pixel-border-accent">
            <Image src={profile.photo} alt={dict.photoAlt} width={240} height={240} sizes="120px" className="h-full w-full object-cover object-top" />
          </div>
        </div>
        <div>
          <div className="reveal max-w-[65ch] space-y-4 text-lg leading-relaxed text-muted">
            {dict.bio.split("\n\n").map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="reveal mt-8 grid gap-6 sm:grid-cols-3">
            {dict.facts.map((f) => (
              <div key={f.label}>
                <dt className="font-pixel text-xs uppercase tracking-wider text-muted">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <h3 className="mt-16 mb-6 text-2xl font-semibold tracking-tight"><Words text={dict.howTitle} /></h3>
      <ol className="grid gap-6 md:grid-cols-3">
        {dict.how.map((h, i) => (
          <li key={h.title} className="reveal bg-surface p-6 pixel-border">
            <p className="font-pixel text-sm text-accent">0{i + 1}</p>
            <h4 className="mt-2 text-lg font-semibold tracking-tight">{h.title}</h4>
            <p className="mt-2 text-muted">{h.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
