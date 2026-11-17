import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

// Small plus signs scattered over the blue band (decorative).
const SPARKS = ["left-[6%] top-[46%]", "left-[44%] top-[38%]", "right-[5%] top-[52%]"];

export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const [first, second, ...rest] = profile.name.split(" ");
  return (
    // Full-bleed blue band: wider than <main>, content re-centred inside.
    <section id="home" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-accent text-accent-fg">
      {SPARKS.map((pos) => (
        <span key={pos} aria-hidden className={`absolute font-mono text-2xl font-bold text-hi ${pos}`}>+</span>
      ))}
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20">
        {/* Dot-matrix wordmark. The H1 still reads as the full name; it is the LCP element, so no opacity animation. */}
        <h1 className="font-dot text-[clamp(2.75rem,12.5vw,9.5rem)] font-black uppercase leading-[0.85] tracking-tight">
          {first} <span className="text-hi">{second}</span>
          <span className="sr-only"> {rest.join(" ")}</span>
        </h1>
        <div className="mt-4 flex flex-wrap justify-between gap-x-10 gap-y-2 font-mono text-xs uppercase tracking-wide sm:text-sm">
          <p>[ {dict.eyebrow} ]</p>
          <p>[ {profile.location} ]</p>
        </div>

        <div className="mt-12 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="max-w-xl font-mono text-lg leading-relaxed">{dict.tagline}</p>
            <div className="boot mt-8 flex flex-wrap gap-4" style={{ "--i": 1 } as React.CSSProperties}>
              <a href="#projects" className={btnPrimary}>
                {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
              </a>
              <a href={profile.cv} className={btnSecondary} download>
                <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
              </a>
            </div>
            <div className="mt-6 flex gap-5 font-mono text-sm">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-hi">GitHub ↗</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-hi">LinkedIn ↗</a>
              <a href={`mailto:${profile.email}`} className="underline underline-offset-4 hover:text-hi">Email ↗</a>
            </div>
          </div>

          {/* Pixel portrait made from the About photo by scripts/portrait-art.mjs: 88x88, shown at 4x with hard pixels. */}
          <div className="card-hi mx-auto w-full max-w-[352px] overflow-hidden md:mr-2">
            <Image src="/hero/portrait-pixel.png" alt="" width={352} height={352} unoptimized priority className="h-auto w-full [image-rendering:pixelated]" />
          </div>
        </div>

        <div className="mt-12 text-text">
          <ProofStrip dict={proofDict} caseStudies={caseStudies} />
        </div>
      </div>
    </section>
  );
}
