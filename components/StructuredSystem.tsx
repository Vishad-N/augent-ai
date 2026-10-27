"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { planes, structuredSystem } from "@/data/content";
import { STRUCTURED_SECTION_ID, usePlaneFocus } from "@/lib/planeBus";
import { usePageVisible } from "@/hooks/usePageVisible";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Lottie from "./Lottie";
import SignalLine from "./fx/SignalLine";

const TAB_MS = 5000; // live site: fb-tabs-speed="5000", pauses on hover

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

        <div className="planes-tabs" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          <div className="planes-menu" role="tablist" aria-label="AuGENT planes">
            {planes.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <button
                  type="button"
                  role="tab"
                  data-ack
                  id={`plane-tab-${p.id}`}
                  aria-selected={active === i}
                  aria-controls="plane-panel"
                  className={`plane-tab ${active === i ? "active" : ""}`}
                  onClick={() => select(i)}
                >
                  <span className="plane-tab-heading">
                    <span className="plane-tab-title">{p.title}</span>
                    <strong>{p.tag}</strong>
                  </span>
                  <p>{p.description}</p>
                  <span className="plane-progress" aria-hidden="true">
                    <motion.span style={{ width: active === i ? barWidth : 0 }} />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          <div className="planes-content" id="plane-panel" role="tabpanel" aria-labelledby={`plane-tab-${planes[active].id}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={planes[active].id}
                style={{ width: "100%", display: "flex", justifyContent: "center" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Lottie src={planes[active].lottie} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
