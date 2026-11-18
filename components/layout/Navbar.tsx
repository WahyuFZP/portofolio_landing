"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

const sections = ["about", "skills", "process", "projects", "experience", "contact"] as const;

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
            ? // The call to action: the one lime button in the bar.
              "lift ml-3 bg-action px-4 py-2 font-pixel text-sm text-black"
            : // The section in view is marked with a lime chip outlined in black (shape and color, not color alone).
              // In the phone menu each link is a full 44px row.
              (withIndicator ? "" : "flex min-h-11 items-center ") +
              "rounded-md px-3 py-1.5 font-pixel text-sm text-muted underline-offset-8 transition-colors hover:text-text hover:underline hover:decoration-dotted hover:decoration-2 aria-[current]:bg-action aria-[current]:text-black aria-[current]:shadow-[0_0_0_2px_var(--ink)] aria-[current]:no-underline"
        }
      >
        {dict[id]}
      </a>
    ));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-bg">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="font-pixel text-base">
          wfzp<span className="cursor text-accent">_</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">{links(true)}</div>

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

          <details ref={menuRef} className="group relative lg:hidden">
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
