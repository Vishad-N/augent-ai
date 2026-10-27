"use client";

import { RefObject, useEffect } from "react";
import { MotionValue, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Options = {
  /** Intensity multiplier on touch / coarse pointers. */
  touchIntensity?: number;
  /** Auto-drift amplitude (-1..1 units) on touch devices when idle. */
  driftAmplitude?: number;
  /** false: stay still on touch devices (used for text, which should not drift while being read). */
  touch?: boolean;
};

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Pointer position over `target`, normalised to -1..1 on both axes and smoothed
 * with a spring. Returned as motion values, so consumers animate without React
 * re-renders.
 *
 * - Mouse: window `pointermove`, coalesced to one update per animation frame.
 * - Touch: tap/drag nudges the field at half strength; when idle, a slow
 *   Lissajous drift at ~20fps keeps it alive.
 * - Everything stops while `target` is off screen or the tab is hidden.
 * - prefers-reduced-motion: stays at 0, no listeners.
 */
export function usePointerParallax(
  target: RefObject<HTMLElement | null>,
  { touchIntensity = 0.5, driftAmplitude = 0.45, touch = true }: Options = {}
): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion();
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const spring = { stiffness: 55, damping: 18, mass: 0.9 };
  const x = useSpring(tx, spring);
  const y = useSpring(ty, spring);

  useEffect(() => {
    const el = target.current;
    if (!el || reduce) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && !touch) return;
    const k = coarse ? touchIntensity : 1;

    let inView = true;
    let frame = 0;
    let pending: { x: number; y: number } | null = null;
    let lastTouch = 0;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      tx.set(pending.x * k);
      ty.set(pending.y * k);
      pending = null;
    };
    const queue = (nx: number, ny: number) => {
      pending = { x: nx, y: ny };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const fromEvent = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return {
        x: clamp(((e.clientX - r.left) / r.width) * 2 - 1),
        y: clamp(((e.clientY - r.top) / r.height) * 2 - 1),
      };
    };

    const onMove = (e: PointerEvent) => {
      if (!inView) return;
      if (e.pointerType !== "mouse") lastTouch = performance.now();
      const p = fromEvent(e);
      queue(p.x, p.y);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      lastTouch = performance.now();
      const p = fromEvent(e);
      queue(p.x, p.y);
    };
    // mouse left the window: ease back to centre
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) queue(0, 0);
    };

    // Idle drift for touch devices, ~20fps, only while visible.
    let driftRaf = 0;
    let lastDrift = 0;
    const drift = (t: number) => {
      driftRaf = requestAnimationFrame(drift);
      if (t - lastDrift < 50) return;
      lastDrift = t;
      if (t - lastTouch < 2500) return; // the user's touch wins for a moment
      tx.set(Math.sin(t / 5200) * driftAmplitude * k);
      ty.set(Math.cos(t / 7100) * driftAmplitude * 0.7 * k);
    };
    const syncDrift = () => {
      const should = coarse && inView && !document.hidden;
      if (should && !driftRaf) driftRaf = requestAnimationFrame(drift);
      if (!should && driftRaf) {
        cancelAnimationFrame(driftRaf);
        driftRaf = 0;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) queue(0, 0);
      syncDrift();
    });
    io.observe(el);

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", syncDrift);
    syncDrift();

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(driftRaf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", syncDrift);
    };
  }, [target, reduce, touchIntensity, driftAmplitude, touch, tx, ty]);

  return { x, y };
}
