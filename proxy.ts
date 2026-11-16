import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

// Picks the first supported language from Accept-Language, else the default.
function getLocale(request: NextRequest): Locale {
  const detected = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((lang) => lang.split(";")[0].trim().toLowerCase())
    .find((lang) => lang.startsWith("id") || lang.startsWith("en"));

  return detected?.startsWith("en") ? "en" : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${getLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and any path with a file extension (public assets, sitemap.xml, robots.txt).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
