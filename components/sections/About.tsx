import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading, { Words } from "@/components/ui/SectionHeading";
import HowIWork from "@/components/about/HowIWork";

export default function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid gap-10 md:grid-cols-[auto_1fr]">
        <div className="reveal mx-auto md:mx-0">
          <div className="w-44 overflow-hidden bg-surface pixel-border pixel-border-accent sm:w-52">
            <Image src={profile.aboutPhoto} alt={dict.photoAlt} width={720} height={900} sizes="(min-width: 640px) 208px, 176px" className="aspect-[4/5] w-full object-cover" />
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

      <h3 className="mt-16 mb-2 font-pixel text-xl font-medium"><Words text={dict.howTitle} /></h3>
      <HowIWork items={dict.how} />
    </section>
  );
}
