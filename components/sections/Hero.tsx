import type { Dictionary } from "@/lib/dictionary";
import Image from "next/image";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative py-14 sm:py-20">
      <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr]">
        <div className="relative z-10">
          <p className="boot mb-4 font-pixel text-sm text-accent" style={i(0)}>{dict.eyebrow}</p>
          {/* H1 is the LCP element: no opacity animation on it. */}
          {/* Not the pixel font: its capital Z reads like a 2, and the name must be unmistakable. */}
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

        {/* Pixel-art scene, drawn by scripts/hero-art.mjs at 240x200 and shown at 2x with hard pixels.
            Its edges fade to black, so on the black theme it melts into the page. Decorative. */}
        <div aria-hidden className="corners mx-auto w-full max-w-[480px]">
          <Image src="/hero/launch-night.png" alt="" width={480} height={400} unoptimized priority className="h-auto w-full [image-rendering:pixelated]" />
        </div>
      </div>

      <div className="mt-10">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>

    </section>
  );
}
