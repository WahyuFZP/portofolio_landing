import { skills, type Skill } from "@/content/skills";
import type { Dictionary } from "@/lib/dictionary";
import MarqueePause from "./MarqueePause";

// Two lanes of the tech stack running in opposite directions, cut into a slanted band. Decorative: the Skills section carries the same data.
const testing = skills.filter((s) => ["qa", "security", "devops", "ai"].includes(s.category));
const building = skills.filter((s) => ["frontend", "backend", "database", "design"].includes(s.category));

function Row({ items, chip }: { items: Skill[]; chip: string }) {
  // Rendered twice so the -50% loop is seamless.
  return (
    <>
      {[0, 1].map((copy) => (
        <ul key={copy} className="flex shrink-0 items-center gap-6 pr-6">
          {items.map((s, i) => (
            <li key={s.id} className="flex items-center gap-6 whitespace-nowrap">
              {i % 3 === 1 ? (
                <span className={`px-3 py-1 font-mono text-sm uppercase tracking-wide ${chip}`}>{s.name}</span>
              ) : (
                <span className={i % 3 === 0 ? "font-pixel text-2xl" : "text-xl font-semibold tracking-tight"}>{s.name}</span>
              )}
              {/* Plain squares, not SVG icons: this row repeats ~80 times and must stay light. */}
              <span className={i % 2 ? "h-2 w-2 bg-current" : "h-2 w-2 rotate-45 border-2 border-current"} />
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}

export default function StackMarquee({ dict }: { dict: Dictionary["marquee"] }) {
  // Slanted silhouette comes from clip-path on the wrapper, not from rotating the lanes:
  // a rotated 8000px strip gets a bounding box hundreds of px tall, which contrast tools then
  // treat as the backdrop of unrelated text above and below it.
  const lane = "marquee-band overflow-hidden";
  return (
    <MarqueePause pause={dict.pause} play={dict.play}>
    <div
      aria-hidden
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ clipPath: "polygon(0 22px, 100% 0, 100% calc(100% - 22px), 0 100%)" }}
    >
      <div className={`${lane} bg-accent pb-3 pt-8 text-accent-fg`}>
        <div className="marquee">
          <Row items={testing} chip="border-2 border-current" />
        </div>
      </div>
      <div className={`${lane} bg-surface pb-8 pt-3 text-muted`}>
        <div className="marquee marquee-rev [--marquee-time:70s]">
          <Row items={building} chip="border-2 border-border" />
        </div>
      </div>
    </div>
    </MarqueePause>
  );
}
