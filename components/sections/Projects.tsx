import { Suspense } from "react";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard, { type CardProject } from "@/components/project/ProjectCard";
import ProjectFilter from "@/components/project/ProjectFilter";

export default function Projects({ locale, projects, dict }: { locale: Locale; projects: CardProject[]; dict: Dictionary["projects"] }) {
  return (
    // Full-width "band" to break the page rhythm.
    <section id="projects" className="relative py-20 before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-surface/60">
      <SectionHeading index="01" title={dict.title} subtitle={dict.subtitle} />
      {/* useSearchParams needs Suspense on a static page; the fallback is the unfiltered list. */}
      <Suspense
        fallback={
          <ul className="grid gap-8 md:grid-cols-2">
            {projects.map((p, i) => (
              <li key={p.slug} className={`flex ${i === 0 ? "md:col-span-2" : ""}`}>
                <ProjectCard project={p} href={`/${locale}/projects/${p.slug}`} dict={dict} featured={i === 0} />
              </li>
            ))}
          </ul>
        }
      >
        <ProjectFilter locale={locale} projects={projects} dict={dict} />
      </Suspense>
    </section>
  );
}
