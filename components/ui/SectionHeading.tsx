interface Props {
  title: string;
  subtitle?: string;
  index?: string; // "index" variant shows `01 /` + a rule that draws in; omit for the "quiet" variant
}

/** Words slide up one after another as the heading scrolls in (CSS, see .hl-word). */
export function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="hl-word">
      <span style={{ "--w": i } as React.CSSProperties}>{word}</span>
      {" "}
    </span>
  ));
}

export default function SectionHeading({ index, title, subtitle }: Props) {
  return (
    <div className="mb-12">
      {index && (
        <div className="mb-3 flex items-center gap-3 font-pixel text-sm text-accent">
          <span>{index} /</span>
          <span className="heading-rule h-0.5 w-16 bg-accent" aria-hidden />
        </div>
      )}
      <h2 className="font-pixel text-4xl font-medium leading-none sm:text-5xl">
        <Words text={title} />
      </h2>
      {subtitle && <p className="reveal mt-3 max-w-2xl text-lg text-muted">{subtitle}</p>}
    </div>
  );
}
