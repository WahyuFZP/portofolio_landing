import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial, TorusGeometry, type BufferGeometry } from "three";

// One low-poly object per page section, drawn in the background canvas beside that section.
// Built from a handful of primitives; the half-resolution render turns them into pixel art.

export interface Palette {
  body: MeshLambertMaterial;
  accent: MeshLambertMaterial;
  cyan: MeshLambertMaterial;
  warm: MeshLambertMaterial;
}

type Part = [geo: BufferGeometry, mat: keyof Palette, pos: [number, number, number], rot?: [number, number, number]];

function build(pal: Palette, parts: Part[]): Group {
  const g = new Group();
  for (const [geo, mat, pos, rot] of parts) {
    const m = new Mesh(geo, pal[mat]);
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    g.add(m);
  }
  return g;
}

const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
const cyl = (rTop: number, rBottom: number, h: number, seg = 8) => new CylinderGeometry(rTop, rBottom, h, seg);

const models: Record<string, (pal: Palette) => Group> = {
  // Projects: satellite with two solar panels
  projects: (pal) =>
    build(pal, [
      [box(0.5, 0.5, 0.8), "body", [0, 0, 0]],
      [box(1.0, 0.04, 0.5), "accent", [-0.85, 0, 0]],
      [box(1.0, 0.04, 0.5), "accent", [0.85, 0, 0]],
      [new ConeGeometry(0.28, 0.25, 8, 1, true), "cyan", [0, 0.42, 0]],
      [box(0.06, 0.06, 0.4), "warm", [0, 0, 0.6]],
    ]),
  // Skills: ring station
  skills: (pal) =>
    build(pal, [
      [new TorusGeometry(0.75, 0.12, 4, 12), "accent", [0, 0, 0], [Math.PI / 2, 0, 0]],
      [cyl(0.22, 0.22, 0.9), "body", [0, 0, 0]],
      [box(1.5, 0.05, 0.08), "body", [0, 0, 0]],
      [box(0.08, 0.05, 1.5), "body", [0, 0, 0]],
      [cyl(0.08, 0.08, 0.2), "warm", [0, 0.55, 0]],
    ]),
  // Bug Hunt: beetle
  "bug-hunt": (pal) =>
    build(pal, [
      [box(0.7, 0.3, 0.95), "accent", [0, 0, -0.1]],
      [box(0.45, 0.25, 0.35), "body", [0, -0.02, 0.55]],
      [box(0.08, 0.08, 0.3), "warm", [-0.14, 0.12, 0.8], [-0.5, 0, 0]],
      [box(0.08, 0.08, 0.3), "warm", [0.14, 0.12, 0.8], [-0.5, 0, 0]],
      ...[-0.4, 0, 0.4].flatMap((z): Part[] => [
        [box(0.5, 0.06, 0.08), "body", [-0.55, -0.12, z], [0, 0, 0.5]],
        [box(0.5, 0.06, 0.08), "body", [0.55, -0.12, z], [0, 0, -0.5]],
      ]),
    ]),
  // Experience: rocket
  experience: (pal) =>
    build(pal, [
      [cyl(0.28, 0.28, 1.1), "body", [0, 0, 0]],
      [new ConeGeometry(0.28, 0.5, 8), "accent", [0, 0.8, 0]],
      [cyl(0.2, 0.3, 0.25), "warm", [0, -0.68, 0]],
      [box(0.12, 0.12, 0.04), "cyan", [0, 0.2, 0.28]],
      ...[0, 1, 2].map((i): Part => [box(0.06, 0.45, 0.4), "accent", [Math.sin((i * 2 * Math.PI) / 3) * 0.38, -0.45, Math.cos((i * 2 * Math.PI) / 3) * 0.38], [0, (i * 2 * Math.PI) / 3, 0]]),
    ]),
  // About: astronaut
  about: (pal) =>
    build(pal, [
      [box(0.55, 0.65, 0.35), "body", [0, 0, 0]],
      [box(0.45, 0.42, 0.42), "body", [0, 0.58, 0]],
      [box(0.32, 0.2, 0.06), "cyan", [0, 0.58, 0.22]],
      [box(0.42, 0.5, 0.2), "accent", [0, 0.05, -0.28]],
      [box(0.16, 0.5, 0.18), "body", [-0.42, 0.08, 0], [0, 0, 0.5]],
      [box(0.16, 0.5, 0.18), "body", [0.42, 0.08, 0], [0, 0, -0.5]],
      [box(0.2, 0.5, 0.22), "body", [-0.16, -0.58, 0]],
      [box(0.2, 0.5, 0.22), "body", [0.16, -0.58, 0]],
    ]),
  // Music: record
  music: (pal) =>
    build(pal, [
      [cyl(0.85, 0.85, 0.06, 16), "body", [0, 0, 0]],
      [cyl(0.3, 0.3, 0.08, 12), "accent", [0, 0, 0]],
      [cyl(0.05, 0.05, 0.12, 6), "warm", [0, 0, 0]],
    ]),
  // Contact: dish antenna
  contact: (pal) =>
    build(pal, [
      [new ConeGeometry(0.7, 0.35, 10, 1, true), "accent", [0, 0.35, 0], [Math.PI * 0.82, 0, 0]],
      [cyl(0.03, 0.03, 0.5, 6), "warm", [0, 0.5, 0.12], [0.55, 0, 0]],
      [cyl(0.06, 0.06, 0.7, 6), "body", [0, -0.2, 0]],
      [box(0.6, 0.12, 0.6), "body", [0, -0.6, 0]],
    ]),
};

export const landmarkIds = Object.keys(models);
export const buildLandmark = (id: string, pal: Palette) => models[id](pal);
