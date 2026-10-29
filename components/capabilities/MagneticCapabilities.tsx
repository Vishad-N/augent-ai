"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Reveal from "../Reveal";
import CapabilityIcon, { type IconKind } from "./CapabilityIcon";
import "./magnetic.css";

export type Capability = { title: string; description: string; icon: IconKind };

// Movement is capped so text stays readable and cards never collide.
const NEAR = 300; // px: the nearest card is pulled toward the cursor inside this radius
const FAR = 440; // px: the other cards recoil inside this radius
const MAX_PULL = 14; // px
const MAX_PUSH = 9; // px
const MAX_SCALE = 1.06;
const MIN_SCALE = 0.975;
const DRIFT = 4; // px of idle drift
const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 992px)";

/**
 * Core Capabilities as magnetic cards.
 * - Desktop (mouse): cards drift very slowly; the card nearest the cursor is pulled
 *   toward it and scales up a little, the others recoil. One rAF loop writes
 *   transforms straight to the DOM (no React renders) and only runs while the grid
 *   is on screen.
 * - Click locks a card in place (drift and magnet stop) and reveals its description.
 *   Click it again, click outside, or press Escape to unlock.
 * - Touch / small screens / reduced motion: no drift, no magnet; tap to expand.
 */
export default function MagneticCapabilities({ items }: { items: Capability[] }) {
  const reduce = useReducedMotion();
  const [locked, setLocked] = useState<number | null>(null);
  const [fine, setFine] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const lockedRef = useRef<number | null>(null);
  lockedRef.current = locked;

  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER);
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const motionOn = fine && !reduce;

  // unlock on outside click / Escape
  useEffect(() => {
    if (locked === null) return;
    const onDown = (e: PointerEvent) => {
      if (!cards.current[locked]?.contains(e.target as Node)) setLocked(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLocked(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [locked]);

  // drift + magnet loop
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !motionOn) return;
    const els = cards.current.filter(Boolean) as HTMLElement[];
    const n = els.length;
    const cur = els.map(() => ({ x: 0, y: 0, s: 1 }));
    const phase = els.map((_, i) => ({ a: i * 1.7, b: i * 2.3 + 1 }));
    const pointer = { x: 0, y: 0, on: false };
    let raf = 0;
    let last = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
    };
    const onLeave = () => {
      pointer.on = false;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const g = grid.getBoundingClientRect(); // one layout read per frame, then writes only
      const px = pointer.x - g.left;
      const py = pointer.y - g.top;
      const lockedNow = lockedRef.current;
      const active = pointer.on && lockedNow === null && px > -FAR && px < g.width + FAR && py > -FAR && py < g.height + FAR;

      // layout centres (offset* ignores transforms) and distance to the cursor
      const dx = new Array<number>(n);
      const dy = new Array<number>(n);
      const dist = new Array<number>(n);
      let nearest = -1;
      let best = Infinity;
      for (let i = 0; i < n; i++) {
        const el = els[i];
        dx[i] = px - (el.offsetLeft + el.offsetWidth / 2);
        dy[i] = py - (el.offsetTop + el.offsetHeight / 2);
        dist[i] = Math.hypot(dx[i], dy[i]) || 1;
        if (dist[i] < best) {
          best = dist[i];
          nearest = i;
        }
      }
      if (best > NEAR) nearest = -1;

      const ease = Math.min(1, dt * 6);
      for (let i = 0; i < n; i++) {
        let tx = 0;
        let ty = 0;
        let ts = 1;
        if (i !== lockedNow) {
          tx = Math.sin(now * 0.00028 + phase[i].a) * DRIFT;
          ty = Math.cos(now * 0.00023 + phase[i].b) * DRIFT;
        }
        if (active) {
          if (i === nearest) {
            const k = 1 - dist[i] / NEAR;
            const pull = Math.min(Math.min(dist[i] * 0.16, MAX_PULL) * k * 1.6, MAX_PULL);
            tx += (dx[i] / dist[i]) * pull;
            ty += (dy[i] / dist[i]) * pull;
            ts = 1 + (MAX_SCALE - 1) * Math.min(1, k * 1.4);
          } else if (dist[i] < FAR) {
            const k = 1 - dist[i] / FAR;
            tx -= (dx[i] / dist[i]) * MAX_PUSH * k;
            ty -= (dy[i] / dist[i]) * MAX_PUSH * k;
            ts = 1 - (1 - MIN_SCALE) * k;
          }
        }
        const c = cur[i];
        c.x += (tx - c.x) * ease;
        c.y += (ty - c.y) * ease;
        c.s += (ts - c.s) * ease;
        els[i].style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.s.toFixed(4)})`;
        els[i].style.zIndex = i === nearest || i === lockedNow ? "2" : "";
      }
    };

    const sync = () => {
      const want = visible && !document.hidden;
      if (want && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!want && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(grid);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", sync);
      for (const el of els) {
        el.style.transform = "";
        el.style.zIndex = "";
      }
    };
  }, [motionOn, items.length]);

  return (
    <div ref={gridRef} className="mag-grid">
      {items.map((c, i) => {
        const open = locked === i;
        return (
          <Reveal key={c.title} className="mag-cell" delay={(i % 3) * 0.08}>
            <article
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={`mag-card${open ? " is-locked" : ""}${motionOn ? " is-live" : ""}`}
            >
              <CapabilityIcon kind={c.icon} />
              <h3 className="mag-title">
                <button
                  type="button"
                  className="mag-toggle"
                  aria-expanded={open}
                  aria-controls={`mag-more-${i}`}
                  onClick={() => setLocked(open ? null : i)}
                >
                  {c.title}
                </button>
              </h3>
              <span className="mag-plus" aria-hidden="true" />
              <div id={`mag-more-${i}`} className="mag-more">
                <div>
                  <p className="mag-desc">{c.description}</p>
                </div>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
