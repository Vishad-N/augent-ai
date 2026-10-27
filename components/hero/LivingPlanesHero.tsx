"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { hero, planes, structuredSystem } from "@/data/content";
import { focusPlane } from "@/lib/planeBus";
import { AU_PULSE_EVENT, HERO_FX } from "@/lib/heroFx";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { usePointerLocal } from "@/hooks/usePointerLocal";
import { useMagnetic } from "@/hooks/useMagnetic";
import CtaButton from "../CtaButton";
import HeroBackground from "./HeroBackground";
import PlaneStack from "./PlaneStack";
import PlaneCarousel from "./PlaneCarousel";

/** Safety net: the subtitle appears by now even if the entrance never reports back. */
const SUBTITLE_FALLBACK_MS = 2600;
const ease = [0.22, 1, 0.36, 1] as const;
const LINE_STAGGER = 0.16;
const LINE_DELAY = 0.15;

type Fx = typeof HERO_FX;

/**
 * "Living Signal Field" hero (builds on the Living Control Plane hero).
 * - Background: interactive signal field (lines bend, nodes brighten near the cursor).
 * - Headline lines rise in one by one (mask + spring); the subtitle fades in
 *   once the last line lands, and the header "Au" mark pulses once.
 * - Desktop plane stack: slow idle float + light cursor parallax; hovering a
 *   plane lifts it, draws its traces and a faint gold trace along its edges;
 *   click jumps to that plane in the Structured System section.
 * - Mobile (<768px, switched in CSS): swipeable cards with tap-to-expand.
 * - Primary CTA glow flares once on the first mouse move inside the hero.
 * Every behaviour can be switched off via `fx` (defaults in lib/heroFx.ts) and
 * has a reduced-motion fallback. Copy and elements are unchanged.
 */
