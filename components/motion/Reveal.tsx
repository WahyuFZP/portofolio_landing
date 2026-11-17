"use client";

import { useEffect } from "react";
import { animate, inView, stagger } from "motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-in animation for the whole page. Mounted once; renders nothing.
 * - Every section of <main> except the hero: its direct children fade in and rise 24px, 80ms apart.
 * - [data-stagger] lists (cards, panels): the same, and each item also scales up from 0.96.
 *   The attribute value is an optional selector for the items (default: direct children).
 * Only transform and opacity are animated. Nothing is hidden unless this code runs,
 * and it does not run under reduced motion.
 */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // React writes a bare data-stagger attribute as "true", so that value also means "direct children".
    const itemsOf = (el: Element) => {
      const sel = (el as HTMLElement).dataset.stagger;
      return [...el.querySelectorAll<HTMLElement>(sel && sel !== "true" ? sel : ":scope > *")];
    };
    const seen = new WeakSet<Element>();
    const stops: (() => void)[] = [];
    const scan = () =>
      document.querySelectorAll("[data-stagger], main section:not(#home)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const panel = el.hasAttribute("data-stagger");
        itemsOf(el).forEach((item) => (item.style.opacity = "0")); // wait hidden until the group scrolls in
        const stop = inView(
          el,
          () => {
            stop(); // once
            const items = itemsOf(el); // looked up again: client-rendered lists replace their nodes after hydration
            if (!items.length) return;
            animate(items, { opacity: [0, 1], y: [24, 0], scale: panel ? [0.96, 1] : 1 }, { duration: 0.5, delay: stagger(0.08), ease: EASE }).then(() =>
              // Hand the elements back to CSS, so hover lifts and later layout animations are not blocked by inline styles.
              items.forEach((item) => {
                item.style.opacity = "";
                item.style.transform = "";
              }),
            );
          },
          { margin: "0px 0px -10% 0px" },
        );
        stops.push(stop);
      });
    scan();
    const added = new MutationObserver(scan); // picks up groups that are rendered later (the project grid)
    added.observe(document.body, { childList: true, subtree: true });

    return () => {
      added.disconnect();
      stops.forEach((stop) => stop());
      document.querySelectorAll<HTMLElement>("[data-stagger] *, main section > *").forEach((el) => (el.style.opacity = ""));
    };
  }, []);
  return null;
}
