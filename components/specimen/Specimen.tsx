"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

/** The site's signature: a glass specimen under a scanner, fixed behind the page. Decorative; absent on phones and under reduced motion. */
export default function Specimen() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startSpecimen } = await import("./specimen3d");
        if (disposed || !ref.current) return;
        stop = startSpecimen(ref.current);
        setLive(true);
      } catch {
        // The page is complete without it.
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
      data-specimen={live ? "live" : "off"}
      className={`pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-1000 [image-rendering:pixelated] ${live ? "opacity-100" : "opacity-0"}`}
    />
  );
}
