import type { Dictionary } from "@/lib/dictionary";
import PixelIcon, { type PixelIconName } from "@/components/ui/PixelIcon";

// One icon per card, in the order of dictionaries/*.json about.how.
const ICONS: PixelIconName[] = ["check", "shield", "doc"];

/** The three "How I work" cards. They step in one after another on scroll (data-stagger, see Reveal). */
export default function HowIWork({ items }: { items: Dictionary["about"]["how"] }) {
  return (
    <ol data-stagger className="grid gap-6 md:grid-cols-3">
      {items.map((h, i) => (
        <li key={h.title} className="corners bg-surface p-6 pixel-border">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-accent text-accent" aria-hidden>
            <PixelIcon name={ICONS[i] ?? "check"} className="h-5 w-5" />
          </span>
          <h4 className="mt-4 font-pixel text-lg">{h.title}</h4>
          <p className="mt-2 text-muted">{h.body}</p>
        </li>
      ))}
    </ol>
  );
}
