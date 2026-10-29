"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useMotionValue, useTransform } from "framer-motion";
import { planes, structuredSystem } from "@/data/content";
import { STRUCTURED_SECTION_ID, usePlaneFocus } from "@/lib/planeBus";
import { usePageVisible } from "@/hooks/usePageVisible";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Lottie from "./Lottie";
import SignalLine from "./fx/SignalLine";
import "./plane-links.css";

const TAB_MS = 5000; // live site: fb-tabs-speed="5000", pauses on hover

type Pt = { x: number; y: number };
type Geo = { w: number; h: number; starts: Pt[]; anchors: Pt[] };

/** Where the four lines land on the back edge of the illustration (fraction of its height). */
const ANCHOR_Y = [0.2, 0.4, 0.6, 0.8];
/** Per-line depth cue: 0 = far/thin/faint, 1 = near/thick. */
const DEPTH = [0.45, 0.75, 1, 0.6];

/**
 * Four routes from a card to its four anchors: a high arc, a mid S-curve,
 * a low dip and a wide outer curve (bowing away from the middle of the stage).
 */
function route(k: number, s: Pt, a: Pt, outward: -1 | 1): string {
  const dx = Math.max(a.x - s.x, 40);
  const top = Math.min(s.y, a.y);
  const bottom = Math.max(s.y, a.y);
  const c = (x1: number, y1: number, x2: number, y2: number) => `M${s.x},${s.y} C${x1},${y1} ${x2},${y2} ${a.x},${a.y}`;
  switch (k) {
    case 0: // high arc
      return c(s.x + dx * 0.3, top - 60, a.x - dx * 0.3, top - 45);
    case 1: // mid curve
      return c(s.x + dx * 0.5, s.y, a.x - dx * 0.5, a.y);
    case 2: // low dip
      return c(s.x + dx * 0.3, bottom + 55, a.x - dx * 0.3, bottom + 40);
    default: // outer curve
      return outward < 0
        ? c(s.x + dx * 0.15, top - 95, a.x - dx * 0.2, top - 70)
        : c(s.x + dx * 0.15, bottom + 95, a.x - dx * 0.2, bottom + 70);
  }
}

export default function StructuredSystem() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const inView = useInView(ref, { amount: 0.25 });
  const pageVisible = usePageVisible();

  // Progress lives in a motion value: the bar animates without re-rendering React.
  const progress = useMotionValue(0);
  const barWidth = useTransform(progress, (p) => `${p * 100}%`);
  const elapsed = useRef(0);

  // Geometry for the connector lines, measured from the real layout.
  const tabsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [geo, setGeo] = useState<Geo | null>(null);

  useLayoutEffect(() => {
    const box = tabsRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;
    const measure = () => {
      const b = box.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const starts = cardRefs.current.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.right - b.left, y: r.top - b.top + r.height / 2 };
      });
      const anchors = ANCHOR_Y.map((f) => ({ x: st.left - b.left, y: st.top - b.top + st.height * f }));
      setGeo({ w: b.width, h: b.height, starts, anchors });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(stage);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const select = useCallback(
    (i: number) => {
      elapsed.current = 0;
      progress.set(0);
      setActive(i);
    },
    [progress]
  );

  // Clicking a plane in the hero lands here with that plane selected.
  usePlaneFocus(select);

  const running = inView && pageVisible && !hovering;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(elapsed.current / TAB_MS, 1);
      progress.set(p);
      if (p >= 1) {
        select((active + 1) % planes.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, active, progress, select]);

  return (
    <section ref={ref} id={STRUCTURED_SECTION_ID} className="structured padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={structuredSystem.heading} subtitle={structuredSystem.subtitle} half />
        </Reveal>

        <div ref={tabsRef} className="planes-tabs" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          <div className="planes-menu" role="tablist" aria-label="AuGENT planes">
            {planes.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} y={0}>
                <button
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  data-ack
                  id={`plane-tab-${p.id}`}
                  aria-selected={active === i}
                  aria-controls="plane-panel"
                  className={`plane-tab ${active === i ? "active" : ""}`}
                  onClick={() => select(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && i !== active && select(i)}
                >
                  <span className="plane-tab-heading">
                    <span className="plane-tab-title">{p.title}</span>
                    <strong>{p.tag}</strong>
                  </span>
                  <p>{p.description}</p>
                  <span className="plane-progress" aria-hidden="true">
                    <m.span style={{ width: active === i ? barWidth : 0 }} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          <div className="planes-content" id="plane-panel" role="tabpanel" aria-labelledby={`plane-tab-${planes[active].id}`}>
            {/* The "back plate" of the illustration: the four lines land on its left edge. */}
            <div ref={stageRef} className="plane-stage">
              <AnimatePresence mode="wait">
                <m.div
                  key={planes[active].id}
                  // No rotate/perspective here: a transformed ancestor makes dotlottie mis-size its
                  // canvas and throw ImageData errors. The linked plate is highlighted with a glow instead.
                  className="plane-stage-art"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <Lottie src={planes[active].lottie} />
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {geo && (
            <svg className="pl-overlay" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
              {/* dim lines first so the active card's lines always sit on top */}
              {[...planes.keys()]
                .sort((a, b) => (a === active ? 1 : 0) - (b === active ? 1 : 0))
                .map((i) => {
                  const start = geo.starts[i];
                  const outward: -1 | 1 = start.y < geo.anchors[1].y + (geo.anchors[2].y - geo.anchors[1].y) / 2 ? -1 : 1;
                  const on = i === active;
                  return (
                    <g key={planes[i].id} className={`pl-card${on ? " is-on" : ""}`}>
                      {geo.anchors.map((a, k) => {
                        const d = route(k, start, a, outward);
                        return (
                          <g key={k} style={{ ["--d" as string]: DEPTH[k] }}>
                            <path className="pl-shadow" d={d} transform="translate(0 7)" />
                            <path className="pl-line" d={d} />
                            {/* pathLength=1 lets CSS draw the line from the card (start) to the port (end) */}
                            <path className="pl-draw" d={d} pathLength={1} style={{ ["--k" as string]: k }} />
                            <path className="pl-flow" d={d} style={{ ["--k" as string]: k }} />
                          </g>
                        );
                      })}
                      <circle className="pl-start" cx={start.x} cy={start.y} r={3.5} />
                    </g>
                  );
                })}
              {geo.anchors.map((a, k) => (
                // keyed by the active card so the arrival pulse replays on every switch
                <g key={`${active}-${k}`} className="pl-port" style={{ ["--k" as string]: k }}>
                  <ellipse cx={a.x} cy={a.y} rx={8} ry={4.5} />
                  <circle cx={a.x} cy={a.y} r={2.2} />
                </g>
              ))}
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
