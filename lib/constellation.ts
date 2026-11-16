import { skills, type Skill } from "@/content/skills";

// Shared by the server-rendered SVG poster and the client 3D scene, so both draw the same constellation.
export interface ConstellationNode {
  id: string;
  name: string;
  pos: [number, number, number]; // on a unit sphere
  size: 1 | 2 | 3; // learning / familiar / proficient
  color: 1 | 2 | 3; // CSS var --node-N
  linked: boolean; // used by at least one project (clickable in the 3D scene)
}
export interface ConstellationData {
  nodes: ConstellationNode[];
  edges: [number, number][]; // node index pairs
}

const sizeOf: Record<Skill["level"], ConstellationNode["size"]> = { proficient: 3, familiar: 2, learning: 1 };
const colorOf = (s: Skill): ConstellationNode["color"] =>
  s.category === "qa" || s.category === "security" ? 1 : ["frontend", "backend", "database"].includes(s.category) ? 2 : 3;

/** Points = skills (grouped by category along a Fibonacci sphere); edges = skills used together in a project. */
export function buildConstellation(projectTags: string[][]): ConstellationData {
  const n = skills.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const used = new Set(projectTags.flat());
  const nodes = skills.map((s, i): ConstellationNode => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    return { id: s.id, name: s.name, pos: [Math.cos(t) * r, y, Math.sin(t) * r], size: sizeOf[s.level], color: colorOf(s), linked: used.has(s.id) };
  });

  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const tags of projectTags) {
    const ids = tags.map((t) => index.get(t)).filter((i): i is number => i !== undefined);
    for (let a = 0; a < ids.length; a++)
      for (let b = a + 1; b < ids.length; b++) {
        const [i, j] = ids[a] < ids[b] ? [ids[a], ids[b]] : [ids[b], ids[a]];
        const key = `${i}-${j}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      }
  }
  return { nodes, edges };
}

/** Same initial rotation the 3D scene starts from, projected orthographically. */
export function project2D([x, y, z]: [number, number, number], rotY = 0.6, rotX = 0.35): [number, number, number] {
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
  return [x1, y1, z2];
}
