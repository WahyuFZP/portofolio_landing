// Read-only Spotify data for the Music section: what is playing now (or was played last) and the top 5 tracks.
// Credentials stay on the server; the browser only ever sees track names, links, and cover URLs.
// Setup: docs/spotify-setup.md

export const dynamic = "force-dynamic";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1/me";

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  external_urls: { spotify?: string };
  album: { images: { url: string }[] };
}
export interface Track {
  title: string;
  artist: string;
  url: string;
  image: string | null;
}
export type MusicData =
  | { configured: false }
  | { configured: true; error: true }
  | { configured: true; error: false; isPlaying: boolean; current: Track | null; top: Track[] };

// Only pass through links and images that really point at Spotify.
const safe = (url: string | undefined, host: RegExp) => (url && host.test(url) ? url : null);
function toTrack(t: SpotifyTrack | null | undefined): Track | null {
  const url = safe(t?.external_urls?.spotify, /^https:\/\/open\.spotify\.com\//);
  if (!t || !url) return null;
  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    url,
    image: safe(t.album.images.at(-1)?.url, /^https:\/\/i\.scdn\.co\//), // last = smallest cover
  };
}

const json = (data: MusicData, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });

export async function GET() {
  const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret, SPOTIFY_REFRESH_TOKEN: refresh } = process.env;
  if (!id || !secret || !refresh) return json({ configured: false });

  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return json({ configured: true, error: true }, 502);
    const { access_token } = (await tokenRes.json()) as { access_token: string };
    const get = (path: string) => fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${access_token}` }, cache: "no-store" });

    const [nowRes, topRes] = await Promise.all([get("/player/currently-playing"), get("/top/tracks?limit=5&time_range=short_term")]);

    // 204 = nothing playing right now.
    const now = nowRes.status === 200 ? ((await nowRes.json()) as { is_playing: boolean; item: SpotifyTrack | null }) : null;
    let current = toTrack(now?.item);
    const isPlaying = !!now?.is_playing && !!current;
    if (!current) {
      const recentRes = await get("/player/recently-played?limit=1");
      if (recentRes.ok) current = toTrack(((await recentRes.json()) as { items: { track: SpotifyTrack }[] }).items[0]?.track);
    }
    const top = topRes.ok ? ((await topRes.json()) as { items: SpotifyTrack[] }).items.map(toTrack).filter((t): t is Track => !!t) : [];

    return json({ configured: true, error: false, isPlaying, current, top });
  } catch {
    return json({ configured: true, error: true }, 502);
  }
}
