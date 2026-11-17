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
        <div className="corners self-start bg-surface p-6 pixel-border">
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
          <p className="mt-6 flex gap-5 font-pixel text-sm">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">GitHub ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">LinkedIn ↗</a>
          </p>
        </div>
        </div>
        <ContactForm dict={dict} />
      </div>
    </section>
  );
}
