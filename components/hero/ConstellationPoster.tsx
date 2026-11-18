import { project2D, type ConstellationData } from "@/lib/constellation";

// Low-res viewBox + integer coordinates + crispEdges = the same pixel look as the 3D render.
const W = 192;
const H = 192;
const R = 76;
const TILE = 15; // logo tile, in viewBox units

export default function ConstellationPoster({ data }: { data: ConstellationData }) {
  const pts = data.nodes.map((n) => {
    const [x, y, z] = project2D(n.pos);
    return { x: Math.round(W / 2 + x * R), y: Math.round(H / 2 - y * R), z, n };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" aria-hidden className="h-full w-full">
      <g stroke="var(--edge)" strokeWidth={0.5}>
        {data.edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} />
        ))}
      </g>
      {[...pts]
        .sort((p, q) => p.z - q.z)
        .map(({ x, y, n }) =>
          n.icon ? (
            // White tile so every logo keeps its own colors on light and dark backgrounds.
            <g key={n.id}>
              <rect x={x - TILE / 2} y={y - TILE / 2} width={TILE} height={TILE} fill="#fff" stroke="var(--border)" strokeWidth={0.75} />
              <image href={n.icon} x={x - TILE / 2 + 2} y={y - TILE / 2 + 2} width={TILE - 4} height={TILE - 4} />
            </g>
          ) : (
            <rect key={n.id} x={x - n.size} y={y - n.size} width={n.size * 2} height={n.size * 2} fill={`var(--node-${n.color})`} />
          ),
        )}
    </svg>
  );
}
