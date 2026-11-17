"use client";

import { useEffect } from "react";
import { animate, stagger, steps } from "animejs";

/**
 * Pixel-style motion for the whole page, driven by anime.js. Mounted once; renders nothing.
 * - [data-stagger]: its items appear one after another, in stepped (frame-by-frame) moves, when the group scrolls in.
 *   The attribute value is an optional selector for the items (default: direct children).
 * - [data-pixel-row]: a row of squares that lights up from the centre outwards each time it scrolls in.
 * Nothing is hidden unless this code runs, and it does not run under reduced motion.
 */
export default function PixelMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Groups and items are looked up when needed, not once: client-rendered lists (the project grid) replace their nodes after hydration.
    // React writes a bare data-stagger attribute as "true", so that value also means "direct children".
    const itemsOf = (el: Element) => {
      const sel = (el as HTMLElement).dataset.stagger;
      return [...el.querySelectorAll<HTMLElement>(sel && sel !== "true" ? sel : ":scope > *")];
    };
    const groups = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target); // cards enter once
          animate(itemsOf(e.target), { opacity: [0, 1], translateY: [18, 0], duration: 420, delay: stagger(90), ease: steps(5) });
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    const scan = () =>
      document.querySelectorAll("[data-stagger]").forEach((el) => {
        if (groups.has(el)) return;
        groups.add(el);
        itemsOf(el).forEach((item) => (item.style.opacity = "0")); // wait hidden until the group scrolls in
        io.observe(el);
      });
    scan();
    const added = new MutationObserver(scan); // picks up groups that are rendered later
    added.observe(document.body, { childList: true, subtree: true });

    const rows = new IntersectionObserver((entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        animate(e.target.children, {
          opacity: [{ to: 1, duration: 220 }, { to: 0.3, duration: 420 }],
          scale: [{ to: 1.6, duration: 220 }, { to: 1, duration: 420 }],
          delay: stagger(26, { from: "center" }),
          ease: steps(3),
        });
      }),
    );
    document.querySelectorAll("[data-pixel-row]").forEach((el) => rows.observe(el));

    return () => {
      io.disconnect();
      rows.disconnect();
      added.disconnect();
      groups.forEach((el) => itemsOf(el).forEach((item) => (item.style.opacity = "")));
    };
  }, []);
  return null;
}

/** Section separator: a short row of squares, animated by PixelMotion. Decorative. */
export function PixelDivider() {
  // 28 squares = 336px, so the row fits a 390px phone without scrolling.
  return (
    <div aria-hidden data-pixel-row className="flex justify-center gap-1.5">
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="h-1.5 w-1.5 bg-accent opacity-30" />
      ))}
    </div>
  );
}
