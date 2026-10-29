"use client";

import { useId } from "react";
import { m, useReducedMotion } from "framer-motion";

type Signal = {
  /** index into `paths` the dot travels along */
  path: number;
  /** seconds for one run, start to end */
  dur: number;
  /** start offset in seconds, so dots never move in lockstep */
  begin: number;
};

/**
 * Gold PCB-style traces etched into each plane. Simple orthogonal geometry,
 * one pattern per plane so the layers read as different systems:
 *   0 Intelligent  - branching paths (reasoning fans out), quick signals
 *   1 Control      - gated runs with checkpoints, measured signals
 *   2 Core         - a regular bus (foundation), slow steady signals
 * Idle: faint static lines with glowing dots running along them.
 * Active: the bright copy of the traces draws itself over them.
 */
const PATTERNS: { paths: string[]; pads: [number, number][]; signals: Signal[] }[] = [
  {
    paths: [
      "M12 50 H32 L42 40 H62",
      "M42 40 V22 H82",
      "M62 40 L72 50 H88",
      "M32 50 V74 H54 L64 84",
      "M54 74 H82 V62",
    ],
    pads: [[12, 50], [82, 22], [88, 50], [64, 84], [82, 62]],
    signals: [
      { path: 0, dur: 2.6, begin: 0 },
      { path: 1, dur: 2.2, begin: 1.1 },
      { path: 3, dur: 3.0, begin: 0.6 },
    ],
  },
  {
    paths: [
      "M12 30 H46 V50 H88",
      "M12 70 H30 V50 H46",
      "M62 50 V16",
      "M62 50 V84 H82",
      "M74 30 H88",
    ],
    pads: [[12, 30], [12, 70], [62, 16], [82, 84], [88, 50]],
    signals: [
      { path: 0, dur: 3.6, begin: 0.4 },
      { path: 1, dur: 2.8, begin: 2.1 },
      { path: 3, dur: 2.4, begin: 1.2 },
    ],
  },
  {
    paths: ["M18 18 V82", "M18 36 H82", "M18 64 H82", "M50 36 V64", "M82 18 V82"],
    pads: [[18, 18], [18, 82], [82, 18], [82, 82], [50, 50]],
    signals: [
      { path: 1, dur: 4.4, begin: 0.9 },
      { path: 2, dur: 4.4, begin: 3.1 },
      { path: 4, dur: 5.2, begin: 1.8 },
    ],
  },
];

export default function CircuitTrace({ variant, active }: { variant: number; active: boolean }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const { paths, pads, signals } = PATTERNS[variant % PATTERNS.length];

  return (
    <svg className="circuit" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g className="trace-idle">
        {paths.map((d, i) => (
          <path key={d} id={`${uid}-p${i}`} d={d} />
        ))}
      </g>
      <g className="trace-live">
        {paths.map((d, i) => (
          <m.path
            key={d}
            d={d}
            initial={false}
            animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { pathLength: { duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.15 } }
            }
          />
        ))}
      </g>
      <g className={`trace-pads ${active ? "on" : ""}`}>
        {pads.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 1.6} y={y - 1.6} width={3.2} height={3.2} rx={0.6} />
        ))}
      </g>

      {/* Signal dots: native SVG motion along the trace (no per-frame JS).
          Each fades in at the start of its run and out at the end. */}
      {!reduce && (
        <g className={`trace-signals ${active ? "on" : ""}`}>
          {signals.map((s, i) => (
            <g key={i} opacity={0}>
              <circle className="signal-halo" r={3.4} />
              <circle className="signal-dot" r={1.3} />
              <animateMotion
                dur={`${s.dur}s`}
                begin={`${s.begin}s`}
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath href={`#${uid}-p${s.path}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.82;1"
                dur={`${s.dur}s`}
                begin={`${s.begin}s`}
                repeatCount="indefinite"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
