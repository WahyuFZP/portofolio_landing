import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";
import ProofStrip from "@/components/hero/ProofStrip";
import Octopus from "@/components/hero/Octopus";
import { Parallax } from "@/components/motion/Pointer";
import Typed from "@/components/motion/Typed";
import Bubbles from "@/components/motion/Bubbles";

interface Props {
  dict: Dictionary["hero"];
  proofDict: Dictionary["proof"];
  caseStudies: number;
}

/**
 * Opening screen on the primary blue, sized to fit one screen on desktop (type and mascot scale with the viewport height).
 * Contrast on blue: white is used only for large or bold-large text (4:1); small text sits in white cards.
 */
export default function Hero({ dict, proofDict, caseStudies }: Props) {
  const [first, second, ...rest] = profile.name.split(" ");
  const i = (n: number) => ({ "--i": n }) as React.CSSProperties;
  const cards: [icon: PixelIconName, label: string, value: string, shadow: string][] = [
    ["bug", dict.roleTag, dict.eyebrow, "var(--action)"],
    ["pin", dict.baseTag, profile.location, "var(--action)"],
  ];
  return (
    <>
      <section id="home" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-primary text-white">
        <Bubbles color="--paper" />
        {/* Ornaments drift a little with the mouse. */}
        <Parallax strength={10} className="pointer-events-none absolute inset-0 hidden font-mono text-3xl font-bold md:block">
          <span aria-hidden className="absolute left-[5%] top-[40%] text-action">+</span>
          <span aria-hidden className="absolute left-[52%] top-[12%] text-white">+</span>
          <span aria-hidden className="absolute right-[5%] top-[62%] text-action">+</span>
        </Parallax>

        {/* 66px navbar (64 + its 2px border) + 36px pixel edge below = 102px: with this block they make exactly one screen. */}
        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 px-4 py-8 sm:px-6 md:min-h-[calc(100svh-102px)] md:grid-cols-[1.3fr_1fr]">
          <div>
            {/* H1 is the LCP element: no opacity animation on it. It still reads as the full name. */}
            <h1 className="font-display text-[clamp(3rem,min(10.5vw,17svh),9rem)] uppercase leading-[0.82]">
              {first} <span className="text-action">{second}</span>
              <span className="sr-only"> {rest.join(" ")}</span>
            </h1>

            {/* Role and location as two cards that drop in one after the other; their icons bob. */}
            <ul className="mt-6 grid gap-5 text-black sm:grid-cols-2">
              {cards.map(([icon, label, value, shadow], n) => (
                <li key={label} className="corners boot flex items-start gap-3 bg-paper p-3 pixel-border" style={{ "--i": n + 1, "--shadow-color": shadow } as React.CSSProperties}>
                  <span aria-hidden className="bob flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-action pixel-border" style={{ "--n": n * 6 } as React.CSSProperties}>
                    <PixelIcon name={icon} className="h-5 w-5" />
                  </span>
                  <p className="text-xs uppercase leading-snug">
                    <span className="text-accent">[{label}]</span>
                    <br />
                    <span className="font-medium">{value}</span>
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-xl text-[clamp(1.2rem,2.8svh,1.5rem)] font-semibold leading-snug">
              <Typed text={dict.tagline} />
            </p>
            <div className="boot mt-6 flex flex-wrap gap-4" style={i(3)}>
              <a href="#projects" className={btnPrimary}>
                {dict.ctaProjects} <PixelIcon name="arrowDown" className="h-3.5 w-3.5" />
              </a>
              <a href={profile.cv} className={btnSecondary} download>
                <PixelIcon name="download" className="h-3.5 w-3.5" /> {dict.ctaCv}
              </a>
            </div>
          </div>

          {/* The mascot rises from below on load, bobs gently, and shifts with the mouse. Its size follows the screen height. */}
          <Parallax strength={18} className="mx-auto w-full max-w-[min(392px,52svh,62vw)]">
            <div className="boot" style={i(1)}>
              <Octopus className="bob w-full" />
            </div>
          </Parallax>
        </div>

        {/* Pixel edge: a row of squares where the blue meets the page. */}
        <div aria-hidden className="h-6 bg-[linear-gradient(90deg,var(--paper)_50%,transparent_50%)] bg-[length:48px_100%]" />
        <div aria-hidden className="h-3 bg-paper" />
      </section>

      <div className="pt-8">
        <ProofStrip dict={proofDict} caseStudies={caseStudies} />
      </div>
    </>
  );
}
