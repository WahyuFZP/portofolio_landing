import type { Dictionary } from "@/lib/dictionary";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import SpotifyEmbed from "./SpotifyEmbed";

/** Turns a normal Spotify share link into its embed URL. Returns null for anything that is not one. */
export function spotifyEmbedUrl(link: string): string | null {
  const m = link.match(/^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : null; // theme=0: dark player
}

/** Playlist player. Not rendered at all until content/profile.ts has a valid Spotify link. */
export default function Music({ dict }: { dict: Dictionary["music"] }) {
  const src = spotifyEmbedUrl(profile.spotify);
  if (!src) return null;
  return (
    <section id="music" className="py-20">
      <SectionHeading title={dict.title} subtitle={dict.subtitle} />
      <SpotifyEmbed src={src} link={profile.spotify} dict={dict} />
    </section>
  );
}
