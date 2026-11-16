# Spotify setup (Music section)

The Music section shows what you are playing (or played last) and your top 5 tracks. It stays hidden on the live site until these three values exist. All access is read-only.

## 1. Spotify dashboard

In your app on https://developer.spotify.com/dashboard:

1. Open **Edit settings** and add this Redirect URI exactly: `http://127.0.0.1:8888/callback`
2. Make sure **Web API** is ticked.
3. Copy the **Client ID** and **Client secret** ("View client secret").

## 2. `.env.local` (never committed; `.env*` is in `.gitignore`)

```
SPOTIFY_CLIENT_ID=your client id
SPOTIFY_CLIENT_SECRET=your client secret
SPOTIFY_REFRESH_TOKEN=
```

## 3. Get the refresh token (once)

```bash
node --env-file=.env.local scripts/spotify-token.mjs
```

Open the printed URL, approve, then copy the `SPOTIFY_REFRESH_TOKEN=...` line from the terminal into `.env.local`. Restart `npm run dev`.

## 4. Vercel

Project → Settings → Environment Variables: add the same three names and values, then redeploy.

## Notes

- Never paste the client secret or refresh token into chat, issues, or commits. If one leaks, rotate the secret in the Spotify dashboard and run step 3 again.
- The app is in Spotify "Development mode". That is enough here, because only your own account is read.
- The refresh token lasts as long as the app keeps access (the dashboard shows the lifetime). If the section shows "Could not reach Spotify", run step 3 again.
- The API response is cached for 30 seconds, so "now playing" can lag by that much.
