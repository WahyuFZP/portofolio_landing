import type { Dictionary } from "@/lib/dictionary";
import { skillById, skills } from "@/content/skills";
import { tag } from "@/components/ui/styles";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";
import { Tilt } from "@/components/motion/Pointer";

// The six "inventory" cards, in order, each with its pixel icon. Everything else is listed as tags below.
const FEATURED: [id: string, icon: PixelIconName][] = [
  ["manual-testing", "cursor"],
  ["playwright", "play"],
  ["api-testing", "api"],
  ["unit-testing", "cube"],
  ["security-testing", "shield"],
  ["grafana", "chart"],
];
// Offset shadow color per card, cycling through the three accents.
const SHADOWS = ["var(--pink)", "var(--primary)", "var(--action)"];

export default function Skills({ dict, usage }: { dict: Dictionary["skills"]; usage: Map<string, number> }) {
  const featured = new Set(FEATURED.map(([id]) => id));
  return (
    <section id="skills" className="py-20">
      <SectionHeading index="02" title={dict.title} subtitle={dict.subtitle} />

      <ul data-stagger className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map(([id, icon], n) => {
          const s = skillById.get(id);
          if (!s) return null;
          const count = usage.get(id) ?? 0;
          const body = (
            <>
              <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-md bg-action text-black pixel-border">
                <PixelIcon name={icon} className="h-8 w-8" />
              </span>
              <span className="mt-5 block text-xl font-semibold">{s.name}</span>
              <span className="mt-2 block text-sm uppercase text-accent">[{dict.levels[s.level]}]</span>
              {count > 0 && (
                <span className="mt-1 block text-sm text-muted">
                  {count} {dict.projectCount}
                </span>
              )}
            </>
          );
          const card = "corners block h-full bg-surface p-6 pixel-border";
          return (
            <li key={id}>
              <Tilt className="h-full">
                {count > 0 ? (
                  <a href={`?skill=${id}#projects`} className={card} style={{ "--shadow-color": SHADOWS[n % 3] } as React.CSSProperties}>
                    {body}
                  </a>
                ) : (
                  <div className={card} style={{ "--shadow-color": SHADOWS[n % 3] } as React.CSSProperties}>
                    {body}
                  </div>
                )}
              </Tilt>
            </li>
          );
        })}
      </ul>

      <h3 className="mb-4 mt-14 text-sm uppercase text-accent">[{dict.inventory}]</h3>
      <ul className="flex flex-wrap gap-2">
        {skills
          .filter((s) => !featured.has(s.id))
          .map((s) => (
            <li key={s.id} className={tag}>{s.name}</li>
          ))}
      </ul>
    </section>
  );
}
