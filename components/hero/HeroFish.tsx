"use client";

import { useRef, useState } from "react";
import { Pixels, type Shape } from "@/components/ui/Reef";

// Lanes are chosen so a fish never passes over the two hero buttons (phone or desktop) and blocks a click.
// x is where the fish rests when motion is reduced (it does not swim then, but can still be fed).
const FISH: { shape: Shape; color: string; top: string; x: string; time: string; delay: string; rev: boolean; size: string }[] = [
  { shape: "fish", color: "var(--action)", top: "4%", x: "14vw", time: "26s", delay: "-5s", rev: false, size: "h-6 w-10" },
  { shape: "angel", color: "var(--paper)", top: "21%", x: "62vw", time: "36s", delay: "-21s", rev: true, size: "h-9 w-10" },
  { shape: "long", color: "var(--action)", top: "40%", x: "84vw", time: "22s", delay: "-13s", rev: false, size: "h-4 w-14" },
  { shape: "puffer", color: "var(--paper)", top: "73%", x: "38vw", time: "42s", delay: "-30s", rev: true, size: "h-7 w-10" },
];

/**
 * Fish that swim across the hero. Click one and it darts into the octopus's mouth (#octo); the octopus
 * chews, then a burp floats up. The fish comes back a few seconds later.
 */
export default function HeroFish({ label, burps }: { label: string; burps: string[] }) {
  const layer = useRef<HTMLDivElement>(null);
  const count = useRef(0);
  const [burp, setBurp] = useState<{ id: number; text: string; x: number; y: number } | null>(null);

  const feed = (fish: HTMLButtonElement) => {
    const octo = document.getElementById("octo");
    if (!octo || !layer.current || fish.style.visibility) return; // already on its way, or eaten
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fish.getBoundingClientRect();
    const o = octo.getBoundingClientRect();
    const base = layer.current.getBoundingClientRect();
    const swum = new DOMMatrix(getComputedStyle(fish).transform).m41; // how far the swim has carried it
    const dx = o.left + o.width / 2 - (from.left + from.width / 2);
    const dy = o.top + o.height * 0.54 - (from.top + from.height / 2); // the mouth sits just below the middle
    fish.style.visibility = "visible"; // marks it as taken
    fish.style.animationPlayState = "paused";
    const dart = fish.animate(
      [{ transform: `translate(${swum}px, 0)` }, { transform: `translate(${swum + dx}px, ${dy}px) scale(0.15)` }],
      { duration: still ? 0 : 550, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
    );
    dart.onfinish = () => {
      fish.style.visibility = "hidden";
      dart.cancel();
      const chew = octo.animate([{ transform: "none" }, { transform: "scale(1.05, 0.92)" }, { transform: "none" }], { duration: 230, iterations: still ? 0 : 4 });
      chew.onfinish = () => {
        const id = ++count.current;
        setBurp({ id, text: burps[(id - 1) % burps.length], x: o.left - base.left + o.width / 2, y: o.top - base.top });
        window.setTimeout(() => setBurp((b) => (b?.id === id ? null : b)), 1900);
      };
      window.setTimeout(() => {
        fish.style.visibility = "";
        fish.style.animationPlayState = "";
      }, 7000);
    };
  };

  return (
    <div ref={layer} className="pointer-events-none absolute inset-x-0 bottom-9 top-0">
      {FISH.map((f) => (
        <button
          key={f.shape}
          type="button"
          aria-label={label}
          onClick={(e) => feed(e.currentTarget)}
          className={`swim ${f.rev ? "swim-rev" : ""} pointer-events-auto absolute cursor-pointer p-2`}
          style={{ top: f.top, left: f.x, "--x": f.x, "--swim-time": f.time, "--swim-delay": f.delay } as React.CSSProperties}
        >
          <Pixels shape={f.shape} color={f.color} className={`block ${f.size} ${f.rev ? "-scale-x-100" : ""}`} />
        </button>
      ))}
      {burp && (
        <span key={burp.id} role="status" className="burp absolute whitespace-nowrap bg-paper px-2 py-1 font-pixel text-sm text-black pixel-border" style={{ left: burp.x, top: burp.y }}>
          {burp.text}
        </span>
      )}
    </div>
  );
}
