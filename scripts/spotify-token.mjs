// One-time helper: gets a Spotify refresh token for the Music section and saves it to .env.local.
// Run:  node --env-file=.env.local scripts/spotify-token.mjs
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, and this redirect URI
// added in the Spotify dashboard:  http://127.0.0.1:8888/callback
import http from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const ENV_FILE = ".env.local";
const REDIRECT = "http://127.0.0.1:8888/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played user-top-read"; // read-only
const state = randomUUID();

// The token goes straight into .env.local and is never printed, so it cannot leak through a terminal or a chat.
function saveToken(token) {
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const env = readFileSync(ENV_FILE, "utf8");
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(env) ? env.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line) : `${env.trimEnd()}\n${line}\n`;
  writeFileSync(ENV_FILE, next);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") return res.writeHead(404).end();
  if (url.searchParams.get("error")) {
    res.writeHead(400).end("Spotify returned an error. See the terminal.");
    console.error("RESULT: failed. Spotify said:", url.searchParams.get("error"));
    return server.close();
  }
  // The state check stops another page from feeding this server a code.
  if (url.searchParams.get("state") !== state || !url.searchParams.get("code")) {
    res.writeHead(400).end("State mismatch or missing code. Run the script again and use the new link.");
    return;
  }
  try {
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
      console.error("RESULT: failed. Token request:", body.error_description ?? body.error ?? tokenRes.status);
    } else {
      saveToken(body.refresh_token);
      res.writeHead(200).end("Done. The token is saved in .env.local. You can close this tab.");
      console.log(`RESULT: saved SPOTIFY_REFRESH_TOKEN to ${ENV_FILE} (scopes: ${body.scope}).`);
      console.log("Restart `npm run dev`, and add the same value to the Vercel project settings.");
    }
  } catch (e) {
    res.writeHead(500).end("Could not reach Spotify. See the terminal.");
    console.error("RESULT: failed.", e.message);
  }
  server.close();
});

server.on("error", (e) => {
  console.error("RESULT: failed. Could not listen on 127.0.0.1:8888:", e.code ?? e.message);
  process.exit(1);
});
server.listen(8888, "127.0.0.1", () => {
  const auth = new URL("https://accounts.spotify.com/authorize");
  auth.search = new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, state }).toString();
  console.log("Open this URL in your browser and approve access:\n\n" + auth + "\n");
});

// Do not keep port 8888 open forever if nobody approves.
setTimeout(() => {
  console.error("RESULT: timed out after 5 minutes without an approval.");
  process.exit(1);
}, 5 * 60_000).unref();
