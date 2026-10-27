type HeadingParts = { before?: string; accent: string; after?: string };

type Props = {
  heading: HeadingParts;
  subtitle?: string;
  light?: boolean;
  gold?: boolean;
  half?: boolean;
  as?: "h2" | "h1";
};

/** Centered section title with one purple (or gold) accent span, as on the live site. */
export function Title({ heading, light, gold, as = "h2" }: Omit<Props, "subtitle" | "half">) {
  const Tag = as;
  return (
    <Tag className={`heading-title ${light ? "light" : ""}`}>
      {heading.before}
      <span className={`accent ${gold ? "gold" : ""}`}>{heading.accent}</span>
      {heading.after}
    </Tag>
  );
}

export default function SectionHeading({ heading, subtitle, light, gold, half, as }: Props) {
  return (
    <div className="heading">
      <Title heading={heading} light={light} gold={gold} as={as} />
      {subtitle && (
        <p className={`heading-paragraph ${half ? "half" : ""} ${light ? "light" : ""}`}>{subtitle}</p>
      )}
    </div>
  );
}
