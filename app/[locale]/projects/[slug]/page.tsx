import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/mdx";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";
import { skillById } from "@/content/skills";
import { tag } from "@/components/ui/styles";

export const dynamicParams = false;
export const generateStaticParams = () =>
  locales.flatMap((locale) => getAllProjects(locale).map(({ slug }) => ({ locale, slug })));

async function load(params: PageProps<"/[locale]/projects/[slug]">["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = getProjectBySlug(slug, locale);
  if (!project) notFound();
  return { locale, project };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, project } = await load(params);
  return {
    title: project.meta.title,
    description: project.meta.description,
    alternates: {
      canonical: `/${locale}/projects/${project.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/projects/${project.slug}`])),
    },
    openGraph: project.meta.image ? { images: [project.meta.image] } : undefined,
  };
}

export default async function CaseStudy({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, project } = await load(params);
  const dict = (await getDictionary(locale)).projects;
  const { meta } = project;

  const all = getAllProjects(locale);
  const next = all[(all.findIndex((p) => p.slug === project.slug) + 1) % all.length];

  const links = [
    { href: meta.link, label: dict.caseStudy.demo },
    { href: meta.github, label: dict.caseStudy.source },
    { href: meta.report, label: dict.caseStudy.report },
  ].filter((l): l is { href: string; label: string } => !!l.href);

  return (
    <article className="mx-auto max-w-3xl py-12">
      <Link href={`/${locale}#projects`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {dict.caseStudy.back}
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{meta.title}</h1>
        <p className="mt-4 text-lg text-muted">{meta.description}</p>

        <dl className="mt-8 grid gap-6 border-y border-border py-6 sm:grid-cols-3">
          {meta.year && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted">{dict.caseStudy.year}</dt>
              <dd className="mt-1">{meta.year}</dd>
            </div>
          )}
          {meta.role && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-muted">{dict.caseStudy.role}</dt>
              <dd className="mt-1">{meta.role}</dd>
            </div>
          )}
          <div className="sm:col-span-3">
            <dt className="font-mono text-xs uppercase tracking-wide text-muted">{dict.caseStudy.stack}</dt>
            <dd className="mt-2">
              <ul className="flex flex-wrap gap-2">
                {meta.tags.map((id) => (
                  <li key={id} className={tag}>{skillById.get(id)?.name ?? id}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        {links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {meta.image && (
        <Image
          src={meta.image}
          alt=""
          width={1080}
          height={1080}
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-10 aspect-[16/10] w-full object-cover object-top pixel-border"
        />
      )}

      <div className="prose-case mt-6">
        {/* Content is our own repo files; blockJS keeps MDX from running expressions anyway. */}
        <MDXRemote source={project.content} options={{ blockJS: true }} />
      </div>

      {next && next.slug !== project.slug && (
        <Link
          href={`/${locale}/projects/${next.slug}`}
          className="corners mt-16 flex items-center justify-between bg-surface p-6 pixel-border transition-transform hover:-translate-y-0.5 hover:[--pb:var(--accent)]"
        >
          <span>
            <span className="block font-mono text-xs uppercase tracking-wide text-muted">{dict.caseStudy.next}</span>
            <span className="mt-1 block text-lg font-semibold tracking-tight">{next.meta.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-accent" aria-hidden />
        </Link>
      )}
    </article>
  );
}
