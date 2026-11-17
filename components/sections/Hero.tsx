import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import ScrambleText from "@/components/motion/ScrambleText";
import Typewriter from "@/components/motion/Typewriter";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/** Text-only hero: role, name, one-line pitch, two actions, then the proof chips. */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative isolate py-20 sm:py-28">
      <div aria-hidden className="hero-grid absolute inset-x-0 inset-y-6 -z-10" />
      <p className="boot mb-5 font-mono text-sm text-accent" style={i(0)}>{dict.eyebrow}</p>
      {/* H1 is the LCP element: no opacity animation on it. */}
      <h1 aria-label={profile.name} className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
        <ScrambleText text={profile.name} />
      </h1>
      {/* Two lines reserved on phones: the longest phrase wraps there, and the text below must not jump. */}
      <p className="mt-5 min-h-[3.5em] font-pixel text-lg text-accent sm:min-h-[1.75em] sm:text-xl">
        <span aria-hidden>&gt; </span>
        <Typewriter phrases={dict.typed} />
      </p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{dict.tagline}</p>

      <div className="boot mt-9 flex flex-wrap gap-4" style={i(2)}>
        <a href="#projects" className={btnPrimary}>
          {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
        </a>
        <a href={profile.cv} className={btnSecondary} download>
          <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
        </a>
      </div>

      <div className="boot mt-6 flex gap-5 font-mono text-sm text-muted" style={i(3)}>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">GitHub ↗</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent">LinkedIn ↗</a>
        <a href={`mailto:${profile.email}`} className="hover:text-accent">Email ↗</a>
      </div>

      <div className="mt-12">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>
    </section>
  );
}
