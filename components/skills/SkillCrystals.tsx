"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { Dictionary } from "@/lib/dictionary";
import { categories, levels, skills, skillLogo } from "@/content/skills";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

// Three gem colors only (blue, cyan, yellow), repeated across the eight categories.
const TONES = ["#3b82f6", "#22d3ee", "#facc15"];

interface Props {
  dict: Dictionary["skills"];
  pause: Dictionary["marquee"];
  usage: Record<string, number>; // skill id -> number of projects that use it
}

/**
 * Skills as a tab set. On desktop the tabs are crystals orbiting in a ring and the selected one
 * floats in the middle with its logos; everywhere else they are plain category buttons.
 * The panel below always lists the selected category's skills, so nothing depends on WebGL.
 */
export default function SkillCrystals({ dict, pause, usage }: Props) {
  const [sel, setSel] = useState(0);
  const [live, setLive] = useState(false);
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // What the render loop reads each frame (kept in a ref so the scene is created only once).
  const now = useRef({ sel: 0, hot: -1, paused: false, overTile: false });

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startCrystals } = await import("./crystals3d");
        if (disposed || !canvasRef.current) return;
        stop = startCrystals(canvasRef.current, {
          tones: categories.map((_, i) => TONES[i % TONES.length]),
          tabs: tabRefs.current.flatMap((el) => el ?? []),
          tiles: () => (tilesRef.current ? ([...tilesRef.current.children] as HTMLElement[]) : []),
          selected: () => now.current.sel,
          hovered: () => now.current.hot,
          paused: () => now.current.paused || now.current.overTile, // hold still while a logo is being read
        });
        setLive(true);
      } catch {
        // The buttons and the panel work without the scene.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, []);

  const choose = (i: number) => {
    now.current.sel = i;
    setSel(i);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const next = { ArrowRight: (sel + 1) % categories.length, ArrowLeft: (sel + categories.length - 1) % categories.length, Home: 0, End: categories.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  };

  const cat = categories[sel];
  const inCat = skills.filter((s) => s.category === cat);

  return (
    <div>
      <div className={live ? "relative md:h-[340px]" : "relative"}>
        {/* Scene (desktop, decorative): canvas at z 20; logo tiles at z 10 or 60 pass behind and in front of it. */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 hidden transition-opacity duration-700 md:block ${live ? "opacity-100" : "opacity-0"}`}>
          <canvas ref={canvasRef} data-crystals={live ? "live" : "off"} className="absolute inset-0 z-20 h-full w-full [image-rendering:pixelated]" />
          <div ref={tilesRef}>
            {inCat.map((s) => {
              const logo = skillLogo(s.id);
              return (
                logo && (
                  <span
                    key={s.id}
                    onPointerEnter={() => (now.current.overTile = true)}
                    onPointerLeave={() => (now.current.overTile = false)}
                    className="group/tile pointer-events-auto absolute left-0 top-0 h-12 w-12 will-change-transform"
                  >
                    {/* Hexagon gem: blue rim, white face so every logo keeps its own colors. */}
                    <span className="hex block h-full w-full bg-accent p-[2px] transition-colors group-hover/tile:bg-line">
                      <span className="hex flex h-full w-full items-center justify-center bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG */}
                        <img src={logo} alt="" width={24} height={24} decoding="async" />
                      </span>
                    </span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap bg-text px-2 py-1 font-pixel text-xs text-bg opacity-0 transition-opacity group-hover/tile:opacity-100">
                      {s.name} · {dict.levels[s.level]}
                    </span>
                  </span>
                )
              );
            })}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={dict.title}
          onKeyDown={onKey}
          className={live ? "flex flex-wrap gap-3 md:pointer-events-none md:absolute md:inset-0 md:block" : "flex flex-wrap gap-3"}
        >
          {categories.map((c, i) => {
            const on = i === sel;
            return (
              <button
                key={c}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`skills-tab-${c}`}
                aria-selected={on}
                aria-controls="skills-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => choose(i)}
                onPointerEnter={() => (now.current.hot = i)}
                onPointerLeave={() => (now.current.hot = -1)}
                onFocus={() => (now.current.hot = i)}
                onBlur={() => (now.current.hot = -1)}
                // Phones / no WebGL: an ordinary chip. Live on desktop: a label under its crystal, placed by the scene.
                className={`min-h-11 px-3 font-pixel text-xs transition-colors pixel-border ${on ? "bg-accent text-accent-fg [--pb:var(--accent)]" : "bg-surface text-muted hover:text-text"} ${
                  live
                    ? `md:pointer-events-auto md:absolute md:left-0 md:top-0 md:flex md:h-[5.5rem] md:w-14 md:items-end md:whitespace-nowrap md:justify-center md:bg-transparent md:px-0 md:pb-0 md:shadow-none md:will-change-transform ${on ? "md:text-accent" : ""}`
                    : ""
                }`}
              >
                {dict.categories[c]}
              </button>
            );
          })}
        </div>
      </div>

      {live && (
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => {
            now.current.paused = !paused;
            setPaused(!paused);
          }}
          className="ml-auto hidden min-h-11 items-center gap-2 px-3 font-pixel text-xs text-muted hover:text-text md:flex"
        >
          <span aria-hidden>{paused ? "▶" : "❚❚"}</span>
          {paused ? pause.play : pause.pause}
        </button>
      )}

      <div id="skills-panel" role="tabpanel" aria-labelledby={`skills-tab-${cat}`} tabIndex={0} className="corners mt-6 min-h-56 bg-surface p-6 pixel-border sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <h3 className="font-pixel text-xl font-medium">{dict.categories[cat]}</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {levels.map((lvl) => {
                const list = inCat.filter((s) => s.level === lvl);
                if (!list.length) return null;
                return (
                  <div key={lvl}>
                    <h4 className="mb-3 font-pixel text-xs text-muted">{dict.levels[lvl]}</h4>
                    <ul className="flex flex-wrap gap-3">
                      {list.map((s) => {
                        const logo = skillLogo(s.id);
                        const count = usage[s.id] ?? 0;
                        const cls = `flex min-h-9 items-center gap-2 px-3 text-sm ${lvl === "learning" ? "border-2 border-dashed border-border text-muted" : "bg-bg pixel-border"}`;
                        const body = (
                          <>
                            {/* White tile: several logos are black and would vanish on the dark theme. */}
                            {logo && (
                              // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG
                              <img src={logo} alt="" width={18} height={18} loading="lazy" decoding="async" className="h-[22px] w-[22px] shrink-0 bg-white p-0.5" />
                            )}
                            {s.name}
                            {count > 0 && (
                              <span className="bg-accent-soft px-1.5 font-pixel text-xs text-accent">
                                {count}
                                <span className="sr-only"> {dict.projectCount}</span>
                              </span>
                            )}
                          </>
                        );
                        return (
                          <li key={s.id}>
                            {count > 0 ? (
                              <a href={`?skill=${s.id}#projects`} className={`${cls} transition-transform hover:-translate-y-0.5 hover:[--pb:var(--accent)]`}>
                                {body}
                              </a>
                            ) : (
                              <span className={cls}>{body}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
