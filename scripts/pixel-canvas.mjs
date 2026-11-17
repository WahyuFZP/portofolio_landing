// Tiny pixel canvas for the art scripts: draw with set/rect/sprite, then save() writes an 8-bit RGB PNG.
// Needs Node 22.2+ (zlib.crc32). No dependencies.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";

export function canvas(W, H, seed) {
  const buf = new Uint8Array(W * H * 3); // starts black
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const set = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) buf.set(typeof c === "string" ? hex(c) : c, (y * W + x) * 3); };
  const get = (x, y) => [...buf.subarray((y * W + x) * 3, (y * W + x) * 3 + 3)];
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, c); };
  // Seeded, so every run draws the same picture.
  const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
  /** rows: one char per pixel; ink maps a char to a color, unmapped chars are transparent. */
  const sprite = (rows, ink, ox, oy) => rows.forEach((row, j) => [...row].forEach((ch, i) => ink[ch] && set(ox + i, oy + j, ink[ch])));
  /** Fade each edge to black over the given number of pixels, so the picture melts into a black page. */
  const fade = (left, right, top, bottom) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = Math.min(1, x / left, (W - 1 - x) / right, y / top, (H - 1 - y) / bottom);
      if (k < 1) set(x, y, get(x, y).map((v) => Math.round(v * k)));
    }
  };
  const save = (path) => {
    const chunk = (type, data) => {
      const out = Buffer.alloc(12 + data.length);
      out.writeUInt32BE(data.length, 0); out.write(type, 4, "latin1"); Buffer.from(data).copy(out, 8);
      out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
      return out;
    };
    const raw = Buffer.alloc((W * 3 + 1) * H); // one filter byte (0) before each row
    for (let y = 0; y < H; y++) Buffer.from(buf.subarray(y * W * 3, (y + 1) * W * 3)).copy(raw, y * (W * 3 + 1) + 1);
    const head = Buffer.alloc(13); head.writeUInt32BE(W, 0); head.writeUInt32BE(H, 4); head.set([8, 2, 0, 0, 0], 8);
    writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
    console.log("wrote", path, W, "x", H);
  };
  return { set, get, rect, rand, ri, sprite, fade, save };
}
