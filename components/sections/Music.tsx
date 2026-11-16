"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionary";
import type { MusicData, Track } from "@/app/api/spotify/route";
import SectionHeading from "@/components/ui/SectionHeading";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; data: MusicData };

function Cover({ track, size }: { track: Track; size: number }) {
  return track.image ? (
    <Image src={track.image} alt="" width={size} height={size} className="shrink-0 pixel-border" style={{ width: size, height: size }} />
  ) : (
    <span className="shrink-0 bg-accent-soft pixel-border" style={{ width: size, height: size }} aria-hidden />
  );
}

export default function Music({ dict }: { dict: Dictionary["music"] }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    fetch("/api/spotify")
      .then((r) => r.json() as Promise<MusicData>)
      .then((data) => alive && setState({ status: "ready", data }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const data = state.status === "ready" ? state.data : null;
  // Not connected yet: visitors see no section at all; in development it shows how to connect.
  if (data && !data.configured && process.env.NODE_ENV === "production") return null;

  return (
    <section id="music" className="py-20">
      <SectionHeading title={dict.title} subtitle={dict.subtitle} />

      {state.status === "loading" && <p className="font-pixel text-sm text-muted" role="status">{dict.loading}</p>}
      {(state.status === "error" || (data?.configured && data.error)) && <p className="text-muted" role="status">{dict.error}</p>}
      {data && !data.configured && <p className="bg-surface p-4 font-mono text-sm text-muted pixel-border">{dict.setup}</p>}

      {data?.configured && !data.error && (
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div className="reveal">
            <h3 className="mb-4 flex items-center gap-2 font-pixel text-sm text-accent">
              {data.isPlaying && <span className="cursor h-2 w-2 bg-accent" aria-hidden />}
              {data.isPlaying ? dict.nowPlaying : dict.lastPlayed}
            </h3>
            {data.current ? (
              <a href={data.current.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 bg-surface p-4 pixel-border hover:[--pb:var(--accent)]">
                <Cover track={data.current} size={64} />
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold tracking-tight">{data.current.title}</span>
                  <span className="block truncate text-muted">{data.current.artist}</span>
                </span>
              </a>
            ) : (
              <p className="text-muted">{dict.nothing}</p>
            )}
          </div>

          <div className="reveal">
            <h3 className="mb-4 font-pixel text-sm text-accent">{dict.top}</h3>
            {data.top.length ? (
              <ol className="space-y-3">
                {data.top.map((t, i) => (
                  <li key={t.url}>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 hover:text-accent">
                      <span className="w-6 font-pixel text-sm text-muted">{i + 1}</span>
                      <Cover track={t} size={40} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{t.title}</span>
                        <span className="block truncate text-sm text-muted">{t.artist}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted">{dict.nothing}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
