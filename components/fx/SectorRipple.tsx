"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Use Cases sector icon with a ripple of glass discs (adapted from a Uiverse
 * loader by Smit-Prajapati). Five stacked translucent discs swell and settle
 * one after another; the innermost carries the sector icon, which brightens
 * on each beat.
 *
 * The component stays mounted while the industry changes: the old icon
 * cross-fades into the new one and the outer rings give one short spin and a
 * gold pulse. The sector SVGs are Figma exports with their own static rings
 * baked in, so the image is clipped to its centre disc (icon + blue circle)
 * and the discs here replace those rings. Paused off screen; still for
 * reduced motion.
 */
const FADE_MS = 380;
const PULSE_MS = 1800; // covers the outer rings' staggered spin delays

export default function SectorRipple({ icon }: { icon: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  const last = useRef(icon);
  const [prev, setPrev] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (last.current === icon) return;
    const from = last.current;
    last.current = icon;
    if (reduce) return;
    setPrev(from);
    setPulse(true);
    const t1 = window.setTimeout(() => setPrev(null), FADE_MS);
    const t2 = window.setTimeout(() => setPulse(false), PULSE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [icon, reduce]);

  return (
    <div
      ref={ref}
      className={`sector-ripple${inView ? " is-live" : ""}${pulse ? " is-pulse" : ""}`}
      aria-hidden="true"
    >
      <div className="sr-box">
        {prev && <img key={`out-${prev}`} src={prev} alt="" className="sr-icon sr-icon-out" />}
        <img key={icon} src={icon} alt="" className={`sr-icon${prev ? " sr-icon-in" : ""}`} />
      </div>
      <div className="sr-box" />
      <div className="sr-box" />
      <div className="sr-box" />
      <div className="sr-box" />
    </div>
  );
}
