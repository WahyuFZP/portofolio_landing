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
// Mountain heights, one per 4-unit column of a 160 x 36 drawing.
const FAR = [6, 8, 10, 13, 16, 19, 22, 25, 27, 25, 22, 19, 17, 15, 13, 12, 14, 17, 20, 23, 26, 29, 31, 29, 26, 23, 20, 17, 14, 11, 9, 8, 10, 12, 14, 16, 18, 16, 14, 12];
const NEAR = [2, 3, 4, 5, 7, 8, 9, 8, 7, 5, 4, 6, 7, 9, 10, 11, 10, 9, 7, 6, 4, 4, 5, 7, 8, 9, 11, 12, 11, 9, 8, 7, 5, 4, 3, 3, 3, 4, 3, 2];

export default function Footer({ locale, dict, nav }: Props) {
  const heading = "mb-4 font-pixel text-sm text-accent";
  const link = "inline-flex min-h-9 items-center text-muted transition-colors hover:text-text";
  return (
    <footer className="band-night relative mt-44">
      {/* Mountains: columns of blocks, as two stacked drawings. The far range (an HTML-level layer, so the
          scroll-driven .drift animation applies) slides as the page scrolls; the near range is footer-colored and joins the footer. */}
      {/* overflow-clip, not hidden: "hidden" would make this box the scroller that .drift's view() timeline tracks. */}
      <div aria-hidden className="absolute inset-x-0 bottom-full h-40 overflow-clip">
        <svg viewBox="0 0 160 36" preserveAspectRatio="none" shapeRendering="crispEdges" className="drift absolute inset-0 h-full w-full">
          {FAR.map((h, i) => (
            <rect key={i} x={i * 4} y={36 - h} width={4} height={h + 12} fill="var(--primary)" />
          ))}
          {FAR.map((h, i) => (h >= 27 ? <rect key={i} x={i * 4} y={36 - h} width={4} height={3} fill="var(--paper)" /> : null))}
        </svg>
        <svg viewBox="0 0 160 36" preserveAspectRatio="none" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full">
          {NEAR.map((h, i) => (
            <rect key={i} x={i * 4} y={36 - h} width={4} height={h} fill="var(--deep)" />
          ))}
        </svg>
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
