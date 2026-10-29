"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { solutions, solutionsSection } from "@/data/content";
import { usePageVisible } from "@/hooks/usePageVisible";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import SignalLine from "./fx/SignalLine";
import AuMark from "./fx/AuMark";

/** Time each feature stays on screen before flipping to the next. */
const INTERVAL_MS = 6000;

/**
 * "AuGENT Brings Structure to Enterprise AI" as a split-screen selector.
 * Desktop: feature list (left, ~40%) + content panel (right, ~60%).
 * Mobile: the same tab list restyles into horizontal pills above the panel.
 *
 * Auto-flips through the features. The gold bar (desktop) / pill underline
 * (mobile) fills as a countdown. Pauses while hovered or focused, off screen,
 * in a background tab, and is off entirely for reduced motion. Picking a
 * feature restarts the countdown. Never scrolls the page.
 *
 * One ARIA tablist for both layouts, with roving focus:
 *   Arrow keys move and select, Home/End jump, Tab moves into the panel.
 */
export default function Solutions() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const pageVisible = usePageVisible();
  const current = solutions[active];

  // countdown for the active feature, 0..1 (motion value: no re-render per frame)
  const progress = useMotionValue(0);
  const elapsed = useRef(0);

  const select = (i: number, focus = false) => {
    const next = (i + solutions.length) % solutions.length;
    elapsed.current = 0;
    progress.set(0);
    setActive(next);
    const tab = tabs.current[next];
    if (focus) tab?.focus({ preventScroll: true });
    // keep the active pill visible in the horizontal row (mobile) without
    // ever scrolling the page itself
    const list = listRef.current;
    if (tab && list && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    }
  };

  const running = !reduce && inView && pageVisible && !hovering && !focusWithin;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(elapsed.current / INTERVAL_MS, 1);
      progress.set(p);
      if (p >= 1) {
        select(active + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `select` is stable enough for this loop; re-run on active/running changes only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => select(active + 1, true),
      ArrowRight: () => select(active + 1, true),
      ArrowUp: () => select(active - 1, true),
      ArrowLeft: () => select(active - 1, true),
      Home: () => select(0, true),
      End: () => select(solutions.length - 1, true),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  return (
    <section ref={sectionRef} id="solutions" className="solutions padding-global section-medium">
      <div className="container">
        <SignalLine onDark />
        <Reveal>
          <SectionHeading heading={solutionsSection.heading} subtitle={solutionsSection.subtitle} light gold half />
        </Reveal>

        <Reveal className="pipeline">
          <div
            className="pipeline-hover-zone"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            onFocus={() => setFocusWithin(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
            }}
          >
            <div
              ref={listRef}
              className="pipeline-list"
              role="tablist"
              aria-label="AuGENT solutions"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
            >
              {solutions.map((s, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={s.title}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`solution-tab-${i}`}
                    aria-selected={isActive}
                    aria-controls="solution-panel"
                    tabIndex={isActive ? 0 : -1}
                    data-ack
                    className={`pipeline-item ${isActive ? "is-active" : ""}`}
                    onClick={() => select(i)}
                  >
                    {isActive && (
                      <m.span
                        layoutId="pipeline-bar"
                        className="pipeline-bar"
                        aria-hidden="true"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                      >
                        <m.span className="pipeline-bar-fill" style={{ scaleY: reduce ? 1 : progress }} />
                      </m.span>
                    )}
                    <span className="pipeline-item-title">{s.title}</span>
                    {isActive && !reduce && (
                      <m.span className="pill-progress" aria-hidden="true" style={{ scaleX: progress }} />
                    )}
                  </button>
                );
              })}
            </div>

            {reduce ? (
              // Reduced motion: no 3D turn, just a quick crossfade.
              <div
                className="pipeline-panel"
                id="solution-panel"
                role="tabpanel"
                aria-labelledby={`solution-tab-${active}`}
                tabIndex={0}
              >
                <AuMark className="pipeline-watermark" />
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={current.title}
                    className="pipeline-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PanelContent index={active} />
                  </m.div>
                </AnimatePresence>
              </div>
            ) : (
              <FlipPanel active={active} live={!running} />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PanelContent({ index }: { index: number }) {
  const s = solutions[index];
  return (
    <>
      <h3 className="pipeline-subtitle">{s.subtitle}</h3>
      <p className="pipeline-description">{s.description}</p>
    </>
  );
}

/**
 * Two-sided card that turns on the Y axis (front/back faces with
 * backface-visibility: hidden, perspective on the parent).
 * When the active feature changes, it is written onto the hidden face and the
 * card turns another 180deg, always in the same direction, so repeated
 * switches (and the auto-advance) read as one continuous flip.
 */
function FlipPanel({ active, live }: { active: number; live: boolean }) {
  const [state, setState] = useState({ flips: 0, faces: [active, active] as [number, number] });
  const shown = useRef(active);
  const controls = useAnimationControls();

  // new feature -> paint it on the face that is currently turned away
  useEffect(() => {
    if (active === shown.current) return;
    shown.current = active;
    setState((s) => {
      const flips = s.flips + 1;
      const faces = [...s.faces] as [number, number];
      faces[flips % 2] = active;
      return { flips, faces };
    });
  }, [active]);

  // then turn the card to show it, with a slight dip in scale mid-turn
  useEffect(() => {
    if (state.flips === 0) return;
    controls.start({
      rotateY: state.flips * 180,
      scale: [1, 0.965, 1],
      transition: {
        rotateY: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
        scale: { duration: 0.8, times: [0, 0.5, 1], ease: "easeInOut" },
      },
    });
  }, [state.flips, controls]);

  const front = state.flips % 2 === 0; // which face is toward the viewer

  return (
    <div
      className="pipeline-panel is-flip"
      id="solution-panel"
      role="tabpanel"
      aria-labelledby={`solution-tab-${active}`}
      aria-live={live ? "polite" : "off"}
      tabIndex={0}
    >
      <m.div className="pflip-inner" animate={controls} initial={{ rotateY: 0 }}>
        {[0, 1].map((side) => {
          const visible = (side === 0) === front;
          return (
            <div
              key={side}
              className={`pflip-face ${side === 1 ? "back" : "front"}`}
              aria-hidden={!visible}
              inert={!visible}
            >
              {/* Watermark: the logo's "Au" mark, slowly glowing (CSS opacity loop). */}
              <AuMark className="pipeline-watermark" />
              <div className="pipeline-content">
                <PanelContent index={state.faces[side]} />
              </div>
            </div>
          );
        })}
      </m.div>
    </div>
  );
}
