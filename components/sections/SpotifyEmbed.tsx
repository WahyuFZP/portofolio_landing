"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import { btnPrimary } from "@/components/ui/styles";

interface Props {
  src: string;
  link: string;
  dict: Dictionary["music"];
}

// The player is a third-party iframe, so it loads only after a click:
// no Spotify request or cookie until the visitor asks for it, and no cost to page load.
export default function SpotifyEmbed({ src, link, dict }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="reveal max-w-2xl">
      <div className="h-[352px] bg-surface pixel-border">
        {loaded ? (
          <iframe
            src={src}
            title={dict.frameTitle}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="block border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <button type="button" onClick={() => setLoaded(true)} className={btnPrimary}>
              {dict.load}
            </button>
            <p className="max-w-xs text-sm text-muted">{dict.note}</p>
          </div>
        )}
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-mono text-sm text-muted hover:text-text">
        {dict.open} ↗
      </a>
    </div>
  );
}
