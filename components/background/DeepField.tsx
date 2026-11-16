"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

/** Page-wide pixel dust behind all content. Purely decorative; absent on phones and under reduced motion. */
export default function DeepField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startDeepField } = await import("./deepfield3d");
        if (disposed || !ref.current) return;
        stop = startDeepField(ref.current);
        setLive(true);
      } catch {
        // No background is a fine fallback.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-deepfield={live ? "live" : "off"}
      className={`pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-1000 [image-rendering:pixelated] ${live ? "opacity-100" : "opacity-0"}`}
    />
  );
}
