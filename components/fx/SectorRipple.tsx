"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Use Cases sector icon with a ripple of glass discs (adapted from a Uiverse
 * loader by Smit-Prajapati). Five stacked translucent discs swell and settle
 * one after another; the innermost carries the sector icon, which brightens
 * on each beat.
 *
 * The sector SVGs are Figma exports with their own static rings baked in, so
 * the image is clipped to its centre disc (icon + blue circle) and the
 * discs here replace those rings. Paused off screen; still for reduced motion.
 */
export default function SectorRipple({ icon }: { icon: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });

  return (
    <div ref={ref} className={`sector-ripple${inView ? " is-live" : ""}`} aria-hidden="true">
      <div className="sr-box">
        <img src={icon} alt="" className="sr-icon" />
      </div>
      <div className="sr-box" />
      <div className="sr-box" />
      <div className="sr-box" />
      <div className="sr-box" />
    </div>
  );
}
