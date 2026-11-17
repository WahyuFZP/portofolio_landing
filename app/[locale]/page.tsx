import { notFound } from "next/navigation";
import Hero from "@/components/sections/Hero";
import { PixelDivider } from "@/components/motion/PixelMotion";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import BugHunt from "@/components/sections/BugHunt";
import Music from "@/components/sections/Music";
import Experience from "@/components/sections/Experience";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { getAllProjects } from "@/lib/mdx";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const projects = getAllProjects(locale).map(({ slug, meta }) => ({ slug, meta })); // body stays on the server

  const usage = new Map<string, number>();
  for (const p of projects) for (const id of p.meta.tags) usage.set(id, (usage.get(id) ?? 0) + 1);


  // Order: QA-first story (PRD-UIUX §6).
  return (
    <>
      <Hero dict={dict.hero} proofDict={dict.proof} caseStudies={projects.length} />
      <PixelDivider />
      <Projects locale={locale} projects={projects} dict={dict.projects} />
      <PixelDivider />
      <Skills dict={dict.skills} pause={dict.marquee} usage={usage} />
      <PixelDivider />
      <BugHunt dict={dict.bugHunt} />
      <PixelDivider />
      <Experience locale={locale} dict={dict.experience} />
      <PixelDivider />
      <About dict={dict.about} />
      <Music dict={dict.music} />
      <PixelDivider />
      <Contact dict={dict.contact} />
    </>
  );
}
