import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import { IslandStill } from "@/components/scene/SceneMount";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/** Title screen: the name as the game logo, the role as its subtitle, and a PRESS START button that scrolls to the content. */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col justify-center py-14">
      <div aria-hidden className="stars absolute inset-0 -z-10" />

      {/* H1 is the LCP element: no opacity animation on it. The pink copy behind it is a hard offset shadow, not a blur. */}
      <h1 className="font-pixel text-5xl font-medium leading-[0.95] text-accent [text-shadow:3px_3px_0_var(--pink)] sm:text-7xl sm:[text-shadow:4px_4px_0_var(--pink)]">
        {profile.name}
      </h1>
      <p className="boot mt-5 font-pixel text-lg sm:text-xl" style={i(0)}>{dict.eyebrow}</p>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{dict.tagline}</p>

      <div className="boot mt-9 flex flex-wrap items-center gap-4" style={i(2)}>
        <a href="#projects" className={`${btnPrimary} min-h-12 px-7 text-base`}>
          <span aria-hidden className="cursor">▶</span> {dict.start}
        </a>
        <a href={profile.cv} className={btnSecondary} download>
          <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
        </a>
      </div>

      <div className="boot mt-6 flex gap-5 font-pixel text-sm text-muted" style={i(3)}>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent">GitHub ↗</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent">LinkedIn ↗</a>
        <a href={`mailto:${profile.email}`} className="hover:text-accent">Email ↗</a>
      </div>

      <div className="mt-10">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>

      {/* Where the 3D island is not mounted (phones, reduced motion), a still pixel drawing of it stands in. */}
      <IslandStill className="mx-auto mt-10 w-56 md:hidden motion-reduce:md:block" />
    </section>
  );
}
