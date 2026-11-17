// Draws the hero pixel-art scene ("launch night") pixel by pixel and writes public/hero/launch-night.png.
// Run: node scripts/hero-art.mjs   (needs Node 22.2+ for zlib.crc32). The PNG is committed; this only re-draws it.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 240, H = 200, HORIZON = 152;
const buf = new Uint8Array(W * H * 3); // RGB, starts black
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const set = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) buf.set(typeof c === "string" ? hex(c) : c, (y * W + x) * 3); };
const get = (x, y) => [...buf.subarray((y * W + x) * 3, (y * W + x) * 3 + 3)];
const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c); };
let seed = 11;
const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));

// Sky: banded blue glow around the moon.
const MX = 150, MY = 70, MR = 52;
const GLOW = ["#000000", "#02050f", "#040a1c", "#06102b", "#09183b", "#0c1f4d"];
for (let y = 0; y < HORIZON; y++) for (let x = 0; x < W; x++) {
  const d = Math.hypot(x - MX, y - MY) - MR;
  set(x, y, GLOW[Math.max(0, Math.min(5, Math.floor((1 - d / 80) * 6)))]);
}
// Stars.
for (let i = 0; i < 150; i++) {
  const x = ri(0, W - 1), y = ri(0, HORIZON - 20);
  if (Math.hypot(x - MX, y - MY) < MR + 2) continue;
  set(x, y, rand() < 0.25 ? "#e2e8f0" : rand() < 0.3 ? "#60a5fa" : "#64748b");
}
for (const [x, y] of [[22, 30], [60, 14], [88, 52], [214, 22], [228, 84], [40, 96]]) {
  set(x, y, "#ffffff");
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(x + dx, y + dy, "#60a5fa");
}
// Moon: lit from the upper left, five flat bands, craters one band darker.
const MOON = ["#0b1f4d", "#153a8a", "#2563eb", "#60a5fa", "#bfdbfe"];
const CRATERS = [[-20, -18, 9], [14, -26, 6], [-6, 10, 12], [24, 6, 7], [-30, 14, 5], [8, 30, 6], [30, -10, 4]];
for (let y = MY - MR; y <= MY + MR; y++) for (let x = MX - MR; x <= MX + MR; x++) {
  const nx = (x - MX) / MR, ny = (y - MY) / MR, r2 = nx * nx + ny * ny;
  if (r2 > 1) continue;
  const lit = Math.max(0, -0.5 * nx - 0.6 * ny + 0.62 * Math.sqrt(1 - r2));
  let level = Math.min(4, Math.floor(lit * 5.4));
  if (CRATERS.some(([cx, cy, cr]) => Math.hypot(x - MX - cx, y - MY - cy) < cr)) level = Math.max(0, level - 1);
  set(x, y, MOON[level]);
}

// Skyline: one row of buildings with a lit left edge and a few lit windows.
function skyline(from, to, minH, maxH, body, edge, lit) {
  for (let x = from; x < to; ) {
    const w = ri(7, 16), h = ri(minH, maxH), top = HORIZON - h;
    rect(x, top, w, h, body);
    rect(x, top, 1, h, edge);
    const kind = rand();
    if (kind < 0.35) { rect(x + 2, top - 4, w - 4, 4, body); rect(x + 2, top - 4, 1, 4, edge); } // stepped top
    else if (kind < 0.6) { const a = ri(5, 12); rect(x + (w >> 1), top - a, 1, a, body); set(x + (w >> 1), top - a, "#facc15"); } // antenna
    for (let wy = top + 3; wy < HORIZON - 2; wy += 3) for (let wx = x + 2; wx < x + w - 1; wx += 3) {
      const r = rand();
      if (r < lit) set(wx, wy, "#facc15"); else if (r < lit * 1.3) set(wx, wy, "#22d3ee");
    }
    x += w + ri(0, 2);
  }
}
skyline(0, W, 14, 46, "#0a1838", "#1d3b7a", 0.1);

