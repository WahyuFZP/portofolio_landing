import type { Dictionary } from "@/lib/dictionary";
import { proof } from "@/content/proof";
import PixelIcon from "@/components/ui/PixelIcon";

export default function ProofStrip({ dict, caseStudies }: { dict: Dictionary["proof"]; caseStudies: number }) {
  const item = "boot flex items-center gap-2 bg-surface px-3 py-2 pixel-border";
  return (
    <ul aria-label={dict.label} className="grid grid-cols-2 gap-3 font-pixel text-sm sm:flex sm:flex-wrap">
      {proof.ciRunUrl && (
        <>
          <li className={item} style={{ "--i": 4 } as React.CSSProperties}>
            <PixelIcon name="check" className="h-3.5 w-3.5 text-accent" />
            <a href={proof.ciRunUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {proof.e2ePassing} {dict.tests}
            </a>
          </li>
          <li className={item} style={{ "--i": 5 } as React.CSSProperties}>
            <span className="text-accent">{proof.axeViolations}</span> {dict.a11y}
          </li>
        </>
      )}
      <li className={item} style={{ "--i": 6 } as React.CSSProperties}>
        <a href="#projects" className="hover:text-accent">
          <span className="text-accent">{caseStudies}</span> {dict.caseStudies}
        </a>
      </li>
      <li className={item} style={{ "--i": 7 } as React.CSSProperties}>
        <span className="h-2 w-2 bg-accent" aria-hidden /> {dict.status}
      </li>
    </ul>
  );
}
