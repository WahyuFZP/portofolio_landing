import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getProjectSlugs } from "@/lib/mdx";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${profile.siteUrl}${path}`;
  const entry = (path: (l: string) => string) =>
    locales.map((l) => ({
      url: url(path(l)),
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, url(path(x))])) },
    }));

  return [
    ...entry((l) => `/${l}`),
    ...getProjectSlugs("en").flatMap((slug) => entry((l) => `/${l}/projects/${slug}`)),
  ];
}
