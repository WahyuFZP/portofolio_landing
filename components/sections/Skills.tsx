import type { Dictionary } from "@/lib/dictionary";
import { categories, levels, skills, skillLogo, type Level } from "@/content/skills";
import LogoRing from "./LogoRing";
import MarqueePause from "./MarqueePause";
import SectionHeading from "@/components/ui/SectionHeading";

const levelStyle: Record<Level, string> = {
  proficient: "bg-surface text-text pixel-border",
  familiar: "bg-surface text-text pixel-border",
  learning: "border-2 border-dashed border-border text-muted",
};

export default function Skills({ dict, pause, usage }: { dict: Dictionary["skills"]; pause: Dictionary["marquee"]; usage: Map<string, number> }) {
  return (
    <section id="skills" className="py-20">
      <SectionHeading index="02" title={dict.title} subtitle={dict.subtitle} />

      <MarqueePause pause={pause.pause} play={pause.play}>
        <LogoRing />
      </MarqueePause>

      <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
        {categories.map((cat, ci) => (
          <details
            key={cat}
            open
            className={`reveal group/cat bg-surface/40 p-5 pixel-border ${ci === 0 ? "md:col-span-2 [--pb:var(--accent)]" : ""}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
              <span className={ci === 0 ? "text-accent" : ""}>{dict.categories[cat]}</span>
              <span className="text-muted group-open/cat:rotate-90" aria-hidden>▸</span>
            </summary>

            <div className="mt-4 space-y-4">
              {levels.map((lvl) => {
                const list = skills.filter((s) => s.category === cat && s.level === lvl);
                if (!list.length) return null;
                return (
                  <div key={lvl}>
                    <h3 className="mb-2 font-pixel text-xs uppercase tracking-wider text-muted">{dict.levels[lvl]}</h3>
                    <ul className="flex flex-wrap gap-3">
                      {list.map((s) => {
                        const count = usage.get(s.id) ?? 0;
                        const cls = `flex min-h-9 items-center gap-2 px-3 text-sm ${levelStyle[lvl]}`;
                        const logo = skillLogo(s.id);
                        const body = (
                          <>
                            {/* White tile: several logos are black and would vanish on the dark theme. */}
                            {logo && (
                              // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG
                              <img src={logo} alt="" width={18} height={18} loading="lazy" decoding="async" className="h-[22px] w-[22px] shrink-0 bg-white p-0.5" />
                            )}
                            {s.name}
                            {count > 0 && (
                              <span className="bg-accent-soft px-1.5 font-pixel text-xs text-accent">
                                {count}
                                <span className="sr-only"> {dict.projectCount}</span>
                              </span>
                            )}
                          </>
                        );
                        return (
                          <li key={s.id}>
                            {count > 0 ? (
                              <a href={`?skill=${s.id}#projects`} className={`${cls} transition-transform hover:-translate-y-0.5 hover:[--pb:var(--accent)]`}>
                                {body}
                              </a>
                            ) : (
                              <span className={cls}>{body}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
