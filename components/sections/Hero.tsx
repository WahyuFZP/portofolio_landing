import type { Dictionary } from "@/lib/dictionary";
import type { ConstellationData } from "@/lib/constellation";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import HeroScene from "@/components/hero/HeroScene";
import ConstellationPoster from "@/components/hero/ConstellationPoster";
import ProofStrip from "@/components/hero/ProofStrip";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  constellation: ConstellationData;
  caseStudies: number;
}

export default function Hero({ dict, proofDict, constellation, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative py-14 sm:py-20">
      <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr]">
        <div className="relative z-10">
          <p className="boot mb-4 font-pixel text-sm text-accent" style={i(0)}>{dict.eyebrow}</p>
          {/* H1 is the LCP element: no opacity animation on it. */}
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            {profile.name}
            <span className="cursor ml-1 inline-block h-[0.85em] w-[0.45em] translate-y-[0.08em] bg-accent" aria-hidden />
          </h1>
          {/* Tagline is the LCP element on mobile: not animated. */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{dict.tagline}</p>

          <div className="boot mt-8 flex flex-wrap gap-4" style={i(2)}>
            <a href="#projects" className={btnPrimary}>
              {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
            </a>
            <a href={profile.cv} className={btnSecondary} download>
              <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
            </a>
          </div>

          <div className="boot mt-6 flex gap-5 font-mono text-sm text-muted" style={i(3)}>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-text">GitHub ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-text">LinkedIn ↗</a>
            <a href={`mailto:${profile.email}`} className="hover:text-text">Email ↗</a>
          </div>
        </div>

        {/* Mobile: faint, behind the text. Desktop: its own column. Fixed box = no layout shift. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 mx-auto aspect-square max-h-[420px] w-full max-w-[420px] opacity-25 md:pointer-events-auto md:static md:opacity-100">
          <HeroScene data={constellation} hint={dict.sceneHint}>
            <ConstellationPoster data={constellation} />
          </HeroScene>
        </div>
      </div>

      <div className="mt-10">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>
    </section>
  );
}
