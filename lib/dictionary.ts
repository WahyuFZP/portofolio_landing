import "server-only";
import type en from "@/dictionaries/en.json";
import type { Locale } from "@/lib/i18n";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  id: () => import("@/dictionaries/id.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
