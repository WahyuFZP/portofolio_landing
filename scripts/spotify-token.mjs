// One-time helper: prints a Spotify refresh token for the Music section.
// Run:  node --env-file=.env.local scripts/spotify-token.mjs
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, and this redirect URI
// added in the Spotify dashboard:  http://127.0.0.1:8888/callback
import http from "node:http";
import { randomUUID } from "node:crypto";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const REDIRECT = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played user-top-read"; // read-only
const state = randomUUID();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") return res.writeHead(404).end();
  // The state check stops another page from feeding this server a code.
  if (url.searchParams.get("state") !== state || !url.searchParams.get("code")) {
    res.writeHead(400).end("State mismatch or missing code. Run the script again.");
    return;
  }
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: REDIRECT }),
  });
  const body = await tokenRes.json();
  if (!tokenRes.ok || !body.refresh_token) {
    res.writeHead(500).end("Spotify rejected the request. See the terminal.");
    console.error("Token request failed:", body.error_description ?? body.error ?? tokenRes.status);
  } else {
    res.writeHead(200).end("Done. Go back to the terminal; you can close this tab.");
    console.log("\nAdd this line to .env.local and to the Vercel project settings (keep it secret):\n");
    console.log(`SPOTIFY_REFRESH_TOKEN=${body.refresh_token}\n`);
  }
  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  const auth = new URL("https://accounts.spotify.com/authorize");
  auth.search = new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, state }).toString();
  console.log("Open this URL in your browser and approve access:\n\n" + auth + "\n");
});
