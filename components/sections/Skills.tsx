import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillStats from "@/components/skills/SkillStats";

export default function Skills({ dict, usage }: { dict: Dictionary["skills"]; usage: Map<string, number> }) {
  return (
    <section id="skills" className="py-20">
      <div className="flex items-start justify-between gap-8">
        <SectionHeading index="02" title={dict.title} subtitle={dict.subtitle} />
        {/* Motion graphic: two dashed rings turning in opposite directions, one dot per skill category. Decorative. */}
        <svg viewBox="0 0 200 200" aria-hidden className="hidden h-44 w-44 shrink-0 md:block">
          <g className="orbit">
            <circle cx="100" cy="100" r="86" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 9" />
            {[0, 1, 2, 3, 4].map((n) => (
              <circle key={n} cx={100 + 86 * Math.cos((n * Math.PI * 2) / 5)} cy={100 + 86 * Math.sin((n * Math.PI * 2) / 5)} r="6" fill="var(--accent)" />
            ))}
          </g>
          <g className="orbit orbit-rev [--orbit-time:26s]">
            <circle cx="100" cy="100" r="52" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 9" />
            {[0, 1, 2].map((n) => (
              <circle key={n} cx={100 + 52 * Math.cos((n * Math.PI * 2) / 3)} cy={100 + 52 * Math.sin((n * Math.PI * 2) / 3)} r="5" fill="var(--sun)" stroke="var(--accent)" strokeWidth="1.5" />
            ))}
          </g>
          <circle cx="100" cy="100" r="16" fill="var(--peach)" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
      </div>
      <SkillStats dict={dict} usage={Object.fromEntries(usage)} />
    </section>
  );
}
