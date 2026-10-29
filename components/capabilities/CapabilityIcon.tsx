export type IconKind = "agentic" | "tenant" | "llm" | "rag" | "eval" | "security" | "observability";

/**
 * Line icons in the logo purple ("GENT") with thin gold (#F5BC27) accents.
 * Plain inline SVG: no canvas, no WebGL, nothing to load. The gold strokes
 * (`.g`) brighten and glow when the card is hovered (see .cap-icon in living.css).
 */
const ICONS: Record<IconKind, React.ReactNode> = {
  // orchestration: one hub, three agents on gold spokes
  agentic: (
    <>
      <path className="g" d="M32 22V12M26 38 14 45M38 38l12 7" />
      <path d="M32 22l8 4.6v9.2L32 40.4l-8-4.6v-9.2z" />
      <circle cx="32" cy="8" r="4.5" />
      <circle cx="11" cy="48" r="4.5" />
      <circle cx="53" cy="48" r="4.5" />
    </>
  ),
  // isolation: four separate tenants, a gold cross between them
  tenant: (
    <>
      <rect x="8" y="8" width="20" height="20" rx="4" />
      <rect x="36" y="8" width="20" height="20" rx="4" />
      <rect x="8" y="36" width="20" height="20" rx="4" />
      <rect x="36" y="36" width="20" height="20" rx="4" />
      <path className="g" d="M32 4v56M4 32h56" strokeDasharray="2 4" />
    </>
  ),
  // several models working together: overlapping rings
  llm: (
    <>
      <circle cx="24" cy="26" r="15" />
      <circle cx="40" cy="26" r="15" />
      <circle className="g" cx="32" cy="42" r="15" />
    </>
  ),
  // modular pipeline: stacked modules, a gold feed line beside them
  rag: (
    <>
      <rect x="14" y="8" width="36" height="12" rx="3" />
      <rect x="14" y="26" width="36" height="12" rx="3" />
      <rect x="14" y="44" width="36" height="12" rx="3" />
      <path className="g" d="M7 14v36M7 14h4M7 32h4M7 50h4" />
      <path className="g" d="M20 14h6M20 32h6M20 50h6" />
    </>
  ),
  // scoring: a checked core inside a gold gauge ring
  eval: (
    <>
      <circle cx="32" cy="32" r="15" />
      <path d="m25 32.5 5 5 9-10.5" />
      <path className="g" d="M32 4a28 28 0 1 1-26.6 19.3" />
      <path className="g" d="M32 4v5M60 32h-5M32 60v-5" />
    </>
  ),
  // protection: a shield with a gold lock inside
  security: (
    <>
      <path d="M32 6 10 14v16c0 13.5 9 23 22 28 13-5 22-14.5 22-28V14z" />
      <rect className="g" x="24" y="29" width="16" height="12" rx="2.5" />
      <path className="g" d="M27 29v-4a5 5 0 0 1 10 0v4" />
    </>
  ),
  // monitoring: a screen with a gold pulse line
  observability: (
    <>
      <rect x="6" y="9" width="52" height="38" rx="5" />
      <path d="M24 56h16M32 47v9" />
      <path className="g" d="M12 30h10l4-9 8 17 5-11 3 3h10" />
    </>
  ),
};

export default function CapabilityIcon({ kind }: { kind: IconKind; hovered?: boolean }) {
  return (
    <span className="cap-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="88" height="88" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[kind]}
      </svg>
    </span>
  );
}
