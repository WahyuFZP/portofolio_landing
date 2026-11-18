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
  fish: ["..XX...X", ".XXXX.XX", "XXoXXXXX", ".XXXX.XX", "..XX...X"], // "o" is the eye
};

/** One coral (or the fish) from a small bitmap. */
export function Pixels({ shape, color, className = "" }: { shape: keyof typeof SHAPES; color: string; className?: string }) {
  const rows = SHAPES[shape];
  return (
    <svg {...svg} viewBox={`0 0 ${rows[0].length} ${rows.length}`} className={`pointer-events-none ${className}`}>
      {rows.flatMap((row, y) => [...row].map((c, x) => c !== "." && <rect key={`${x}-${y}`} x={x} y={y} width={1.05} height={1.05} fill={c === "o" ? "var(--ink)" : color} />))}
    </svg>
  );
}
