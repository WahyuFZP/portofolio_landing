import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import HowIWork from "@/components/about/HowIWork";
import TypedText from "@/components/motion/TypedText";

/** Character sheet: portrait, a stat list (the facts), and the bio in a dialog box that types itself. */
export default function About({ dict }: { dict: Dictionary["about"] }) {
  return (
    <section id="about" className="py-20">
      <SectionHeading title={dict.title} />

      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        <div className="corners mx-auto w-52 self-start bg-surface p-3 pixel-border md:mx-0">
          <Image src={profile.aboutPhoto} alt={dict.photoAlt} width={720} height={900} sizes="184px" className="aspect-[4/5] w-full object-cover" />
          <p className="mt-3 text-center font-pixel text-sm text-accent">{profile.name.split(" ").slice(0, 2).join(" ")}</p>
        </div>

        <div className="space-y-8">
          <dl className="corners divide-y-2 divide-border bg-surface pixel-border">
            {dict.facts.map((f) => (
              <div key={f.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-pixel text-sm text-gold">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          {/* Dialog box: the speaker tab sits on the top edge, a blinking arrow marks "more". */}
          <div className="corners relative bg-surface p-6 pt-8 pixel-border">
            <p className="absolute -top-3 left-4 bg-accent px-2 font-pixel text-sm text-accent-fg">{profile.name.split(" ")[0]}</p>
            <TypedText text={dict.bio} className="max-w-[65ch] text-lg leading-relaxed" />
            <span aria-hidden className="cursor absolute bottom-3 right-4 font-pixel text-accent">▼</span>
          </div>
        </div>
      </div>

      <h3 className="mb-6 mt-16 font-pixel text-2xl">{dict.howTitle}</h3>
      <HowIWork items={dict.how} />
    </section>
  );
}
