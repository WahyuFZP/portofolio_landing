import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { profile } from "@/content/profile";
import { proof } from "@/content/proof";
import { Pixels, Seaweed } from "@/components/ui/Reef";

interface Props {
  locale: Locale;
  dict: Dictionary["footer"];
  nav: Dictionary["nav"];
}

const sections = ["about", "skills", "process", "projects", "experience", "contact"] as const;
const ext = { target: "_blank", rel: "noopener noreferrer" };
// One row of waves: 40 columns, heights from a sine.
const row = (base: number, amp: number, crests: number, shift: number) => Array.from({ length: 40 }, (_, i) => Math.round(base + amp * Math.sin((i / 40) * Math.PI * 2 * crests + shift)));
const WAVES = [
  { fill: "var(--primary)", heights: row(22, 5, 2, 0), time: "5.2s", amp: "18px", phase: "0", foam: true },
  { fill: "color-mix(in srgb, var(--primary) 45%, var(--deep))", heights: row(15, 4, 3, 1.2), time: "4.1s", amp: "13px", phase: "-0.4", foam: false },
  { fill: "var(--deep)", heights: row(8, 3, 2, 2.4), time: "3.3s", amp: "8px", phase: "-0.75", foam: false },
];

export default function Footer({ locale, dict, nav }: Props) {
  const heading = "mb-4 font-pixel text-sm text-accent";
  const link = "inline-flex min-h-9 items-center text-muted transition-colors hover:text-text";
  return (
    <footer className="band-night relative mt-36">
      {/* Sea: three rows of pixel waves that rise and fall (.wave), each at its own pace, height and phase,
          so the crests never move together. Columns run past the bottom edge, so a rising row leaves no gap.
          The front row is footer-colored. */}
      <div aria-hidden className="absolute inset-x-0 bottom-full h-32 overflow-clip">
        {WAVES.map((wave) => (
          <svg key={wave.fill} viewBox="0 0 160 28" preserveAspectRatio="none" shapeRendering="crispEdges" className="wave absolute bottom-0 left-0 h-full w-full overflow-visible" style={{ "--wave-time": wave.time, "--wave-amp": wave.amp, "--wave-phase": wave.phase } as React.CSSProperties}>
            {wave.heights.map((h, i) => (
              <rect key={i} x={i * 4} y={28 - h} width={4.2} height={h + 8} fill={wave.fill} />
            ))}
            {wave.foam && wave.heights.map((h, i) => <rect key={`f${i}`} x={i * 4} y={28 - h} width={4.2} height={1.5} fill="var(--paper)" />)}
          </svg>
        ))}
      </div>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href={`/${locale}`} className="font-pixel text-2xl">
              wfzp<span className="text-accent">_</span>
            </a>
            <p className="mt-3 max-w-xs text-muted">{dict.built}</p>
          </div>

          <nav aria-label={dict.explore}>
            <h2 className={heading}>{dict.explore}</h2>
            <ul>
              {sections.map((id) => (
                <li key={id}>
                  <a href={`/${locale}#${id}`} className={link}>{nav[id]}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={dict.connect}>
            <h2 className={heading}>{dict.connect}</h2>
            <ul>
              <li><a href={profile.github} className={link} {...ext}>GitHub</a></li>
              <li><a href={profile.linkedin} className={link} {...ext}>LinkedIn</a></li>
              <li><a href={`mailto:${profile.email}`} className={link}>Email</a></li>
              <li><a href={profile.cv} className={link} download>{dict.cv}</a></li>
            </ul>
          </nav>

          <nav aria-label={dict.site}>
            <h2 className={heading}>{dict.site}</h2>
            <ul>
              <li><a href={profile.repo} className={link} {...ext}>{dict.source}</a></li>
              <li><a href={proof.workflowUrl} className={link} {...ext}>{dict.ci}</a></li>
              <li><a href="/sitemap.xml" className={link}>{dict.sitemap}</a></li>
              <li><a href={locale === "en" ? "/id" : "/en"} hrefLang={locale === "en" ? "id" : "en"} className={link}>{locale === "en" ? "Bahasa Indonesia" : "English"}</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t-2 border-border pt-6 font-mono text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <a href="#home" className="hover:text-text">{dict.top} ↑</a>
        </div>
      </div>

      {/* Sea floor: coral and seaweed on a strip of sand, and one fish passing by. */}
      <div aria-hidden className="relative h-24 overflow-clip">
        <Pixels shape="fish" color="var(--action)" className="swim absolute left-0 top-2 h-5 w-8" />
        <div className="absolute inset-x-0 bottom-2 mx-auto flex max-w-5xl items-end justify-between px-4 sm:px-6">
          <Pixels shape="branch" color="var(--pink)" className="h-16 w-20" />
          <Seaweed colors={["var(--action)", "var(--primary)"]} fronds={3} className="h-20 w-12" />
          <Pixels shape="dome" color="var(--primary)" className="hidden h-9 w-12 sm:block" />
          <Pixels shape="branch" color="var(--action)" className="hidden h-12 w-14 -scale-x-100 sm:block" />
          <Seaweed colors={["var(--primary)", "var(--action)"]} fronds={4} className="hidden h-16 w-14 md:block" />
          <Pixels shape="dome" color="var(--pink)" className="h-11 w-14" />
          <Pixels shape="branch" color="var(--primary)" className="h-14 w-16 -scale-x-100" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-[color-mix(in_srgb,var(--primary)_45%,var(--deep))]" />
      </div>
    </footer>
  );
}