export default function LivingPlanesHero({ fx: fxOverride }: { fx?: Partial<Fx> } = {}) {
  const fx = { ...HERO_FX, ...fxOverride };
  const reduce = Boolean(useReducedMotion());
  const [active, setActive] = useState<number | null>(null);
  const [landed, setLanded] = useState(!fx.headlineStagger);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setFallback(true), SUBTITLE_FALLBACK_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Scrolling reveals the subtitle too, so it is never skipped past.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    if (v > 24) setFallback(true);
  });

  const onLanded = useCallback(() => {
    setLanded(true);
    if (fx.auPulse && !reduce) window.dispatchEvent(new Event(AU_PULSE_EVENT));
  }, [fx.auPulse, reduce]);

  const activate = useCallback((i: number | null) => setActive(i), []);
  const select = useCallback((i: number) => focusPlane(i), []);

  const showSubtitle = reduce || landed || fallback;
  const current = active === null ? null : planes[active];

  // Copy drifts a few px against the background parallax: reads as "in front".
  // Mouse only; text never drifts on touch while someone is reading it.
  const heroRef = useRef<HTMLElement>(null);
  const { x: px, y: py } = usePointerParallax(heroRef, { touch: false });
  const copyX = useTransform(px, (v) => v * -6);
  const copyY = useTransform(py, (v) => v * -4);
  // the stack moves with the cursor (opposite to the copy): a little depth
  const stackX = useTransform(px, (v) => (fx.stackParallax ? v * 12 : 0));
  const stackY = useTransform(py, (v) => (fx.stackParallax ? v * 8 : 0));

  // CTA glow: flares once, for ~1s, on the first mouse move inside the hero
  const [flare, setFlare] = useState(false);
  const flared = useRef(false);
  const onHeroPointerMove = (e: React.PointerEvent) => {
    if (flared.current || !fx.ctaGlow || reduce || e.pointerType !== "mouse") return;
    flared.current = true;
    setFlare(true);
    window.setTimeout(() => setFlare(false), 1000);
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="lp-hero padding-global"
      data-landed={landed ? "" : undefined}
      onPointerMove={onHeroPointerMove}
    >
      {/* Mouse-reactive depth field; z-index -1, pointer-events none. */}
      <HeroBackground signalField={fx.signalField} />

      <div className="container lp-grid">
        <motion.div className="lp-copy" style={{ x: copyX, y: copyY }}>
          <StaggerTitle text={hero.title} animateIn={fx.headlineStagger && !reduce} onLanded={onLanded} />
          {/* Kept in the DOM (and in the layout) from the start: no CLS, still indexable. */}
          <motion.p
            className="hero-subtitle"
            initial={false}
            animate={{ opacity: showSubtitle ? 1 : 0, y: showSubtitle ? 0 : 8 }}
            transition={{ duration: 0.6, ease }}
          >
            {hero.subtitle}
          </motion.p>
        </motion.div>

        <div className="lp-viz">
          <motion.div
            className="viz-desktop"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <motion.div className="stack-live" style={reduce ? undefined : { x: stackX, y: stackY }}>
              <motion.div
                className="stack-float"
                animate={fx.stackFloat && !reduce ? { y: [0, -9, 0], rotate: [0, 0.6, 0] } : undefined}
                transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
              >
                <PlaneStack active={active} onActivate={activate} onSelect={select} />
              </motion.div>
            </motion.div>

            <div id="plane-readout" className="plane-readout" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current?.id ?? "idle"}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {current ? (
                    <>
                      <p className="readout-title">
                        {current.title} <span>{current.tag}</span>
                      </p>
                      <p className="readout-text">{current.description}</p>
                    </>
                  ) : (
                    <p className="readout-text idle">{structuredSystem.subtitle}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="viz-mobile">
            <PlaneCarousel onEngage={() => undefined} onExplore={select} />
          </div>
        </div>

        <motion.div
          className="lp-cta"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease }}
        >
          <Magnetic>
            <span className={`cta-glow${fx.ctaGlow ? " is-on" : ""}${flare ? " is-flare" : ""}`}>
              <CtaButton label={hero.primaryCta.label} href={hero.primaryCta.href} />
            </span>
          </Magnetic>
          <Magnetic>
            <CtaButton label={hero.secondaryCta.label} href={hero.secondaryCta.href} variant="alternate" noArrow />
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Headline: each line sits in its own mask and springs up into view, one after
 * another. A soft Electric Blue light follows the cursor across the letters
 * (gradient clipped to each line's text, offset so it reads as one light).
 * Reduced motion / stagger off: lines are simply there.
 */
function StaggerTitle({ text, animateIn, onLanded }: { text: string; animateIn: boolean; onLanded: () => void }) {
  const lines = text.split("\n");
  const ref = useRef<HTMLHeadingElement>(null);
  const { x, y, near } = usePointerLocal(ref, 220);
  const alpha = useTransform(near, [0, 1], [0, 0.9]);

  // Without the entrance there's nothing to wait for.
  useEffect(() => {
    if (!animateIn) onLanded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateIn]);

  return (
    <h1 ref={ref} className="hero-title hero-stagger">
      {lines.map((line, i) => (
        <TitleLine
          key={i}
          text={line}
          index={i}
          animateIn={animateIn}
          x={x}
          y={y}
          alpha={alpha}
          onDone={i === lines.length - 1 ? onLanded : undefined}
        />
      ))}
    </h1>
  );
}

function TitleLine({
  text,
  index,
  animateIn,
  x,
  y,
  alpha,
  onDone,
}: {
  text: string;
  index: number;
  animateIn: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  alpha: MotionValue<number>;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const off = useRef({ l: 0, t: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) off.current = { l: ref.current.offsetLeft, t: ref.current.offsetTop };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const lx = useTransform(x, (v) => v - off.current.l);
  const ly = useTransform(y, (v) => v - off.current.t);
  const backgroundImage = useMotionTemplate`radial-gradient(260px circle at ${lx}px ${ly}px, rgba(90, 216, 255, ${alpha}) 0%, rgba(0, 194, 255, 0) 70%), linear-gradient(#fff, #fff)`;

  return (
    <span className="ht-mask">
      <motion.span
        ref={ref}
        className="ht-line"
        style={{ backgroundImage }}
        initial={animateIn ? { y: "110%" } : false}
        animate={{ y: "0%" }}
        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.9, delay: LINE_DELAY + index * LINE_STAGGER }}
        onAnimationComplete={onDone}
      >
        {text}
      </motion.span>
    </span>
  );
}

/** Pulls its child a few px toward a nearby mouse cursor. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { x, y } = useMagnetic(ref, { radius: 60, strength: 0.22, max: 8 });
  return (
    <motion.span ref={ref} className="magnetic" style={{ x, y }}>
      {children}
    </motion.span>
  );
}
