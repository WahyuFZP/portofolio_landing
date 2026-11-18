import fs from "fs";
import path from "path";
import type { Locale } from "@/lib/i18n";

// Frontmatter of content/{locale}/<slug>.mdx. `tags` are skill ids from content/skills.ts.
export interface ProjectMeta {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  year?: string;
  role?: string;
  order?: string; // lower shows first
  categories: ("fullstack" | "qa")[];
  status: "shipped" | "qa-project" | "this-site";
  link?: string;
  github?: string;
  report?: string;
}

export interface Project {
  slug: string;
  meta: ProjectMeta;
  content: string;
}

// Minimal frontmatter parser: `key: "string"` and `key: ["a", "b"]` lines only.
export function parseMDX(fileContent: string) {
  const match = fileContent.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string | string[]>, content: fileContent };

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      continue;
    }
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    data[key] = value;
  }
  return { data, content: match[2].trim() };
}

const dir = (locale: Locale) => path.join(process.cwd(), "content", locale);

function readProject(locale: Locale, slug: string): Project | null {
  const file = path.join(dir(locale), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = parseMDX(fs.readFileSync(file, "utf-8"));
  return { slug, meta: data as unknown as ProjectMeta, content };
}

export function getProjectSlugs(locale: Locale): string[] {
  if (!fs.existsSync(dir(locale))) return [];
  return fs
    .readdirSync(dir(locale))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    // A slug becomes part of a URL: only plain names are accepted, so a file name can never carry markup or a scheme.
    .filter((slug) => /^[a-z0-9-]+$/.test(slug));
}

export function getAllProjects(locale: Locale): Project[] {
  return getProjectSlugs(locale)
    .map((slug) => readProject(locale, slug)!)
    .sort((a, b) => Number(a.meta.order ?? 99) - Number(b.meta.order ?? 99));
}

export const getProjectBySlug = (slug: string, locale: Locale) =>
  getProjectSlugs(locale).includes(slug) ? readProject(locale, slug) : null;
