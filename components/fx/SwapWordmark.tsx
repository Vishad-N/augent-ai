"use client";

import { useEffect, useId, useRef } from "react";
import { useAnimate, useInView, useReducedMotion } from "framer-motion";
import { AU_GRADIENT, AU_PATH, GENT_LETTERS, WORDMARK_VIEWBOX, type GlyphShape } from "@/data/wordmark";
import { usePageVisible } from "@/hooks/usePageVisible";

type Props = {
  className?: string;
  /** Colour of the GENT letters (the Au mark keeps its gold gradient). */
  color?: string;
  /** Delay between letters within one swap, in seconds. */
  stagger?: number;
  /** Pause between swaps, in ms. */
  rest?: number;
};

const { w: VW, h: VH } = WORDMARK_VIEWBOX;

/**
 * The AuGENT wordmark with a continuous "random letter swap" on GENT
 * (adapted from Originkit's RandomLetterSwap).
 *
 * The Au mark stays still. Each GENT letter sits in its own mask with two
 * copies: on every cycle, in a shuffled order with a small stagger, the visible
 * copy springs up out of the mask while the second copy rises in from below.
 * Then both reset instantly (an invisible jump) and the loop rests.
 *
 * Letter shapes are the logo's own SVG paths, positioned in the logo's
 * coordinate space, so at rest it is pixel-identical to the original image.
 * Pauses off screen and in background tabs; static for reduced motion.
 */
export default function SwapWordmark({ className, color = "#ffffff", stagger = 0.1, rest = 2200 }: Props) {
  const gradId = `au-grad-${useId().replace(/:/g, "")}`;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();
  const inView = useInView(scope, { amount: 0.4 });
  const visible = usePageVisible();
  const running = useRef(false);

  const active = inView && visible && !reduce;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const spring = { type: "spring" as const, duration: 0.8, bounce: 0.2 };

    const swapOnce = async () => {
      const order = GENT_LETTERS.map((_, i) => i).sort(() => Math.random() - 0.5);
      await Promise.all(
        order.map(async (idx, i) => {
          const t = { ...spring, delay: i * stagger };
          await Promise.all([
            animate(`.wm-a-${idx}`, { y: "-100%" }, t),
            animate(`.wm-b-${idx}`, { y: "0%" }, t),
          ]);
          // reset invisibly: the second copy now shows the same letter in the same place
          await Promise.all([
            animate(`.wm-a-${idx}`, { y: "0%" }, { duration: 0 }),
            animate(`.wm-b-${idx}`, { y: "100%" }, { duration: 0 }),
          ]);
        })
      );
    };

    const loop = async () => {
      if (running.current) return;
      running.current = true;
      await sleep(600);
      while (!cancelled) {
        await swapOnce();
        if (cancelled) break;
        await sleep(rest);
      }
      running.current = false;
    };
    loop();
    return () => {
      cancelled = true;
    };
  }, [active, animate, stagger, rest]);

  return (
    <div
      ref={scope}
      className={`swap-wordmark ${className ?? ""}`.trim()}
      role="img"
      aria-label="AuGENT"
      style={{ aspectRatio: `${VW} / ${VH}` }}
    >
      {/* Au: static, original gold gradient */}
      <svg className="wm-au" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient
            id={gradId}
            x1={AU_GRADIENT.x1}
            y1={AU_GRADIENT.y1}
            x2={AU_GRADIENT.x2}
            y2={AU_GRADIENT.y2}
            gradientUnits="userSpaceOnUse"
          >
            {AU_GRADIENT.stops.map(([o, c], i) => (
              <stop key={i} offset={o} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <path d={AU_PATH} fill={`url(#${gradId})`} />
      </svg>

      {/* GENT: each letter in its own mask, two copies for the swap */}
      {GENT_LETTERS.map((l, i) => (
        <span
          key={l.char}
          className="wm-letter"
          aria-hidden="true"
          style={{ left: `${(l.x / VW) * 100}%`, width: `${(l.w / VW) * 100}%` }}
        >
          <span className={`wm-copy wm-a-${i}`}>
            <Glyph x={l.x} w={l.w} shapes={l.shapes} color={color} />
          </span>
          <span className={`wm-copy wm-b-${i}`} style={{ transform: "translateY(100%)" }}>
            <Glyph x={l.x} w={l.w} shapes={l.shapes} color={color} />
          </span>
        </span>
      ))}
    </div>
  );
}

function Glyph({ x, w, shapes, color }: { x: number; w: number; shapes: GlyphShape[]; color: string }) {
  return (
    <svg viewBox={`${x} 0 ${w} ${VH}`} preserveAspectRatio="none" focusable="false">
      {shapes.map((s, i) =>
        s.tag === "path" ? <path key={i} d={s.d} fill={color} /> : <polygon key={i} points={s.points} fill={color} />
      )}
    </svg>
  );
}