// Launch pad, gantry and rocket, standing in front of the moon.
const RX = 150;
rect(128, 146, 46, 6, "#1e293b");
for (let x = 128; x < 174; x++) set(x, 146, (x >> 1) % 2 ? "#facc15" : "#0f172a"); // hazard stripe
for (let y = 72; y < 146; y++) { set(161, y, "#475569"); set(168, y, "#334155"); }
for (let y = 72; y < 146; y += 8) for (let i = 0; i < 8; i++) { set(161 + i, y + i, "#334155"); set(161 + i, y, "#475569"); }
rect(156, 92, 5, 1, "#475569"); rect(156, 118, 5, 1, "#475569");
set(164, 70, "#facc15"); rect(164, 71, 1, 1, "#475569");
for (let y = 60; y < 78; y++) { const half = Math.min(5, Math.floor((y - 60) / 3)); rect(RX - half, y, half * 2 + 1, 1, "#e2e8f0"); set(RX - half, y, "#ffffff"); set(RX + half, y, "#94a3b8"); } // nose
rect(RX - 5, 78, 11, 62, "#e2e8f0");
rect(RX - 5, 78, 2, 62, "#ffffff");
rect(RX + 3, 78, 3, 62, "#94a3b8");
rect(RX - 5, 96, 11, 4, "#2563eb"); rect(RX + 3, 96, 3, 4, "#1d4ed8");
rect(RX - 5, 122, 11, 2, "#facc15"); rect(RX + 3, 122, 3, 2, "#ca8a04");
rect(RX - 1, 85, 3, 3, "#22d3ee"); set(RX - 1, 85, "#a5f3fc");
for (let i = 0; i < 12; i++) { rect(RX - 6 - (i >> 1), 128 + i, (i >> 1) + 1, 1, "#2563eb"); rect(RX + 6, 128 + i, (i >> 1) + 1, 1, "#1d4ed8"); } // fins
rect(RX - 3, 140, 7, 4, "#334155"); rect(RX - 4, 144, 9, 2, "#1e293b");

// Nearer, darker buildings on both sides of the pad.
skyline(0, 122, 6, 22, "#050b1a", "#0f2452", 0.18);
skyline(180, W, 6, 20, "#050b1a", "#0f2452", 0.18);

// Water: every other row mirrors the bright pixels above it, dimmer with depth.
for (let y = HORIZON; y < H; y++) for (let x = 0; x < W; x++) {
  const depth = (y - HORIZON) / (H - HORIZON);
  let c = [2, 5, 14];
  const sy = Math.round(HORIZON - 1 - (y - HORIZON) * 2.4), sx = x + ((y >> 1) % 2);
  if (y % 2 === 0 && sy >= 0 && sx < W) {
    const s = get(sx, sy), k = 0.45 * (1 - depth);
    if (s[0] + s[1] + s[2] > 150) c = s.map((v, i) => Math.round(c[i] + v * k));
  }
  set(x, y, c);
}

// Foreground ledge with the tester watching the launch.
for (let x = 168; x < W; x++) {
  const top = 176 - Math.floor((x - 168) / 6) * 2;
  rect(x, top, 1, H - top, "#000000");
  set(x, top, "#16306b");
}
const FIGURE = ["..ooo..", ".ooooo.", ".ovvvo.", ".ovvvo.", "..ooo..", ".sssss.", "bsssssy", "bsssss.", "bsssss.", ".sssss.", ".ss.ss.", ".ss.ss.", ".ss.ss.", "dd..dd."];
const INK = { o: "#f1f5f9", v: "#22d3ee", s: "#cbd5e1", b: "#64748b", y: "#facc15", d: "#334155" };
FIGURE.forEach((row, j) => [...row].forEach((ch, i) => INK[ch] && set(204 + i, 150 + j, INK[ch])));

// Fade every edge to black so the picture melts into a black page.
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const k = Math.min(1, x / 28, (W - 1 - x) / 14, y / 12, (H - 1 - y) / 26);
  if (k < 1) set(x, y, get(x, y).map((v) => Math.round(v * k)));
}

// Minimal PNG writer (8-bit RGB, no filter).
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, "latin1"); Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) Buffer.from(buf.subarray(y * W * 3, (y + 1) * W * 3)).copy(raw, y * (W * 3 + 1) + 1);
const head = Buffer.alloc(13); head.writeUInt32BE(W, 0); head.writeUInt32BE(H, 4); head.set([8, 2, 0, 0, 0], 8);
writeFileSync("public/hero/launch-night.png", Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
console.log("wrote public/hero/launch-night.png", W, "x", H);
