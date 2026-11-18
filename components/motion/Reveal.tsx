"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Scroll-in animation for the whole page. Mounted once; renders nothing.
 * - Every section of <main> except the hero: its direct children fade in and rise 24px, 80ms apart.
 * - [data-stagger] lists (cards, panels): the same, and each item also scales up from 0.96.
 *   The attribute value is an optional selector for the items (default: direct children).
 * It uses the Web Animations API and never writes styles or attributes to the elements, so React's
 * hydration of late client components (the project grid) sees exactly the HTML the server sent.
 * Only transform and opacity are animated; nothing runs under reduced motion.
 */
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // React writes a bare data-stagger attribute as "true", so that value also means "direct children".
    const itemsOf = (el: Element) => {
      const sel = (el as HTMLElement).dataset.stagger;
      return [...el.querySelectorAll<HTMLElement>(sel && sel !== "true" ? sel : ":scope > *")];
    };
    const frames = (panel: boolean): Keyframe[] => [
      { opacity: 0, transform: panel ? "translateY(24px) scale(0.96)" : "translateY(24px)" },
      { opacity: 1, transform: "none" },
    ];
    const waiting = new Map<Element, Animation>(); // item -> its paused, not yet played animation (holds it invisible)
    const groups = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target); // once
          const panel = e.target.hasAttribute("data-stagger");
          // Looked up again: client-rendered lists replace their nodes after hydration.
          itemsOf(e.target).forEach((item, n) => {
            const held = waiting.get(item);
            waiting.delete(item);
            held?.cancel();
            const run = item.animate(frames(panel), { duration: 500, delay: n * 80, easing: EASE, fill: "backwards" });
            // Let go when done, so CSS hover transforms work again.
            run.onfinish = () => run.cancel();
          });
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    const scan = () =>
      document.querySelectorAll("[data-stagger], main section:not(#home)").forEach((el) => {
        if (groups.has(el)) return;
        groups.add(el);
        const panel = el.hasAttribute("data-stagger");
        for (const item of itemsOf(el)) {
          const hold = item.animate(frames(panel), { duration: 1, fill: "both" });
          hold.pause(); // stays on its first frame: invisible until the group scrolls in
          waiting.set(item, hold);
        }
        io.observe(el);
      });
    scan();
    const added = new MutationObserver(scan); // picks up groups that are rendered later
    added.observe(document.body, { childList: true, subtree: true });

    return () => {
      added.disconnect();
      io.disconnect();
      waiting.forEach((a) => a.cancel());
    };
  }, []);
  return null;
}
