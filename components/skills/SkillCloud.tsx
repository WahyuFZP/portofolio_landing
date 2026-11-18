"use client";

import { useEffect, useState } from "react";
import { tag } from "@/components/ui/styles";

/** The remaining skills as tags with their logos. Every second or so one tag, picked at random, pops up in lime. */
export default function SkillCloud({ items }: { items: { id: string; name: string; logo?: string }[] }) {
  const [hot, setHot] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHot(Math.floor(Math.random() * items.length)), 1100);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((s, i) => (
        <li
          key={s.id}
          className={`${tag} gap-1.5 !py-1 transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${i === hot ? "z-10 -translate-y-1.5 scale-125 !bg-action !text-black" : ""}`}
        >
          {s.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG
            <img src={s.logo} alt="" width={16} height={16} loading="lazy" decoding="async" className="h-4 w-4 rounded-sm bg-white" />
          ) : (
            <span aria-hidden className="h-2 w-2 bg-primary" />
          )}
          {s.name}
        </li>
      ))}
    </ul>
  );
}
