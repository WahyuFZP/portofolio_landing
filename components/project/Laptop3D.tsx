"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle, canRun3D } from "@/lib/scene";

/**
 * Upgrades the flat laptop (children) to a real 3D one where WebGL can run.
 * The flat version stays as the fallback and as what phones and reduced-motion users see.
 */
export default function Laptop3D({ image, children }: { image: string; children: React.ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    let stop: (() => void) | undefined;
    let disposed = false;
    const cancel = afterLoadIdle(async () => {
      try {
        const { startLaptop } = await import("./laptopScene");
        if (disposed || !ref.current) return;
        // Same optimised image the flat laptop uses, at a size that fits the 3D screen.
        stop = startLaptop(ref.current, `/_next/image?url=${encodeURIComponent(image)}&w=828&q=75`);
        setLive(true);
      } catch {
        // Keep the flat laptop.
      }
    });
    return () => {
      disposed = true;
      cancel();
      stop?.();
    };
  }, [image]);

  return (
    // Above the card's stretched link while live, so the laptop can be dragged.
    <div className={`relative ${live ? "z-10" : ""}`}>
      <div className={`transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`}>{children}</div>
      <canvas
        ref={ref}
        aria-hidden
        data-laptop={live ? "live" : "off"}
        className={`absolute -inset-x-8 -inset-y-6 hidden h-[calc(100%+3rem)] w-[calc(100%+4rem)] cursor-grab md:block transition-opacity duration-500 active:cursor-grabbing ${live ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
    </div>
  );
}
