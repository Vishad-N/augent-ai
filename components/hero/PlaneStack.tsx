"use client";

import { useEffect, useRef } from "react";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { planes } from "@/data/content";
import CircuitTrace from "./CircuitTrace";

type Props = {
  active: number | null;
  onActivate: (index: number | null) => void;
  onSelect: (index: number) => void;
};

/** translateZ per plane, top to bottom: Intelligent above Control above Core. */
const DEPTH = [84, 0, -84];
/** How far the hovered plane lifts toward the viewer. */
const LIFT = 34;

/**
 * Desktop three-plane stack. An isometric 3D group (CSS transforms, no WebGL)
 * with a gentle mouse tilt driven by motion values, so pointer movement never
 * re-renders React. Labels are real buttons: they carry keyboard focus and
 * give the planes a 48px+ hit area that does not depend on 3D hit-testing.
 */
export default function PlaneStack({ active, onActivate, onSelect }: Props) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 110, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), spring);

  // Signal dots are native SVG animations: pause them while the stack is off
  // screen, hidden (mobile layout) or the tab is in the background.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let inView = false;
    const sync = () => {
      const run = inView && !document.hidden;
      stage.querySelectorAll<SVGSVGElement>("svg.circuit").forEach((svg) => {
        if (run) svg.unpauseAnimations();
        else svg.pauseAnimations();
      });
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
    onActivate(null);
  };

  return (
    <div ref={stageRef} className="stack-stage" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="stack-shadow" aria-hidden="true" />

      <m.div className="stack-tilt" style={{ rotateX, rotateY }}>
        <div className="stack-iso">
          {planes.map((p, i) => {
            const isActive = active === i;
            const dimmed = active !== null && !isActive;
            return (
              <m.div
                key={p.id}
                className={`plane-layer l${i} ${isActive ? "is-active" : ""}`}
                initial={reduce ? false : { z: DEPTH[i] - 60, opacity: 0 }}
                animate={{ z: DEPTH[i] + (isActive ? LIFT : 0), opacity: dimmed ? 0.4 : 1 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 22 }}
                onPointerEnter={() => onActivate(i)}
                onClick={() => onSelect(i)}
                aria-hidden="true"
              >
                <CircuitTrace variant={i} active={isActive} />
                {/* faint gold light running along the edges of the active plane */}
                <span className="plane-edge" />
              </m.div>
            );
          })}
        </div>
      </m.div>

      <div className="stack-labels">
        {planes.map((p, i) => (
          <button
            key={p.id}
            type="button"
            data-ack
            className={`stack-label lbl${i} ${active === i ? "is-active" : ""}`}
            onPointerEnter={() => onActivate(i)}
            onFocus={() => onActivate(i)}
            onBlur={() => onActivate(null)}
            onClick={() => onSelect(i)}
            aria-describedby="plane-readout"
          >
            <span className="stack-label-title">{p.title}</span>
            <span className="stack-label-tag">{p.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
