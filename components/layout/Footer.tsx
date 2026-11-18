import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { profile } from "@/content/profile";
import { proof } from "@/content/proof";

interface Props {
  locale: Locale;
  dict: Dictionary["footer"];
  nav: Dictionary["nav"];
}

const sections = ["about", "skills", "process", "projects", "experience", "contact"] as const;
const ext = { target: "_blank", rel: "noopener noreferrer" };
// One row of waves: 80 columns (two identical halves of 40), heights from a sine with a whole number of crests per half.
const row = (base: number, amp: number, crests: number, shift: number) => Array.from({ length: 80 }, (_, i) => Math.round(base + amp * Math.sin((i / 40) * Math.PI * 2 * crests + shift)));
const WAVES = [
  { fill: "var(--primary)", heights: row(19, 5, 2, 0), time: "16s", reverse: false, foam: true },
  { fill: "color-mix(in srgb, var(--primary) 45%, var(--deep))", heights: row(13, 4, 3, 1.2), time: "11s", reverse: true, foam: false },
  { fill: "var(--deep)", heights: row(7, 3, 2, 2.4), time: "8s", reverse: false, foam: false },
];

export default function Footer({ locale, dict, nav }: Props) {
  const heading = "mb-4 font-pixel text-sm text-accent";
  const link = "inline-flex min-h-9 items-center text-muted transition-colors hover:text-text";
  return (
    <footer className="band-night relative mt-36">
      {/* Sea: three rows of pixel waves sliding sideways at different speeds (.wave). Each row is drawn twice as wide
          as the screen and repeats after half its width, so the loop has no seam. The front row is footer-colored. */}
      <div aria-hidden className="absolute inset-x-0 bottom-full h-28 overflow-clip">
        {WAVES.map((wave) => (
          <svg key={wave.fill} viewBox="0 0 320 28" preserveAspectRatio="none" shapeRendering="crispEdges" className={`wave absolute bottom-0 left-0 h-full w-[200%] ${wave.reverse ? "wave-rev" : ""}`} style={{ "--wave-time": wave.time } as React.CSSProperties}>
            {wave.heights.map((h, i) => (
              <rect key={i} x={i * 4} y={28 - h} width={4.2} height={h} fill={wave.fill} />
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
    </footer>
  );
}
