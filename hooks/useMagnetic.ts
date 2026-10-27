"use client";

import { RefObject, useEffect } from "react";
import { MotionValue, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Options = {
  /** How far outside the element the pull starts, in px. */
  radius?: number;
  /** Fraction of the cursor offset the element follows. */
  strength?: number;
  /** Hard cap on travel, in px. */
  max?: number;
};

/**
 * Magnetic pull: the element drifts a few px toward a nearby cursor and springs
 * back when it leaves. Motion values only (no re-renders); mouse only, so touch
 * layouts never shift under a finger; disabled for reduced motion.
 */
export function useMagnetic(
  target: RefObject<HTMLElement | null>,
  { radius = 60, strength = 0.22, max = 8 }: Options = {}
): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion();
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const spring = { stiffness: 220, damping: 18, mass: 0.5 };
  const x = useSpring(tx, spring);
  const y = useSpring(ty, spring);

  useEffect(() => {
    const el = target.current;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let last: { cx: number; cy: number } | null = null;
    let inView = true;
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));

    const flush = () => {
      frame = 0;
      if (!last) return;
      // measure the untransformed box so the pull doesn't feed back on itself
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - x.get();
      const cy = r.top + r.height / 2 - y.get();
      const dx = last.cx - cx;
      const dy = last.cy - cy;
      const inside =
        Math.abs(dx) <= r.width / 2 + radius && Math.abs(dy) <= r.height / 2 + radius;
      tx.set(inside ? clamp(dx * strength) : 0);
      ty.set(inside ? clamp(dy * strength) : 0);
    };

    const onMove = (e: PointerEvent) => {
      if (!inView || e.pointerType !== "mouse") return;
      last = { cx: e.clientX, cy: e.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) {
        tx.set(0);
        ty.set(0);
      }
    });
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [target, radius, strength, max, reduce, tx, ty, x, y]);

  return { x, y };
}
