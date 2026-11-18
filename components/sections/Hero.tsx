import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import Octopus from "@/components/hero/Octopus";
import { Parallax } from "@/components/motion/Pointer";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/**
 * Opening screen on the primary blue: the name in the dot-matrix face, bracket tags, the tagline and the octopus mascot.
 * Contrast on blue: white is used only for large text (4:1); small text is black (5.2:1) or sits in white chips.
 */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const [first, second, ...rest] = profile.name.split(" ");
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  return (
    <section id="home" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-primary text-white">
      {/* Ornaments drift a little with the mouse. */}
      <Parallax strength={10} className="pointer-events-none absolute inset-0 hidden font-mono text-3xl font-bold md:block">
        <span aria-hidden className="absolute left-[7%] top-[44%] text-action">+</span>
        <span aria-hidden className="absolute left-[46%] top-[36%] text-pink">+</span>
        <span aria-hidden className="absolute right-[6%] top-[58%] text-action">+</span>
      </Parallax>

      <div className="relative mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        {/* H1 is the LCP element: no opacity animation on it. It still reads as the full name. */}
        <h1 className="font-display text-[clamp(3.25rem,13.5vw,10.5rem)] uppercase leading-[0.82]">
          {first} <span className="text-action">{second}</span>
          <span className="sr-only"> {rest.join(" ")}</span>
        </h1>
        <div className="mt-5 flex flex-wrap justify-between gap-x-10 gap-y-3 text-sm uppercase text-black">
          <p>
            [{dict.roleTag}]
            <br />
            {dict.eyebrow}
          </p>
          <p className="sm:text-right">
            [{dict.baseTag}]
            <br />
            {profile.location}
          </p>
        </div>

        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1.15fr_1fr]">
          <div className="pb-12">
            <p className="max-w-xl text-2xl leading-snug">{dict.tagline}</p>
            <div className="boot mt-8 flex flex-wrap gap-4" style={i(2)}>
              <a href="#projects" className={btnPrimary}>
                {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
              </a>
              <a href={profile.cv} className={btnSecondary} download>
                <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
              </a>
            </div>
            <div className="mt-8 text-black">
              <ProofStrip dict={proofDict} caseStudies={caseStudies} />
            </div>
          </div>

          {/* The mascot rises from below on load, bobs gently, and shifts with the mouse. Shown at whole multiples of its 28px grid. */}
          <Parallax strength={18} className="mx-auto w-full max-w-[392px]">
            <div className="boot" style={i(1)}>
              <Octopus className="bob w-full" />
            </div>
          </Parallax>
        </div>
      </div>

      {/* Pixel edge: a row of squares where the blue meets the page. */}
      <div aria-hidden className="h-6 bg-[linear-gradient(90deg,var(--paper)_50%,transparent_50%)] bg-[length:48px_100%]" />
      <div aria-hidden className="h-3 bg-paper" />
    </section>
  );
}
