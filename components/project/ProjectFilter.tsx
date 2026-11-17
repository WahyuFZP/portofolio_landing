"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import type { ProjectMeta } from "@/lib/mdx";
import { skillById } from "@/content/skills";
import ProjectCard, { type CardProject } from "./ProjectCard";

interface Props {
  locale: Locale;
  projects: CardProject[];
  dict: Dictionary["projects"];
}

type Category = ProjectMeta["categories"][number];
const CATEGORIES: Category[] = ["fullstack", "qa"];

export default function ProjectFilter({ locale, projects, dict }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  // Unknown values are ignored, so a bad shared link still shows everything.
  const rawCat = params.get("category");
  const category = CATEGORIES.find((c) => c === rawCat) ?? null;
  const rawSkill = params.get("skill");
  const skill = rawSkill && projects.some((p) => p.meta.tags.includes(rawSkill)) ? rawSkill : null;

  const visible = projects.filter(
    (p) => (!category || p.meta.categories.includes(category)) && (!skill || p.meta.tags.includes(skill)),
  );

  // Native history API: Next keeps useSearchParams in sync, and the server tree does not re-render.
  const go = (next: { category?: Category | null; skill?: string | null }) => {
    const q = new URLSearchParams();
    const c = next.category !== undefined ? next.category : category;
    const s = next.skill !== undefined ? next.skill : skill;
    if (c) q.set("category", c);
    if (s) q.set("skill", s);
    const qs = q.toString();
    window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}#projects`);
  };

  const chip = "min-h-10 px-4 font-pixel text-sm transition-colors pixel-border";
  const on = "pixel-border-accent bg-accent text-accent-fg";
  const off = "bg-surface text-muted hover:text-text";

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div role="group" aria-label={dict.filterLabel} className="flex flex-wrap gap-3">
          <button type="button" aria-pressed={!category} onClick={() => go({ category: null })} className={`${chip} ${!category ? on : off}`}>
            {dict.all}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => go({ category: c })} className={`${chip} ${category === c ? on : off}`}>
              {dict.categories[c]}
            </button>
          ))}
        </div>

        {skill && (
          <p className="flex items-center gap-2 font-mono text-sm text-muted">
            {dict.showing}:
            <button type="button" onClick={() => go({ skill: null })} className="flex items-center gap-2 bg-accent-soft px-2 py-1 text-accent pixel-border pixel-border-accent">
              {skillById.get(skill)?.name}
              <span aria-hidden>✕</span>
              <span className="sr-only">{dict.clearSkill}</span>
            </button>
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} / {projects.length}
      </p>

      {visible.length === 0 && (
        <div className="corners bg-surface p-8 text-center pixel-border">
          <p className="text-muted">{dict.empty}</p>
          <button type="button" onClick={() => go({ category: null, skill: null })} className={`${chip} ${off} mt-4`}>
            {dict.reset}
          </button>
        </div>
      )}

      <m.ul layout className="grid gap-8 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((p, i) => {
            const featured = i === 0 && visible.length !== 2; // keep the grid without an orphan card
            return (
              <m.li
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex min-w-0 ${featured ? "md:col-span-2" : ""}`} // min-w-0: grid items must not grow past the column
              >
                <ProjectCard project={p} href={`/${locale}/projects/${p.slug}`} dict={dict} featured={featured} />
              </m.li>
            );
          })}
        </AnimatePresence>
      </m.ul>
    </>
  );
}
