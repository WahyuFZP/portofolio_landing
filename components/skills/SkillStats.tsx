"use client";

import { m } from "motion/react";
import type { Dictionary } from "@/lib/dictionary";
import { categories, skills, skillLogo, type Level } from "@/content/skills";

const WEIGHT: Record<Level, number> = { proficient: 3, familiar: 2, learning: 1 };

interface Props {
  dict: Dictionary["skills"];
  usage: Record<string, number>; // skill id -> number of projects that use it
}

/**
 * Skills as a character sheet: one stat bar per category and an inventory grid of every skill.
 * A bar's length is computed from the skill levels in content/skills.ts (proficient 3, familiar 2, learning 1,
 * as a share of "all proficient"), so it always reflects the list and is never a made-up number.
 */
export default function SkillStats({ dict, usage }: Props) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h3 className="mb-5 font-display text-3xl text-accent">{dict.stats}</h3>
        <dl data-stagger className="space-y-4">
          {categories.map((c) => {
            const list = skills.filter((s) => s.category === c);
            const score = list.reduce((sum, s) => sum + WEIGHT[s.level], 0) / (list.length * 3);
            return (
              <div key={c}>
                <dt className="flex justify-between gap-4 font-pixel text-sm">
                  {dict.categories[c]}
                  <span className="text-muted">
                    {list.length} <span className="sr-only">{dict.title}</span>
                  </span>
                </dt>
                <dd className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
                  {/* Fills from 0 the first time it is seen. */}
                  <m.div
                    className="h-full origin-left bg-accent"
                    style={{ width: `${Math.round(score * 100)}%` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      <div>
        <h3 className="mb-5 font-display text-3xl text-accent">{dict.inventory}</h3>
        <ul data-stagger className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7">
          {skills.map((s) => {
            const logo = skillLogo(s.id);
            const count = usage[s.id] ?? 0;
            const tip = `${s.name} · ${dict.levels[s.level]}${count ? ` · ${count} ${dict.projectCount}` : ""}`;
            const slot = `group/slot relative flex aspect-square items-center justify-center bg-surface pixel-border hover:[--pb:var(--accent)] focus-visible:[--pb:var(--accent)] ${s.level === "learning" ? "opacity-60" : ""}`;
            const body = (
              <>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG
                  <img src={logo} alt="" width={28} height={28} loading="lazy" decoding="async" className="h-8 w-8 rounded bg-white p-1" />
                ) : (
                  <span aria-hidden className="font-pixel text-sm text-accent">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                {count > 0 && <span aria-hidden className="absolute bottom-0.5 right-1 font-pixel text-[10px] text-accent">x{count}</span>}
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap bg-text px-2 py-1 font-pixel text-xs text-bg group-hover/slot:block group-focus-visible/slot:block">
                  {tip}
                </span>
              </>
            );
            return (
              <li key={s.id}>
                {count > 0 ? (
                  <a href={`?skill=${s.id}#projects`} aria-label={tip} className={slot}>
                    {body}
                  </a>
                ) : (
                  // Focusable so keyboard users can read the tooltip too.
                  <span tabIndex={0} aria-label={tip} role="img" className={slot}>
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
