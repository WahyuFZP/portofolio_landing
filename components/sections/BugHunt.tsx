"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import PixelIcon from "@/components/ui/PixelIcon";
import { btnPrimary } from "@/components/ui/styles";

const ROUND_MS = 20_000;
const SPAWN_MS = 650;
const LIFE_MS = 1600; // a bug that is not caught in time escapes
const MAX_BUGS = 5;

interface Bug {
  id: number;
  x: number; // % of the play area
  y: number;
  born: number;
}
type Phase = "idle" | "playing" | "done";

/** 20-second mini-game: catch the bugs before they escape, then read the "test report". */
export default function BugHunt({ dict }: { dict: Dictionary["bugHunt"] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [caught, setCaught] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [left, setLeft] = useState(ROUND_MS / 1000);
  const run = useRef({ start: 0, lastSpawn: 0, nextId: 0 });

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      const now = performance.now();
      const r = run.current;
      if (now - r.start >= ROUND_MS) {
        setBugs([]);
        setLeft(0);
        setPhase("done");
        return;
      }
      setLeft(Math.ceil((ROUND_MS - (now - r.start)) / 1000));
      const spawn = now - r.lastSpawn >= SPAWN_MS;
      if (spawn) r.lastSpawn = now;
      setBugs((list) => {
        const alive = list.filter((b) => now - b.born < LIFE_MS);
        if (!spawn || alive.length >= MAX_BUGS) return alive;
        return [...alive, { id: r.nextId++, x: 4 + Math.random() * 84, y: 6 + Math.random() * 72, born: now }];
      });
      if (spawn) setSpawned((n) => n + 1);
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  const start = () => {
    run.current = { start: performance.now(), lastSpawn: 0, nextId: 0 };
    setBugs([]);
    setCaught(0);
    setSpawned(0);
    setLeft(ROUND_MS / 1000);
    setPhase("playing");
  };
  const squash = (id: number) => {
    setBugs((list) => list.filter((b) => b.id !== id));
    setCaught((n) => n + 1);
  };

  const rate = spawned ? Math.round((caught / spawned) * 100) : 0;
  const verdict = rate >= 80 ? dict.verdicts.high : rate >= 50 ? dict.verdicts.mid : dict.verdicts.low;

  return (
    <section id="bug-hunt" className="py-20">
      <SectionHeading title={dict.title} subtitle={dict.subtitle} />

      <div className="mb-4 flex flex-wrap items-center gap-6 font-pixel text-sm">
        <p>
          {dict.time}: <span className="text-accent">{left}s</span>
        </p>
        <p>
          {dict.caught}: <span className="text-accent">{caught}</span>
        </p>
      </div>

      <div className="relative h-80 overflow-hidden bg-surface pixel-border">
        {phase === "playing" &&
          bugs.map((b) => (
            // Real buttons: reachable by keyboard and touch, 44px targets.
            <button
              key={b.id}
              type="button"
              onClick={() => squash(b.id)}
              aria-label={dict.bug}
              className="absolute flex h-11 w-11 items-center justify-center text-accent hover:text-text"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              <PixelIcon name="bug" className="h-7 w-7" />
            </button>
          ))}

        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
            {phase === "done" && (
              <div role="status" className="space-y-2">
                <p className="font-pixel text-sm text-accent">{dict.reportTitle}</p>
                <p className="text-2xl font-semibold tracking-tight">{verdict}</p>
                <p className="font-mono text-sm text-muted">
                  {dict.found}: {caught}/{spawned} · {dict.missed}: {spawned - caught} · {dict.accuracy}: {rate}%
                </p>
              </div>
            )}
            {phase === "idle" && <p className="max-w-sm text-muted">{dict.idle}</p>}
            <button type="button" onClick={start} className={btnPrimary}>
              {phase === "done" ? dict.again : dict.start}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
