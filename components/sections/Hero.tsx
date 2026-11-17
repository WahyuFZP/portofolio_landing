import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import HeroArt from "@/components/scene/HeroArt";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/** Hero: a serif statement on the left, the orbiting ring on the right, on speckled paper. */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative isolate py-14 sm:py-20">
      <div aria-hidden className="stars absolute inset-0 -z-10" />

      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="boot mb-5 text-sm uppercase tracking-wide text-accent" style={i(0)}>{dict.eyebrow}</p>
          {/* H1 is the LCP element: no opacity animation on it. */}
          <h1 className="font-display text-6xl leading-[0.95] text-accent sm:text-7xl">{profile.name}</h1>
          <p className="mt-6 max-w-xl font-display text-2xl leading-snug text-accent sm:text-3xl">{dict.tagline}</p>

          <div className="boot mt-9 flex flex-wrap items-center gap-4" style={i(2)}>
            <a href="#projects" className={btnPrimary}>
              {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
            </a>
            <a href={profile.cv} className={btnSecondary} download>
              <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
            </a>
          </div>
          <div className="boot mt-6 flex gap-5 text-sm text-muted" style={i(3)}>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">GitHub ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">LinkedIn ↗</a>
            <a href={`mailto:${profile.email}`} className="underline underline-offset-4 hover:text-accent">Email ↗</a>
          </div>
        </div>

        <HeroArt />
      </div>

      <div className="mt-12">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>
    </section>
  );
}
