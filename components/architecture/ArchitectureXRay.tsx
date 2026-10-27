"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowCounterClockwise, Pause, Play } from "@phosphor-icons/react";
import { architecture, architectureLayers } from "@/data/content";
import type { XRayHandle } from "@/lib/xrayScene";
import { Title } from "../SectionHeading";
import Reveal from "../Reveal";
import SignalLine from "../fx/SignalLine";
import Particles from "../fx/Particles";

const CYCLE_MS = 3200;

/**
 * "A Transparent, End-to-End Architecture" as an X-ray / wireframe reveal.
 *
 * - Left (above on mobile): title, subtitle, and the layer list. The list is
 *   the accessible control and the full fallback: every layer and its tools
 *   are real HTML, so it works without WebGL or with reduced motion.
 * - Right: the three.js scene (lazy-loaded). Entering the section, or the
 *   first hover, dissolves the frosted shell into a wire cage and fades the
 *   layers in. The structure revolves continuously (left to right).
 * - Autoplay steps through the layers by default. Mouse over the section only
 *   pauses the timer; leaving resumes it. Click a layer (scene or list) to
 *   jump to it; autoplay continues from there. Auto-cycle toggle + Reset.
 */
export default function ArchitectureXRay() {
  const reduce = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const handle = useRef<XRayHandle | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  // Autoplay is on by default (off for reduced-motion users, who can still turn it on).
  const [auto, setAuto] = useState(true);
  // Mouse over the section only pauses the timer; it never changes the layer.
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduce) setAuto(false);
  }, [reduce]);

  const focus = selected;
  const inView = useInView(sectionRef, { amount: 0.35, once: true });

  // Lazy-load three.js + the scene when the section is ~one screen away.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!stage || !canvas || !label) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || handle.current) return;
        io.disconnect();
        try {
          const { createXRay } = await import("@/lib/xrayScene");
          if (cancelled) return;
          handle.current = createXRay(stage, canvas, {
            count: architectureLayers.length,
            reduced: reduce,
            label,
            // hovering a layer in the scene only shows a pointer cursor
            onHover: () => {},
            // clicking picks a layer; autoplay carries on from there afterwards
            onPick: (i) => setSelected((cur) => (cur === i ? null : i)),
          });
          setReady(true);
        } catch {
          setFailed(true); // no WebGL: the HTML list carries everything
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(stage);
    return () => {
      cancelled = true;
      io.disconnect();
      handle.current?.dispose();
      handle.current = null;
    };
  }, [reduce]);

  // Reveal on section enter (reduced motion is revealed from the start).
  useEffect(() => {
    if (inView && ready) handle.current?.reveal();
  }, [inView, ready]);

  useEffect(() => {
    handle.current?.setFocus(focus);
  }, [focus, ready]);

  // Autoplay: step to the next layer every CYCLE_MS. Hovering pauses it; leaving
  // resumes with a full interval. Any selection change restarts the countdown.
  useEffect(() => {
    if (!auto || paused || !inView) return;
    const id = window.setTimeout(() => {
      setSelected((s) => ((s ?? -1) + 1) % architectureLayers.length);
    }, CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [auto, paused, inView, selected]);

  const reset = () => {
    setAuto(false);
    setSelected(null);
  };

  const current = focus === null ? null : architectureLayers[focus];

  return (
    <section
      ref={sectionRef}
      id="architecture"
      className="architecture xray padding-global section-medium"
      style={{ ["--circles" as string]: `url("${architecture.circles}")` }}
    >
      <Particles count={14} mobileCount={5} />
      <div className="container">
        <SignalLine onDark />
        <div
          className="xray-grid"
          onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
        >
          <div className="xray-copy">
            <Reveal className="xray-heading">
              <Title heading={architecture.heading} light gold />
              <p>{architecture.subtitle}</p>
            </Reveal>

            <ol className="xray-list" aria-label="Architecture layers">
              {architectureLayers.map((l, i) => {
                const active = focus === i;
                return (
                  <li key={l.name} className={`xray-item ${active ? "is-active" : ""}`}>
                    <button
                      type="button"
                      data-ack
                      aria-expanded={active}
                      aria-controls={`xray-tools-${i}`}
                      onClick={() => setSelected((cur) => (cur === i ? null : i))}
                    >
                      <span className="xray-name">{l.name}</span>
                    </button>
                    <ul id={`xray-tools-${i}`} className="xray-tools" aria-label={`${l.name} tools`}>
                      {l.tools.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>

            {!failed && (
              <div className="xray-controls">
                <button type="button" className="xray-ctl" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>
                  {auto ? <Pause size={16} weight="bold" aria-hidden="true" /> : <Play size={16} weight="bold" aria-hidden="true" />}
                  Auto-cycle
                </button>
                <button type="button" className="xray-ctl" onClick={reset} disabled={selected === null && !auto}>
                  <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
                  Reset
                </button>
              </div>
            )}
          </div>

          {!failed && (
            <div ref={stageRef} className={`xray-stage ${ready ? "is-ready" : ""}`} aria-hidden="true">
              <canvas ref={canvasRef} className="xray-canvas" />
              {/* follows the focused layer; positioned by the scene each frame */}
              <div ref={labelRef} className={`xray-callout ${current ? "is-on" : ""}`}>
                {current && (
                  <>
                    <strong>{current.name}</strong>
                    <span className="xray-callout-tools">
                      {current.tools.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
