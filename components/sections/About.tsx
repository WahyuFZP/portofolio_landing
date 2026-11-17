import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import HowIWork from "@/components/about/HowIWork";

export default function About({ dict }: { dict: Dictionary["about"] }) {
  const [lead, ...rest] = dict.bio.split("\n\n");
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid gap-10 md:grid-cols-[auto_1fr]">
        <div className="mx-auto w-52 self-start overflow-hidden rounded-2xl pixel-border md:mx-0">
          <Image src={profile.aboutPhoto} alt={dict.photoAlt} width={720} height={900} sizes="208px" className="aspect-[4/5] w-full object-cover" />
        </div>

        <div>
          {/* The first paragraph is set large in the serif, like a pull quote; the rest is body text. */}
          <p className="max-w-[40ch] font-display text-3xl leading-snug text-accent">{lead}</p>
          <div className="mt-5 max-w-[65ch] space-y-4 text-lg leading-relaxed text-muted">
            {rest.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {dict.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs uppercase tracking-wide text-muted">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <h3 className="mb-6 mt-16 font-display text-4xl text-accent">{dict.howTitle}</h3>
      <HowIWork items={dict.how} />
    </section>
  );
}
