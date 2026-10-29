"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { problemSection, problems } from "@/data/content";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";
import "./problem-chain.css";

const TRAVEL_SECONDS = 1.4; // pulse travel time between neighbouring cards
const HOLD_MS = 2600; // how long a card stays lit when the pulse reaches it

type Pt = { x: number; y: number };

/** Position along the node-to-node path for progress `v` (0..1). */
function along(v: number, pts: Pt[], axis: "x" | "y") {
  if (pts.length < 2) return 0;
  const f = Math.min(Math.max(v, 0), 1) * (pts.length - 1);
  const i = Math.min(Math.floor(f), pts.length - 2);
  return pts[i][axis] + (pts[i + 1][axis] - pts[i][axis]) * (f - i);
}

/**
 * "Connected Risk Chain": the four problems as cards on one line (a vertical
 * line on mobile). A slow gold pulse travels node to node in a loop. Hovering
 * a card (mouse), focusing it (keyboard) or tapping it (touch; tap again to
 * release) parks the pulse on that card, lifts it and turns its connecting
 * segments gold. Reduced motion: no pulse, the active state still works.
 */
export default function ProblemSection() {
  const reduce = Boolean(useReducedMotion());
  const chainRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pts = useRef<Pt[]>([]);
  const pointer = useRef("mouse");

  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [auto, setAuto] = useState<number | null>(null);
  const cursor = useRef(0); // next / current card of the auto tour
  const user = hover ?? focus ?? pinned;
  const active = user ?? auto;

  // Pulse progress 0..1 across the nodes; x/y are derived from measured node centres.
  const progress = useMotionValue(0);
  const x = useTransform(progress, (v) => along(v, pts.current, "x"));
  const y = useTransform(progress, (v) => along(v, pts.current, "y"));

  const measure = useCallback(() => {
    const chain = chainRef.current;
    if (!chain) return;
    const c = chain.getBoundingClientRect();
    pts.current = nodeRefs.current.map((n) => {
      const r = n!.getBoundingClientRect();
      return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
    });
    progress.set(progress.get() + 1e-6); // re-derive x / y
  }, [progress]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (chainRef.current) ro.observe(chainRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // Auto tour: the pulse travels to a card, the card lights up and holds, then
  // the pulse moves on (and wraps round). Hover / focus / tap takes over; when
  // released the tour resumes from that card.
  useEffect(() => {
    const last = problems.length - 1;
    if (reduce) return;
    if (user !== null) {
      cursor.current = user;
      setAuto(null);
      const c = animate(progress, user / last, { type: "spring", stiffness: 110, damping: 20 });
      return () => c.stop();
    }
    let ctrl: ReturnType<typeof animate> | undefined;
    let timer = 0;
    let stopped = false;
    const visit = () => {
      if (stopped) return;
      const i = cursor.current;
      const dist = Math.abs(progress.get() - i / last) * last; // in card-steps
      ctrl = animate(progress, i / last, {
        duration: Math.min(1.6, dist * TRAVEL_SECONDS),
        ease: "easeInOut",
        onComplete: () => {
          if (stopped) return;
          setAuto(i);
          timer = window.setTimeout(() => {
            setAuto(null);
            cursor.current = (i + 1) % problems.length;
            visit();
          }, HOLD_MS);
        },
      });
    };
    visit();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      ctrl?.stop();
    };
  }, [user, reduce, progress]);

  return (
    <section className="problems padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={problemSection.heading} subtitle={problemSection.subtitle} half />
        </Reveal>

        <ol ref={chainRef} className="rc-chain" onPointerLeave={() => setHover(null)}>
          {problems.map((p, i) => {
            const on = active === i;
            const seg = active === i || active === i + 1; // segment to the next card
            return (
              <li key={p.title} className={`rc-item${on ? " is-active" : ""}${seg ? " seg-on" : ""}`}>
                <span
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  className="rc-node"
                  aria-hidden="true"
                />
                {i < problems.length - 1 && <span className="rc-seg" aria-hidden="true" />}
                <button
                  type="button"
                  className="rc-card"
                  aria-pressed={pinned === i}
                  onPointerDown={(e) => (pointer.current = e.pointerType)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && setFocus(i)}
                  onBlur={() => setFocus(null)}
                  onClick={() => {
                    // mouse users get hover; taps and keyboard toggle the card
                    if (pointer.current !== "mouse") setPinned((cur) => (cur === i ? null : i));
                    pointer.current = "";
                  }}
                >
                  <img src={p.image} alt="" className="rc-icon" loading="lazy" />
                  <span className="rc-title">{p.title}</span>
                  <span className="rc-desc">{p.description}</span>
                </button>
              </li>
            );
          })}
          {!reduce && <m.span className="rc-pulse" aria-hidden="true" style={{ x, y }} />}
        </ol>

        <Reveal className="section-button">
          <CtaButton label="Schedule a Demo" />
        </Reveal>
      </div>
    </section>
  );
}
