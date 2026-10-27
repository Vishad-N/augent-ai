"use client";

import { useRef } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import Particles from "../fx/Particles";
import SignalField from "./SignalField";

/**
 * Mouse-reactive depth field behind the hero (pointer-parallax, layered field).
 * Pure DOM/SVG + CSS 3D transforms driven by spring motion values: no WebGL,
 * no per-frame React renders. Sits at z-index -1 inside `.lp-hero` and has
 * `pointer-events: none`, so the stack, text and buttons stay fully interactive.
 *
 *   layer        move   tilt   content
 *   glow          14px  0deg   soft purple light that follows the cursor
 *   deep           8px  1.5   faint grid + circuit traces (deep purple)
 *   mid           20px  2.5   sparse constellation + gold specks
 *   near          40px  3.5   thin light streaks + plane outlines
 */
type Props = {
  /** Interactive canvas field of lines + nodes that respond to the cursor. */
  signalField?: boolean;
  /** The older static SVG constellation (off by default: the field replaces it). */
  constellation?: boolean;
};

export default function HeroBackground({ signalField = true, constellation = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = usePointerParallax(ref);

  return (
    <div ref={ref} className="hero-bg" aria-hidden="true">
      <Layer x={x} y={y} move={14} tilt={0} className="hb-glow-layer">
        <div className="hb-glow" />
      </Layer>

      <Layer x={x} y={y} move={8} tilt={1.5} className="hb-deep">
        <DeepGrid />
      </Layer>

      <Layer x={x} y={y} move={20} tilt={2.5} className="hb-mid">
        {constellation && <Constellation />}
        <Particles count={14} mobileCount={6} />
      </Layer>

      <Layer x={x} y={y} move={40} tilt={3.5} className="hb-near">
        <span className="hb-streak s1" />
        <span className="hb-streak s2" />
        <span className="hb-streak s3" />
        <span className="hb-outline o1" />
        <span className="hb-outline o2" />
      </Layer>

      {/* not inside a parallax layer: its cursor maths needs untransformed coordinates */}
      {signalField && <SignalField />}

      <div className="hb-vignette" />
    </div>
  );
}

/* ---------- one parallax layer ---------- */

function Layer({
  x,
  y,
  move,
  tilt,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  move: number;
  tilt: number;
  className: string;
  children: React.ReactNode;
}) {
  const tx = useTransform(x, (v) => v * move);
  const ty = useTransform(y, (v) => v * move);
  const rotateY = useTransform(x, (v) => v * tilt);
  const rotateX = useTransform(y, (v) => -v * tilt);
  return (
    <motion.div className={`hb-layer ${className}`} style={{ x: tx, y: ty, rotateX, rotateY }}>
      {children}
    </motion.div>
  );
}

/* ---------- deepest: grid + circuit traces ---------- */

function DeepGrid() {
  return (
    <svg className="hb-grid" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id="hb-grid-cell" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M72 0H0V72" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hb-grid-cell)" />
      {/* a few long orthogonal traces snapped to the grid */}
      <g className="hb-traces">
        <path d="M72 216 H360 V432 H648" />
        <path d="M1008 144 H864 V360 H1152 V576" />
        <path d="M216 720 V576 H504 V504" />
        <path d="M1296 720 H1080 V648" />
      </g>
    </svg>
  );
}

/* ---------- mid: sparse constellation ---------- */

// Fixed coordinates (viewBox 1440x900) so server and client render identically.
const NODES: [number, number, number][] = [
  [140, 160, 2], [310, 90, 1.4], [420, 260, 1.8], [250, 420, 1.4], [120, 610, 2.2],
  [380, 740, 1.4], [640, 140, 1.6], [760, 330, 1.2], [1180, 120, 2], [1320, 280, 1.4],
  [1240, 520, 1.8], [1360, 760, 1.4], [1010, 800, 1.6], [880, 640, 1.2],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 7],
  [8, 9], [9, 10], [10, 11], [10, 12], [12, 13],
];
const HALOS = [0, 8, 10];

function Constellation() {
  return (
    <svg className="hb-constellation" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <g className="hb-drift">
        <g className="hb-edges">
          {EDGES.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
        </g>
        <g className="hb-halos">
          {HALOS.map((i) => (
            <circle key={i} cx={NODES[i][0]} cy={NODES[i][1]} r={9} />
          ))}
        </g>
        <g className="hb-nodes">
          {NODES.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </g>
    </svg>
  );
}
