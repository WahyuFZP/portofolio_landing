import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";
import ContactForm from "./ContactForm";

/** Four big link cards (email, LinkedIn, GitHub, CV) beside the message form. The pixel mountains below belong to the footer. */
export default function Contact({ dict }: { dict: Dictionary["contact"] }) {
  const links: { icon: PixelIconName; label: string; value: string; href: string; download?: boolean }[] = [
    { icon: "send", label: dict.emailLabel, value: profile.email, href: `mailto:${profile.email}` },
    { icon: "external", label: "LinkedIn", value: profile.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: profile.linkedin },
    { icon: "api", label: "GitHub", value: profile.github.replace(/^https?:\/\//, ""), href: profile.github },
    { icon: "download", label: "CV", value: "PDF", href: profile.cv, download: true },
  ];
  return (
    <section id="contact" className="py-20">
      <SectionHeading title={dict.title} subtitle={dict.subtitle} />
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <ul data-stagger className="grid grid-cols-2 gap-5">
            {links.map((l) => (
              <li key={l.label} className="min-w-0">
                <a
                  href={l.href}
                  {...(l.download ? { download: true } : l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="corners block h-full bg-surface p-4 transition-colors duration-300 pixel-border hover:bg-action focus-visible:bg-action"
                >
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-md bg-action text-black pixel-border">
                    <PixelIcon name={l.icon} className="h-5 w-5" />
                  </span>
                  <span className="mt-3 block text-sm uppercase text-accent">[{l.label}]</span>
                  <span className="mt-1 block truncate text-sm">{l.value}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <span className="uppercase text-accent">[{dict.locationLabel}]</span> {profile.location}
          </p>
        </div>
        <ContactForm dict={dict} />
      </div>
    </section>
  );
}
