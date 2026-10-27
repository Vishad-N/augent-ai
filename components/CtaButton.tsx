import { arrowSvg } from "@/data/svgs";

type Props = {
  label: string;
  href?: string;
  /** "primary" = gold → gold-10, "alternate" = white → gold */
  variant?: "primary" | "alternate";
  /** Hide the arrow segment (used by "Explore Architecture"). */
  noArrow?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

/**
 * The live site's two-segment slanted button. Both halves are drawn with
 * ::before/::after so they can share one hover colour + border change.
 */
export default function CtaButton({ label, href = "#cta", variant = "primary", noArrow, onClick }: Props) {
  const cls = ["cta-btn", variant === "alternate" ? "alternate" : "", noArrow ? "no-arrow" : ""].join(" ").trim();
  return (
    <a href={href} className={cls} onClick={onClick}>
      <span className="cta-btn-text">
        <span className="cta-btn-label">{label}</span>
      </span>
      {!noArrow && (
        <span className="cta-btn-arrow" aria-hidden="true">
          <span className="arrow-icon" dangerouslySetInnerHTML={{ __html: arrowSvg }} />
        </span>
      )}
    </a>
  );
}
