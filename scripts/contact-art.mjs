// Draws the Contact pixel-art scene ("ground station": a dish sending a signal to a satellite)
// and writes public/hero/ground-station.png. Run: node scripts/contact-art.mjs
import { canvas } from "./pixel-canvas.mjs";

const W = 160, H = 120;
const { set, rect, rand, ri, sprite, fade, save } = canvas(W, H, 23);

// Sky: bands that get bluer toward the horizon.
const SKY = ["#000000", "#02050f", "#040a1c", "#06102b", "#09183b"];
for (let y = 0; y < H; y++) rect(0, y, W, 1, SKY[Math.min(4, Math.floor((y / 92) * 5))]);
for (let i = 0; i < 90; i++) set(ri(0, W - 1), ri(0, 78), rand() < 0.25 ? "#e2e8f0" : rand() < 0.3 ? "#60a5fa" : "#64748b");
for (const [x, y] of [[40, 14], [92, 40], [146, 52], [70, 8]]) {
  set(x, y, "#ffffff");
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) set(x + dx, y + dy, "#60a5fa");
}
// Crescent moon: a disc with a shifted disc cut out of it.
for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) {
  if (x * x + y * y <= 81 && (x - 4) ** 2 + (y + 3) ** 2 > 64) set(22 + x, 24 + y, x + y < -4 ? "#bfdbfe" : "#60a5fa");
}

// Two rows of hills.
const back = (x) => Math.round(86 - 9 * Math.sin(x / 26));
const front = (x) => Math.round(98 - 5 * Math.sin(x / 19 + 1));
for (let x = 0; x < W; x++) {
  rect(x, back(x), 1, H, "#0a1838"); set(x, back(x), "#1d3b7a");
  rect(x, front(x), 1, H, "#050b1a"); set(x, front(x), "#0f2452");
}

// Cabin with a lit window, on the front hill.
const cx = 100, cy = front(cx) - 9;
rect(cx, cy, 16, 10, "#0f172a");
for (let i = 0; i < 5; i++) rect(cx - 1 + i, cy - 1 - i, 18 - i * 2, 1, "#1e293b"); // roof
rect(cx + 3, cy + 3, 3, 3, "#facc15"); rect(cx + 10, cy + 4, 3, 6, "#22d3ee");

// Dish, pointing up and to the right.
const DISH = [
  "..........##....",
  "........##ww#...",
  ".......#wwww#...",
  ".....##wwwww#...",
  "....#wwwwwww#..y",
  "...#wwwwwwww#.y.",
  "..#wwwwwwwww#y..",
  "..#wwwwwwww#....",
  "...#wwwwww#.....",
  "....##www#......",
  "......###.......",
  ".......ss.......",
  ".......ss.......",
  "......ssss......",
];
const dx = 44, dy = front(dx + 8) - 14;
sprite(DISH, { "#": "#94a3b8", w: "#e2e8f0", s: "#64748b", y: "#facc15" }, dx, dy);

// Satellite, and the dashed signal travelling up to it.
const sx = 124, sy = 18;
sprite(["bb.ww.bb", "bb#ww#bb", "bb.ww.bb", "...cc..."], { b: "#2563eb", w: "#e2e8f0", "#": "#94a3b8", c: "#22d3ee" }, sx, sy);
const from = [dx + 17, dy + 3], to = [sx + 3, sy + 5];
const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
for (let i = 2; i < steps - 1; i++) {
  if (i % 5 < 2) set(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps, "#facc15");
}

fade(12, 12, 8, 18);
save("public/hero/ground-station.png");
