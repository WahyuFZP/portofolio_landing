// The mascot: a pixel octopus, drawn cell by cell on a 28 x 27 grid (no image file).
const W = 28;
const H = 27;

/** Builds the grid once: "." empty, "o" outline, "p" body, "h" highlight, "w" eye white, "k" pupil / mouth. */
function build(): string[][] {
  const g = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const set = (x: number, y: number, c: string) => {
    if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c;
  };
  // Head: an ellipse.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (((x - 13.5) / 9.6) ** 2 + ((y - 9.5) / 8.4) ** 2 <= 1) set(x, y, "p");
  // Six tentacles, each two cells wide, swaying a little differently.
  [4, 8, 12, 15, 19, 23].forEach((x0, i) => {
    for (let y = 15; y < 25; y++) {
      const x = x0 + Math.round(Math.sin((y - 15) * 0.8 + i * 1.3));
      set(x, y, "p");
      set(x + 1, y, "p");
    }
  });
  // Highlight on the upper left of the head.
  for (let y = 2; y < 7; y++) for (let x = 6; x < 12; x++) if (g[y][x] === "p" && ((x - 9) / 3) ** 2 + ((y - 4.5) / 2.2) ** 2 <= 1) set(x, y, "h");
  // Eyes (white with a dark pupil) and a small mouth.
  for (const ex of [8, 17]) {
    for (let y = 8; y < 12; y++) for (let x = ex; x < ex + 3; x++) set(x, y, "w");
    for (let y = 9; y < 11; y++) for (let x = ex + 1; x < ex + 3; x++) set(x, y, "k");
  }
  set(13, 13, "k");
  set(14, 13, "k");
  // Outline: every empty cell that touches the body.
  const body = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && g[y][x] !== "." && g[y][x] !== "o";
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "." && (body(x + 1, y) || body(x - 1, y) || body(x, y + 1) || body(x, y - 1))) g[y][x] = "o";
  return g;
}

const GRID = build();
const FILL: Record<string, string> = { o: "var(--ink)", p: "var(--pink)", h: "#ffb3d1", w: "var(--paper)", k: "var(--ink)" };

export default function Octopus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden className={className}>
      {GRID.flatMap((row, y) => row.map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FILL[c]} />)))}
    </svg>
  );
}
