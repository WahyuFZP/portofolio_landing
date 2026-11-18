// Sea-floor decoration drawn cell by cell (no image files): seaweed that sways, coral, and a small fish.
// All of it is decorative: aria-hidden, no pointer events. Motion lives in globals.css (.sway, .swim).

const svg = { "aria-hidden": true, shapeRendering: "crispEdges", preserveAspectRatio: "xMidYMax meet" } as const;

/** A clump of seaweed. Each frond is a wavy column of cells with its own height and its own point in the sway. */
export function Seaweed({ colors, fronds = 5, className = "" }: { colors: [string, string]; fronds?: number; className?: string }) {
  const H = 40;
  return (
    <svg {...svg} viewBox={`0 0 ${fronds * 6} ${H}`} className={`pointer-events-none ${className}`}>
      {Array.from({ length: fronds }, (_, i) => {
        const height = 14 + ((i * 7) % 5) * 6;
        return (
          <g key={i} className="sway" fill={colors[i % 2]} style={{ "--n": i } as React.CSSProperties}>
            {Array.from({ length: height }, (_, y) => (
              <rect key={y} x={i * 6 + 2 + Math.round(Math.sin(y * 0.7 + i))} y={H - 1 - y} width={2} height={1.05} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const SHAPES = {
  branch: ["..X...X..X.", "X.X...X..X.", "X.XX.XX.XX.", "XX.X.X..X..", ".X.XXX.XX..", ".XX.X.XX...", "..XXXXX....", "...XXX.....", "...XXX....."],
  dome: ["..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "X.XX.XXX", ".XXXXXX."],
  // Fish face left; "o" is the eye.
  fish: ["..XX...X", ".XXXX.XX", "XXoXXXXX", ".XXXX.XX", "..XX...X"],
  puffer: ["..XXXX...", ".XXXXXX.X", "XXoXXXXXX", "XXXXXXXXX", ".XXXXXX.X", "..XXXX..."],
  long: [".XXXXXX....X", "XoXXXXXXXXXX", ".XXXXXX....X"],
  angel: ["...XX...", "..XXXX.X", ".XXXXXXX", "XXoXXXXX", ".XXXXXXX", "..XXXX.X", "...XX..."],
};
export type Shape = keyof typeof SHAPES;

/** One coral (or the fish) from a small bitmap. */
export function Pixels({ shape, color, className = "" }: { shape: Shape; color: string; className?: string }) {
  const rows = SHAPES[shape];
  return (
    <svg {...svg} viewBox={`0 0 ${rows[0].length} ${rows.length}`} className={`pointer-events-none ${className}`}>
      {rows.flatMap((row, y) => [...row].map((c, x) => c !== "." && <rect key={`${x}-${y}`} x={x} y={y} width={1.05} height={1.05} fill={c === "o" ? "var(--ink)" : color} />))}
    </svg>
  );
}

/** A decorative fish that crosses its positioned parent (.swim); `rev` swims left to right. */
export function Fish({ shape, color, top, time, delay, rev = false, className = "" }: { shape: Shape; color: string; top: string; time: string; delay: string; rev?: boolean; className?: string }) {
  return (
    <span className={`swim ${rev ? "swim-rev" : ""} pointer-events-none absolute left-0 ${className}`} style={{ top, "--swim-time": time, "--swim-delay": delay } as React.CSSProperties}>
      <Pixels shape={shape} color={color} className={`block h-full w-full ${rev ? "-scale-x-100" : ""}`} />
    </span>
  );
}
