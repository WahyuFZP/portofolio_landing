"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import { Menu, X } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

const sections = ["projects", "skills", "experience", "about", "contact"] as const;

export default function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [active, setActive] = useState<string>("");
  const menuRef = useRef<HTMLDetailsElement>(null);
  const isHome = pathname === `/${locale}`;
  const other: Locale = locale === "id" ? "en" : "id";
  const otherPath = pathname.replace(/^\/(id|en)(?=\/|$)/, `/${other}`);

  // Highlight the section currently in view (home page only).
  useEffect(() => {
    if (!isHome) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["home", ...sections].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHome]);

  const closeMenu = () => menuRef.current?.removeAttribute("open");

  const links = (withIndicator: boolean) =>
    sections.map((id) => (
      <a
        key={id}
        href={`/${locale}#${id}`}
        onClick={closeMenu}
        aria-current={active === id ? "true" : undefined}
        className="relative px-3 py-2 font-pixel text-sm text-muted transition-colors hover:text-text aria-[current]:text-text"
      >
        {dict[id]}
        {withIndicator && active === id && (
          // Slides between links (shared layout animation). Not color-only: it is a visible bar.
          <m.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-accent" transition={{ duration: 0.25 }} />
        )}
      </a>
    ));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-bg/90 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-pixel text-base">
          wfzp<span className="text-accent">_</span>
        </a>

        <div className="hidden items-center md:flex">{links(true)}</div>

        <div className="flex items-center gap-2.5">
          <a
            href={otherPath}
            hrefLang={other}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = otherPath + window.location.hash;
            }}
            className="flex h-11 items-center px-3 font-pixel text-xs uppercase text-muted transition-colors pixel-border hover:text-text"
          >
            {other}
            <span className="sr-only">: {dict.switchLanguage}</span>
          </a>

          <details ref={menuRef} className="group relative md:hidden">
            <summary
              aria-label={dict.menu}
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center pixel-border [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-5 w-5 group-open:hidden" aria-hidden />
              <X className="hidden h-5 w-5 group-open:block" aria-hidden />
            </summary>
            <div className="absolute right-0 top-14 flex w-48 flex-col bg-surface p-2 pixel-border">{links(false)}</div>
          </details>
        </div>
      </nav>
      {/* Stepped scroll progress (CSS scroll-driven; hidden where unsupported). */}
      <div className="scroll-progress absolute inset-x-0 -bottom-0.5 h-0.5 bg-accent" aria-hidden />
    </header>
  );
}
