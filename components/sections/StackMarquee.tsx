import { skills, type Skill } from "@/content/skills";
import PixelIcon from "@/components/ui/PixelIcon";

// Two crossing bands of the tech stack between sections. Decorative: the Skills section carries the same data.
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
              {i % 2 ? <span className="h-2 w-2 bg-current" /> : <PixelIcon name="check" className="h-4 w-4" />}
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}

export default function StackMarquee() {
  const band = "marquee-band absolute left-1/2 w-[110vw] -translate-x-1/2 py-3";
  return (
    <div aria-hidden className="relative left-1/2 h-44 w-screen -translate-x-1/2 overflow-clip">
      <div className={`${band} top-16 rotate-[1.5deg] border-y-2 border-border bg-surface text-muted`}>
        <div className="marquee marquee-rev [--marquee-time:70s]">
          <Row items={building} chip="border-2 border-border" />
        </div>
      </div>
      <div className={`${band} top-12 -rotate-2 bg-accent text-accent-fg`}>
        <div className="marquee">
          <Row items={testing} chip="border-2 border-current" />
        </div>
      </div>
    </div>
  );
}
