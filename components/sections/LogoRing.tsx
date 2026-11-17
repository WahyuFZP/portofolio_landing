import { skills, skillLogo } from "@/content/skills";

const tiles = skills.flatMap((s) => {
  const logo = skillLogo(s.id);
  return logo ? [{ id: s.id, logo }] : [];
});

/**
 * Stack logos on a slowly turning 3D ring, seen from the front. Pure CSS 3D (no canvas):
 * the logos stay sharp and it costs one compositor animation. Decorative; the list below has the names.
 */
export default function LogoRing() {
  return (
    <div aria-hidden className="ring-stage relative mx-auto h-28 max-w-3xl overflow-hidden [--ring-r:230px] [perspective:900px] sm:[--ring-r:360px]">
      {/* --ring-r: ring radius. 360px gives ~90px between logos; phones use a tighter ring so more logos fit. */}
      <div className="ring absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
        {tiles.map((t, i) => (
          <span
            key={t.id}
            className="absolute -left-7 -top-7 flex h-14 w-14 items-center justify-center bg-white pixel-border [backface-visibility:hidden]"
            style={{ transform: `rotateY(${(i * 360) / tiles.length}deg) translateZ(var(--ring-r))` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG, no optimisation to gain */}
            <img src={t.logo} alt="" width={36} height={36} loading="lazy" decoding="async" />
          </span>
        ))}
      </div>
    </div>
  );
}
