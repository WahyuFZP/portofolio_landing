"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProjectMeta } from "@/lib/mdx";
import type { Dictionary } from "@/lib/dictionary";
import { skillById } from "@/content/skills";
import { tag } from "@/components/ui/styles";
import PixelIcon from "@/components/ui/PixelIcon";

export interface CardProject {
  slug: string;
  meta: ProjectMeta;
}

interface Props {
  project: CardProject;
  href: string;
  dict: Dictionary["projects"];
  featured?: boolean;
}

const MAX_TAGS = 4;

/** Laptop with a browser window showing the project. The lid opens on scroll; the page scrolls on hover. */
function Laptop({ project, sizes }: { project: CardProject; sizes: string }) {
  const { meta } = project;
  // Address bar shows the real host when there is one, never an invented URL.
  const address = meta.link ? new URL(meta.link).host : meta.title;
  return (
    <div aria-hidden className="mx-auto w-full max-w-xl [perspective:1400px]">
      <div className="laptop-lid border-[6px] border-b-0 border-zinc-700 bg-zinc-900">
        <div className="flex h-6 items-center gap-1.5 bg-zinc-800 px-2">
          <span className="h-1.5 w-1.5 bg-zinc-500" />
          <span className="h-1.5 w-1.5 bg-zinc-500" />
          <span className="h-1.5 w-1.5 bg-sky-400" />
          <span className="ml-2 min-w-0 flex-1 truncate bg-zinc-900 px-2 font-mono text-[11px] leading-4 text-zinc-300">{address}</span>
        </div>
        <div className="dither overflow-hidden">
          {meta.image ? (
            <Image
              src={meta.image}
              alt=""
              width={1280}
              height={800}
              sizes={sizes}
              className="aspect-[16/10] w-full object-cover object-top transition-[object-position] duration-[5000ms] ease-linear group-hover:object-bottom group-focus-within:object-bottom"
            />
          ) : (
            <div className="flex aspect-[16/10] items-end bg-zinc-950 p-5 font-pixel text-lg text-sky-400">~/{project.slug}</div>
          )}
        </div>
      </div>
      {/* Base: wider than the lid, with a notch. */}
      <div className="relative -mx-[4%] h-3 bg-zinc-600">
        <span className="absolute left-1/2 top-0 h-1.5 w-20 -translate-x-1/2 bg-zinc-800" />
      </div>
    </div>
  );
}

export default function ProjectCard({ project, href, dict, featured }: Props) {
  const { meta } = project;
  const names = meta.tags.map((id) => skillById.get(id)?.name ?? id);
  const hidden = names.slice(MAX_TAGS);

  // Subtle tilt toward the pointer (mouse only).
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.transform = `perspective(1000px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = "");

  return (
    <article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative flex h-full w-full flex-col gap-6 bg-surface p-6 pixel-border transition-transform duration-300 ease-out hover:[--pb:var(--accent)] ${featured ? "md:flex-row md:items-center md:gap-10 md:p-10" : ""}`}
    >
      <div className={`px-[4%] ${featured ? "md:w-[55%]" : ""}`}>
        <Laptop project={project} sizes={featured ? "(min-width: 768px) 520px, 100vw" : "(min-width: 768px) 400px, 100vw"} />
      </div>

      <div className="flex flex-1 flex-col">
        <p className="flex flex-wrap items-center gap-2 font-pixel text-xs">
          <span className="bg-accent-soft px-2 py-0.5 text-accent">● {dict.status[meta.status]}</span>
          <span className="text-muted">{meta.categories.map((c) => dict.categories[c]).join(" · ")}</span>
        </p>
        <h3 className={`mt-3 font-semibold tracking-tight ${featured ? "text-3xl" : "text-xl"}`}>
          {/* Stretched link: the whole card is clickable, one tab stop. */}
          <Link href={href} className="after:absolute after:inset-0">
            {meta.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-muted">{meta.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {names.slice(0, MAX_TAGS).map((name) => (
            <li key={name} className={tag}>{name}</li>
          ))}
          {hidden.length > 0 && (
            <li className={tag} aria-label={hidden.join(", ")}>
              +{hidden.length}
            </li>
          )}
        </ul>
        <p className="mt-5 flex items-center gap-2 font-pixel text-sm text-accent" aria-hidden>
          {dict.readCaseStudy} <PixelIcon name="arrowRight" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}
