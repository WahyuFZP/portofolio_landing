"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import { afterLoadIdle, canRun3D, EXTRA_SCENES } from "@/lib/scene";

/** The three "How I work" cards, with the scroll-driven release-pipeline scene above them on desktop. */
export default function HowIWork({ items }: { items: Dictionary["about"]["how"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [stage, setStage] = useState(-1); // -1 idle, 0..2 gate the cube is at, 3 shipped

  useEffect(() => {
    if (!EXTRA_SCENES || !canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startPipeline } = await import("./pipeline3d");
        if (disposed || !canvasRef.current) return;
        stop = startPipeline(canvasRef.current, setStage);
        setLive(true);
      } catch {
        // The cards carry all the content; the scene is an extra.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, []);

  return (
    <>
      {/* Space is reserved on desktop so nothing jumps when the scene starts. Decorative: the cards say the same thing. */}
      {EXTRA_SCENES && (
        <div aria-hidden className="hidden h-40 md:block motion-reduce:md:hidden">
          <canvas
            ref={canvasRef}
            data-pipeline={live ? "live" : "off"}
            className={`h-full w-full transition-opacity duration-500 [image-rendering:pixelated] ${live ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      {/* Without the scene above, the cards need their own gap from the heading. */}
      <ol className={`grid gap-6 md:grid-cols-3 ${EXTRA_SCENES ? "" : "md:mt-6"}`}>
        {items.map((h, i) => {
          const lit = live && (stage === i || stage === 3);
          return (
            <li
              key={h.title}
              data-lit={lit || undefined}
              className="corners reveal bg-surface p-6 pixel-border transition-transform duration-300 data-[lit]:-translate-y-1 data-[lit]:[--pb:var(--accent)]"
            >
              <p className="font-pixel text-sm text-accent">0{i + 1}</p>
              <h4 className="mt-2 text-lg font-semibold tracking-tight">{h.title}</h4>
              <p className="mt-2 text-muted">{h.body}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
