import { footer } from "@/data/content";
import { socialSvgs } from "@/data/svgs";

/**
 * Footer social links with a layered-stack hover (adapted from a Uiverse
 * snippet by vikas7754): on hover / focus the tile tilts into isometric view
 * and fans out into five stacked outlines, the top one carrying the icon,
 * while the platform name slides in underneath. Electric Blue to match the
 * theme. The snippet's profile tooltip is left out (no real profile data).
 */
export default function LayeredSocials({ className = "" }: { className?: string }) {
  return (
    <ul className={`soc-list ${className}`.trim()}>
      {footer.social.map((s, i) => (
        <li key={s.label}>
          <a className="soc-icon" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
            <span className="soc-layer" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span className="soc-face" dangerouslySetInnerHTML={{ __html: socialSvgs[i] ?? "" }} />
            </span>
            <span className="soc-label" aria-hidden="true">
              {s.label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
