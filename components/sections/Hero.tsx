import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import HeroArt from "@/components/scene/HeroArt";
import HeroHills from "@/components/hero/HeroHills";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/**
 * Two screens. First: a night sky with the name set wide in the middle and hills at the foot.
 * The sky itself is painted by .page-dawn in the layout (blue fading to paper), so the stars canvas can sit between it and the text.
 * Second: on paper, the statement on the left and the orbiting ring on the right.
 */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <>
      <section id="home" className="ink-night relative left-1/2 flex min-h-[calc(100svh-4rem)] w-screen -translate-x-1/2 flex-col items-center overflow-hidden px-4 pt-[16svh] text-center">
        {/* Phones do not get the 3D star field, so the sky there is speckled with CSS instead. */}
        <div aria-hidden className="stars absolute inset-0 -z-10 md:hidden" />
        <p className="boot flex items-center gap-3 text-xs uppercase tracking-[0.18em] sm:text-sm" style={i(0)}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          {dict.eyebrow}
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
        </p>
        {/* H1 is the LCP element: no opacity animation on it. */}
        <h1 className="mt-6 max-w-5xl font-display text-[clamp(1.75rem,4.4vw,3.75rem)] uppercase leading-[1.25] tracking-[0.26em]">{profile.name}</h1>

        <div className="boot relative z-10 mt-9 flex flex-wrap items-center justify-center gap-4" style={i(2)}>
          <a href="#projects" className={btnPrimary}>
            {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
          </a>
          <a href={profile.cv} className={btnSecondary} download>
            <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
          </a>
        </div>

        <HeroHills />
      </section>

      <section aria-label={dict.eyebrow} className="py-16 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.05fr]">
          <div>
            <p className="max-w-xl font-display text-3xl leading-snug text-accent sm:text-4xl">{dict.tagline}</p>
            <div className="mt-7 flex gap-5 text-sm text-muted">
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
    </>
  );
}
