import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillStats from "@/components/skills/SkillStats";

export default function Skills({ dict, usage }: { dict: Dictionary["skills"]; usage: Map<string, number> }) {
  return (
    <section id="skills" className="py-20">
      <SectionHeading index="02" title={dict.title} subtitle={dict.subtitle} />
      <SkillStats dict={dict} usage={Object.fromEntries(usage)} />
    </section>
  );
}
