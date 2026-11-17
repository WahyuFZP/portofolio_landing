import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "./ContactForm";

export default function Contact({ dict }: { dict: Dictionary["contact"] }) {
  return (
    <section id="contact" className="py-20">
      <SectionHeading title={dict.title} subtitle={dict.subtitle} />
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
        <dl className="space-y-5">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">{dict.emailLabel}</dt>
            <dd className="mt-1">
              <a href={`mailto:${profile.email}`} className="font-medium underline underline-offset-4 hover:text-accent">
                {profile.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">{dict.locationLabel}</dt>
            <dd className="mt-1 font-medium">{profile.location}</dd>
          </div>
        </dl>
        {/* Pixel-art scene drawn by scripts/contact-art.mjs (160x120, shown at 2x with hard pixels). Decorative. */}
        <div aria-hidden className="corners mt-10 hidden w-full max-w-[320px] md:block">
          <Image src="/hero/ground-station.png" alt="" width={320} height={240} unoptimized loading="lazy" className="h-auto w-full [image-rendering:pixelated]" />
        </div>
        </div>
        <ContactForm dict={dict} />
      </div>
    </section>
  );
}
