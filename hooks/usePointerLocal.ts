"use client";

import { RefObject, useEffect } from "react";
import { MotionValue, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Result = {
  /** Cursor position in px, relative to the element's top-left. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** 0..1, springs to 1 while the cursor is within `reach` px of the element. */
  near: MotionValue<number>;
};

/**
 * Mouse position local to one element, for cursor-following effects.
 * Fine pointers only (mouse / trackpad); touch and reduced motion get `near = 0`.
 * One window listener, coalesced to one update per frame, idle while off screen.
 */
export function usePointerLocal(target: RefObject<HTMLElement | null>, reach = 200): Result {
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const nearTarget = useMotionValue(0);
  const near = useSpring(nearTarget, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const el = target.current;
    if (!el || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let inView = true;
    let frame = 0;
    let last: { cx: number; cy: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const lx = last.cx - r.left;
      const ly = last.cy - r.top;
      x.set(lx);
      y.set(ly);
      const dx = Math.max(0, -lx, lx - r.width);
      const dy = Math.max(0, -ly, ly - r.height);
      nearTarget.set(Math.hypot(dx, dy) <= reach ? 1 : 0);
    };

    const onMove = (e: PointerEvent) => {
      if (!inView || e.pointerType !== "mouse") return;
      last = { cx: e.clientX, cy: e.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) nearTarget.set(0);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) nearTarget.set(0);
    });
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, [target, reach, reduce, x, y, nearTarget]);

  return { x, y, near };
}
