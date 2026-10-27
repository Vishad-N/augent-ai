"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Thin gold line that draws across the section when it enters the viewport,
 * then "completes": its end node fills in. The diamond node echoes the hero
 * planes, tying each section back to the control-plane idea.
 */
export default function SignalLine({ onDark = false }: { onDark?: boolean }) {
  const reduce = useReducedMotion();
  const [complete, setComplete] = useState(Boolean(reduce));

  return (
    <div className={`signal-line ${onDark ? "on-dark" : ""}`} aria-hidden="true">
      <motion.span
        className="signal-track"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 1, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setComplete(true)}
      />
      <motion.span
        className={`signal-node ${complete ? "complete" : ""}`}
        initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: 45 }}
        animate={complete ? { opacity: 1, scale: 1, rotate: 45 } : undefined}
        style={{ rotate: 45 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
