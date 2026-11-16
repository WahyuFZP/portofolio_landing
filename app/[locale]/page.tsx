import { notFound } from "next/navigation";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import StackMarquee from "@/components/sections/StackMarquee";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { getAllProjects } from "@/lib/mdx";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { buildConstellation } from "@/lib/constellation";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const projects = getAllProjects(locale).map(({ slug, meta }) => ({ slug, meta })); // body stays on the server

  const usage = new Map<string, number>();
  for (const p of projects) for (const id of p.meta.tags) usage.set(id, (usage.get(id) ?? 0) + 1);

  const constellation = buildConstellation(projects.map((p) => p.meta.tags));

  // Order: QA-first story (PRD-UIUX §6).
  return (
    <>
      <Hero dict={dict.hero} proofDict={dict.proof} constellation={constellation} caseStudies={projects.length} />
      <StackMarquee dict={dict.marquee} />
      <Projects locale={locale} projects={projects} dict={dict.projects} />
      <Skills dict={dict.skills} usage={usage} />
      <Experience locale={locale} dict={dict.experience} />
      <About dict={dict.about} />
      <Contact dict={dict.contact} />
    </>
  );
}
