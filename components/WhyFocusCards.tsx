"use client";

import { useEffect, useRef, useState } from "react";
import { whyAugent, whyAugentDetails } from "@/data/content";
import { whySvgs } from "@/data/svgs";
import Reveal from "./Reveal";
import "./why-focus.css";

/**
 * Four value cards with a focus-on-hover effect (adapted from the Uiverse
 * "hover me" cards): the hovered card scales up, the others blur and shrink.
 * Mouse hover, touch tap (tap again or tap outside to release) and keyboard
 * focus all drive the same state, so the effect is CSS transitions only.
 */
export default function WhyFocusCards() {
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pointer = useRef<string>("mouse");

  // Touch: a tap outside the list releases the focused card.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="wf-stage">
      {/* Soft gold and purple blobs the glass cards frost over. Decorative only. */}
      <span className="wf-orb wf-orb-a" aria-hidden="true" />
      <span className="wf-orb wf-orb-b" aria-hidden="true" />
      <span className="wf-orb wf-orb-c" aria-hidden="true" />
      <span className="wf-orb wf-orb-d" aria-hidden="true" />
      <ul className="wf-grid" ref={listRef} onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}>
        {whyAugent.map((title, i) => (
          <Reveal key={title} as="li" delay={i * 0.1} className="wf-cell">
            <div
              className="wf-card"
              tabIndex={0}
              data-state={active === null ? undefined : active === i ? "active" : "dim"}
              onPointerDown={(e) => (pointer.current = e.pointerType)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onClick={() => pointer.current !== "mouse" && setActive((cur) => (cur === i ? null : i))}
              // Keyboard focus only; mouse/touch focus would fight the click toggle.
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
              onBlur={() => setActive((cur) => (cur === i ? null : cur))}
            >
              {/* Icons are the live site's inline SVGs; they inherit the gold from .wf-icon. */}
              <span className="wf-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: whySvgs[i] ?? "" }} />
              <h3>{title}</h3>
              <p>{whyAugentDetails[i]}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
