"use client";

import { useEffect } from "react";

const ACK_MS = 280;

/**
 * One delegated listener for the whole page (no per-card handlers):
 *  - `[data-ack]`  gets a 280ms gold outline flash on click / tap / Enter / Space
 *    (keyboard activation of a button fires `click`, so it is covered too).
 *  - `[data-touch]` toggles `.touch-hover` on tap, the touch stand-in for :hover.
 *    Long-press is handled in CSS via :active under (hover: none).
 */
export default function AckLayer() {
  useEffect(() => {
    const timers = new WeakMap<HTMLElement, number>();
    let lastPointer = "mouse";

    const flash = (el: HTMLElement) => {
      window.clearTimeout(timers.get(el));
      el.classList.remove("ack-on");
      void el.offsetWidth; // restart the CSS animation
      el.classList.add("ack-on");
      timers.set(el, window.setTimeout(() => el.classList.remove("ack-on"), ACK_MS + 20));
    };

    const onPointerDown = (e: PointerEvent) => {
      lastPointer = e.pointerType;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const ack = target?.closest<HTMLElement>("[data-ack]");
      if (ack) flash(ack);

      if (lastPointer === "touch" || lastPointer === "pen") {
        const touch = target?.closest<HTMLElement>("[data-touch]") ?? null;
        document.querySelectorAll<HTMLElement>(".touch-hover").forEach((el) => {
          if (el !== touch) el.classList.remove("touch-hover");
        });
        touch?.classList.toggle("touch-hover");
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
