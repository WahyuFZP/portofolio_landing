import type { Dictionary } from "@/lib/dictionary";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillCrystals from "@/components/skills/SkillCrystals";

export default function Skills({ dict, pause, usage }: { dict: Dictionary["skills"]; pause: Dictionary["marquee"]; usage: Map<string, number> }) {
  return (
    <section id="skills" className="py-20">
      <SectionHeading index="02" title={dict.title} subtitle={dict.subtitle} />
      <SkillCrystals dict={dict} pause={pause} usage={Object.fromEntries(usage)} />
    </section>
  );
}
