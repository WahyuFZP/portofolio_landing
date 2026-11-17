"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
        className={
          withIndicator && id === "contact"
            ? // The one filled item in the bar: the call to action.
              "ml-3 bg-accent px-4 py-2 font-pixel text-sm text-accent-fg transition-transform pixel-border pixel-border-accent hover:-translate-y-0.5"
            : // Brackets close in around the link on hover and stay on the section in view (not color-only).
              "relative px-4 py-2 font-pixel text-sm text-muted transition-colors before:absolute before:left-1 before:text-accent before:opacity-0 before:transition-[opacity,transform] before:content-['['] after:absolute after:right-1 after:text-accent after:opacity-0 after:transition-[opacity,transform] after:content-[']'] hover:text-text hover:before:opacity-100 hover:after:opacity-100 aria-[current]:text-text aria-[current]:before:opacity-100 aria-[current]:after:opacity-100 motion-safe:before:-translate-x-1 motion-safe:after:translate-x-1 motion-safe:hover:before:translate-x-0 motion-safe:hover:after:translate-x-0 motion-safe:aria-[current]:before:translate-x-0 motion-safe:aria-[current]:after:translate-x-0"
        }
      >
        {dict[id]}
      </a>
    ));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-bg/90 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-pixel text-base">
          wfzp<span className="cursor text-accent">_</span>
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
