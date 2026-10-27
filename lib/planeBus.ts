"use client";

import { useEffect } from "react";
import { animate } from "framer-motion";

/**
 * Tiny event bus so the hero can drive the Structured System tabs without the
 * two components importing each other. Swap the hero and this keeps working.
 */
export const PLANE_EVENT = "augent:plane-focus";
export const STRUCTURED_SECTION_ID = "structured-system";

/** Matches `scroll-padding-top` in globals.css so the fixed header never covers the target. */
const HEADER_OFFSET = 100;

/**
 * Select plane `index` in the Structured System section and scroll to it.
 * Native smooth `scrollIntoView` gets cancelled when React re-renders the hero
 * and tabs mid-scroll, so the scroll is driven explicitly and stops the moment
 * the user takes over (wheel, touch, key).
 */
export function focusPlane(index: number) {
  window.dispatchEvent(new CustomEvent<number>(PLANE_EVENT, { detail: index }));

  const el = document.getElementById(STRUCTURED_SECTION_ID);
  if (!el) return;
  const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }

  const controls = animate(window.scrollY, target, {
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (y) => window.scrollTo({ top: y, behavior: "instant" }),
    onComplete: cleanup,
  });
  const stop = () => {
    controls.stop();
    cleanup();
  };
  function cleanup() {
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
  }
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
}

/** Subscribe to plane selections coming from anywhere on the page. */
export function usePlaneFocus(onFocus: (index: number) => void) {
  useEffect(() => {
    const handler = (e: Event) => onFocus((e as CustomEvent<number>).detail);
    window.addEventListener(PLANE_EVENT, handler);
    return () => window.removeEventListener(PLANE_EVENT, handler);
  }, [onFocus]);
}
