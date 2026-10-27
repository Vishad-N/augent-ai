"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article";
  /** Gold 280ms acknowledgment on click / tap (handled by fx/AckLayer). */
  ack?: boolean;
  /** Tap toggles the hover state on touch devices (handled by fx/AckLayer). */
  touch?: boolean;
};

/** Fade + slide-up on scroll, matching the live site's Webflow IX2 reveals. */
export default function Reveal({ children, className, delay = 0, y = 32, as = "div", ack, touch }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      data-ack={ack ? "" : undefined}
      data-touch={touch ? "" : undefined}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
