"use client";

/**
 * Particle halo ring (adapted from Originkit's "Aurora Drift" / HaloSpray).
 *
 * A WebGL point field: a slowly spinning ring of dots, two ribbon "arms" that
 * stream in from the left and out to the bottom right, plus a faint inner veil
 * and thread. Dots part around the pointer.
 *
 * Changes from the original for this site:
 *  - recoloured to the theme (Electric Blue ring fading to Ice Blue, gold
 *    ribbons to match the Au mark), transparent background;
 *  - `children` are rendered centred inside the ring: the ring's on-screen
 *    centre and diameter are published as --halo-x / --halo-y / --halo-d;
 *  - the loop pauses off screen and in background tabs, and draws one still
 *    frame for reduced motion;
 *  - Framer property-control code removed.
 */

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

export interface HaloSprayRing {
  band?: number;
  fray?: number;
  squash?: number;
  tilt?: number;
  spin?: number;
}

export interface HaloSprayFlow {
  direction?: "out" | "in";
  flow?: number;
  angle?: number;
  width?: number;
  core?: number;
  strays?: number;
  breath?: number;
  drift?: number;
}

export interface HaloSprayLines {
  direction?: "right" | "left";
  flow?: number;
  angle?: number;
  pinch?: number;
  fan?: number;
  veil?: number;
}

export interface HaloSprayProps {
  background?: string;
  density?: number;
  scale?: number;
  rotation?: number;
  mirror?: boolean;
  ring?: HaloSprayRing;
  spray?: HaloSprayFlow;
  lines?: HaloSprayLines;
  dotSize?: number;
  ringColor?: string;
  ringEdgeColor?: string;
  ribbonColor?: string;
  reach?: number;
  strength?: number;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULTS = {
  background: "transparent",
  density: 100,
  scale: 122,
  rotation: 0,
  mirror: false,
  dotSize: 100,
  ringColor: "#00c2ff",
  ringEdgeColor: "#E8F4FF",
  ribbonColor: "#DFC580",
  reach: 10,
  strength: 5,
  speed: 5,
};
const DEFAULT_RING: Required<HaloSprayRing> = { band: 5, fray: 5, squash: 97, tilt: -8, spin: 5 };
const DEFAULT_SPRAY: Required<HaloSprayFlow> = {
  direction: "out",
  flow: 5,
  angle: 0,
  width: 100,
  core: 55,
  strays: 3,
  breath: 5,
  drift: 5,
};
const DEFAULT_LINES: Required<HaloSprayLines> = {
  direction: "right",
  flow: 5,
  angle: 0,
  pinch: 45,
  fan: 100,
  veil: 100,
};

const ART_W = 1000;
const ART_H = 1032;
const RING_X = 520;
const RING_Y = 532;
const RING_R = 283;
const RING_SQUASH = DEFAULT_RING.squash / 100;
const RING_BAND = 2.8;
const RING_TOP_SPREAD = 4;
const RING_FRAY = 24;

const RING_SPIN_SEC = 60;
const RING_DOTS = 7500;

const VEIL_EDGES: number[][] = [
  [-91, 134, 134],
  [-84, 100, 145],
  [-73, 72, 153],
  [-62, 52, 146],
  [-52, 42, 141],
  [-47, 34, 125],
  [-34, 28, 97],
  [-24, 25, 60],
  [-13, 20, 23],
  [-8, 18, 18],
];
const VEIL_LANES = 14;
const VEIL_DOTS = 2000;
const VEIL_STREAKS = 150;
const VEIL_SPEED = 1.6;

const THREAD_FROM = 262;
const THREAD_TO = 790;
const THREAD_Y = 525;
const THREAD_FLOW_SEC = 8;
const THREAD_CORE = 110;
const THREAD_LOOSE = 90;
const THREAD_FAN = 380;

const RIBBON_DOTS = 8000;
const RIBBON_PX_PER_SEC = 66;
const RIBBON_SIGMA = 52;
const CORE_SIGMA = 14;
const RING_JOIN = 60;

const DOT_MIN = 1.3;
const DOT_MAX = 7.2;
const DOT_FLOOR = 1.2;
const TWINKLE = 0.08;
const DRIFT = 4;
const DRIFT_SEC = 7;

const TAU = Math.PI * 2;
const RAD = Math.PI / 180;

function clamp(v: number, lo: number, hi: number) {
  const n = typeof v === "number" && isFinite(v) ? v : lo;
  return n < lo ? lo : n > hi ? hi : n;
}

function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

const frac = (x: number) => x - Math.floor(x);

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand());
}

type RGBA = { r: number; g: number; b: number; a: number };

function parseColor(input: unknown, fallback: RGBA): RGBA {
  if (typeof input !== "string") return fallback;
  const s = input.trim();
  if (s[0] === "#") {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    if (h.length !== 6 && h.length !== 8) return fallback;
    const n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) return fallback;
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
      a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1,
    };
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (p.length >= 3 && p.slice(0, 3).every((x) => !isNaN(x)))
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && !isNaN(p[3]) ? p[3] : 1 };
  }
  return fallback;
}

function mix(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  };
}

const WHITE: RGBA = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };

type Path = {
  x: Float32Array;
  y: Float32Array;
  nx: Float32Array;
  ny: Float32Array;
  n: number;
  len: number;
  knots: number[];
};

function buildPath(pts: number[][], step = 2, runIn = 0, runOut = 0): Path {
  const dense: number[][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < 40; j++) {
      const t = j / 40;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[pts.length - 1]);
  const run = (from: number[], toward: number[], len: number) => {
    const dx = from[0] - toward[0];
    const dy = from[1] - toward[1];
    const l = Math.hypot(dx, dy) || 1;
    const m = Math.ceil(len / 20);
    return Array.from({ length: m }, (_, j) => [
      from[0] + (dx / l) * len * ((j + 1) / m),
      from[1] + (dy / l) * len * ((j + 1) / m),
    ]);
  };
  const pre = runIn > 0 ? run(dense[0], dense[1], runIn).reverse() : [];
  if (runOut > 0) dense.push(...run(dense[dense.length - 1], dense[dense.length - 2], runOut));
  dense.unshift(...pre);
  const cum = [0];
  for (let i = 1; i < dense.length; i++)
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const total = cum[cum.length - 1];
  const samples = Math.max(2, Math.ceil(total / step));
  const x = new Float32Array(samples);
  const y = new Float32Array(samples);
  const nx = new Float32Array(samples);
  const ny = new Float32Array(samples);
  let k = 0;
  for (let i = 0; i < samples; i++) {
    const d = (i / (samples - 1)) * total;
    while (k < cum.length - 2 && cum[k + 1] < d) k++;
    const seg = cum[k + 1] - cum[k] || 1;
    const f = clamp((d - cum[k]) / seg, 0, 1);
    x[i] = dense[k][0] + (dense[k + 1][0] - dense[k][0]) * f;
    y[i] = dense[k][1] + (dense[k + 1][1] - dense[k][1]) * f;
  }
  for (let i = 0; i < samples; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(samples - 1, i + 1);
    const tx = x[b] - x[a];
    const ty = y[b] - y[a];
    const l = Math.hypot(tx, ty) || 1;
    nx[i] = -ty / l;
    ny[i] = tx / l;
  }
  return { x, y, nx, ny, n: samples, len: total, knots: pts.map((_, i) => cum[pre.length + i * 40]) };
}

const ARM_RUN = 3000;
const LEFT_ARM = buildPath(
  [
    [-10, -60],
    [45, 20],
    [75, 100],
    [95, 180],
    [120, 260],
    [160, 320],
    [190, 390],
    [218, 460],
    [236, 530],
    [248, 610],
  ],
  2,
  ARM_RUN
);

const RIGHT_ARM = buildPath(
  [
    [570, 247],
    [667, 277],
    [756, 334],
    [815, 398],
    [858, 460],
    [886, 525],
    [884, 600],
    [882, 680],
    [884, 760],
    [895, 840],
    [885, 905],
    [850, 960],
    [815, 1010],
    [780, 1090],
  ],
  2,
  0,
  ARM_RUN
);
const ARMS = [LEFT_ARM, RIGHT_ARM];

const ARM_FROM = [LEFT_ARM.knots[0], 0];
const ARM_TO = [LEFT_ARM.knots[LEFT_ARM.knots.length - 1], RIGHT_ARM.knots[RIGHT_ARM.knots.length - 2]];

const ARM_DIST = ARMS.map((p) => Float32Array.from(p.x, (x, i) => Math.hypot(x - RING_X, p.y[i] - RING_Y)));
const INNER = [-1, 1];
const CORE_SHIFT = [16, 28];
const HALO_LEAN = [0.1, 0.35];

let SX = 0;
let SY = 0;
let SNX = 0;
let SNY = 0;
function sample(p: Path, s: number) {
  const f = clamp(s, 0, 1) * (p.n - 1);
  const i = Math.min(p.n - 2, Math.floor(f));
  const t = f - i;
  SX = p.x[i] + (p.x[i + 1] - p.x[i]) * t;
  SY = p.y[i] + (p.y[i + 1] - p.y[i]) * t;
  SNX = p.nx[i] + (p.nx[i + 1] - p.nx[i]) * t;
  SNY = p.ny[i] + (p.ny[i + 1] - p.ny[i]) * t;
}

let VU = 0;
let VL = 0;

function veilEdges(th: number) {
  const d = th / RAD;
  const t = VEIL_EDGES;
  let i = 0;
  while (i < t.length - 2 && t[i + 1][0] < d) i++;
  const f = clamp((d - t[i][0]) / (t[i + 1][0] - t[i][0]), 0, 1);
  VU = t[i][1] + (t[i + 1][1] - t[i][1]) * f;
  VL = t[i][2] + (t[i + 1][2] - t[i][2]) * f;
}

function threadHalf(x: number, pinch: number, fan: number) {
  return x < pinch
    ? 3 + 42 * Math.pow((pinch - x) / (pinch - THREAD_FROM), 1.4)
    : 3 + 80 * fan * Math.pow((x - pinch) / (THREAD_TO - pinch), 1.2);
}

const tone = (uy: number) => (uy + 1) / 2;

type Dot = {
  s: number;
  g: number;
  v: number;
  sf: number;
  a: number;
  c: number;
  arm: number;
  ph: number;
  tp: number;
};

type Field = { ring: Dot[]; veil: Dot[]; thread: Dot[]; ribbon: Dot[] };

function buildField(dens: number, coreShare: number, strayShare: number, armRun: number[]): Field {
  const rand = mulberry32(9 * 7919 + 13);
  const count = (c: number) => Math.round(c * dens);
  const dot = (d: Partial<Dot>): Dot => ({
    s: rand(),
    g: 0,
    v: 1,
    sf: 0,
    a: 1,
    c: 0,
    arm: 0,
    ph: rand() * TAU,
    tp: 3 + Math.floor(rand() * 4),
    ...d,
  });

  const ring: Dot[] = [];
  for (let i = 0, n = count(RING_DOTS); i < n; i++) {
    const stray = rand() < 0.03;
    const g = stray ? (rand() < 0.5 ? -1 : 1) * (2.2 + rand() * 1.8) : clamp(gauss(rand), -1.8, 2.8);
    const outer = clamp((g - 0.5) / 1.8, 0, 1);
    ring.push(
      dot({
        s: rand() * TAU,
        g,
        v: 0.96 + rand() * 0.08,
        sf: rand() < 0.12 + outer * 0.4 || stray ? 0.3 + rand() * 0.3 : 0.03 + Math.pow(rand(), 2) * 0.18,
        a: 0.85 + rand() * 0.15,
      })
    );
  }

  const veil: Dot[] = [];
  for (let i = 0, n = count(VEIL_DOTS); i < n; i++) {
    const u = rand();
    const big = rand() < 0.05;
    veil.push(
      dot({
        g: clamp((rand() < 0.5 ? Math.round(u * VEIL_LANES) / VEIL_LANES : u) + gauss(rand) * 0.05, 0, 1.1),
        v: 0.85 + rand() * 0.3,
        sf: big ? 0.2 + rand() * 0.2 : Math.pow(rand(), 2) * 0.08,
        a: 0.35 + rand() * 0.45,
      })
    );
  }
  for (let i = 0, n = count(VEIL_STREAKS); i < n; i++)
    veil.push(dot({ g: 1 + rand(), c: 1, v: 0.85 + rand() * 0.3, sf: 0.1 + rand() * 0.3, a: 0.9 }));

  const thread: Dot[] = [];
  for (let i = 0, n = count(THREAD_CORE); i < n; i++)
    thread.push(dot({ g: clamp(gauss(rand), -2.5, 2.5), arm: 0, v: 0.95 + rand() * 0.1, sf: 0.22 + rand() * 0.23, a: 0.95 }));
  for (let i = 0, n = count(THREAD_LOOSE); i < n; i++)
    thread.push(dot({ g: rand() * 2 - 1, arm: 1, v: 0.85 + rand() * 0.3, sf: 0.2 + rand() * 0.35, a: 0.95 }));
  for (let i = 0, n = count(THREAD_FAN); i < n; i++) {
    const big = rand() < 0.2;
    const g = rand() * 2 - 1;
    thread.push(
      dot({
        g: rand() < 0.5 ? Math.round(g * 7) / 7 + gauss(rand) * 0.01 : g,
        arm: 2,
        v: 0.85 + rand() * 0.3,
        sf: big ? 0.3 + rand() * 0.25 : Math.pow(rand(), 2.5) * 0.22,
        a: big ? 0.95 : 0.65 + rand() * 0.3,
      })
    );
  }

  const ribbon: Dot[] = [];
  for (let arm = 0; arm < 2; arm++)
    for (let i = 0, n = count((RIBBON_DOTS / 2) * armRun[arm]); i < n; i++) {
      const inner = INNER[arm];
      const kind = rand();
      const v = 0.85 + rand() * 0.3;
      const r = rand();
      if (kind < coreShare) {
        const lane = Math.round(gauss(rand) * 3) / 3 + gauss(rand) * 0.05;
        ribbon.push(
          dot({
            g: lane * CORE_SIGMA - inner * CORE_SHIFT[arm],
            arm,
            v,
            sf: Math.pow(rand(), 2.2) * 0.3,
            a: 0.8 + rand() * 0.2,
            c: r < 0.12 ? 2 : 0,
          })
        );
      } else if (kind < 1 - strayShare) {
        ribbon.push(
          dot({
            g: (gauss(rand) + inner * HALO_LEAN[arm]) * RIBBON_SIGMA,
            arm,
            v,
            sf: 0.15 + Math.pow(rand(), 1.2) * 0.6,
            a: 1,
            c: r < 0.8 ? 0 : r < 0.9 ? 1 : 2,
          })
        );
      } else {
        ribbon.push(
          dot({
            g: inner * (2.4 + rand() * 2.2) * RIBBON_SIGMA,
            arm,
            v,
            sf: 0.5 + rand() * 0.3,
            a: 1,
            c: r < 0.7 ? 0 : 1,
          })
        );
      }
    }

  return { ring, veil, thread, ribbon };
}

type RGB = [number, number, number];
/**
 * Colours tell a "filter" story: the left stream comes in gold with purple and
 * neon-red impurities mixed in, passes through the ring, and the dots that
 * fall away on the right come out clean blue.
 */
type Palette = { ribbon: RGB[]; clean: RGB[]; impurity: RGB[]; top: RGB; edge: RGB; inner: RGB };
const rgb = (c: RGBA): RGB => [c.r / 255, c.g / 255, c.b / 255];

/** share of the incoming (left) stream that is impurity dots */
const IMPURITY_SHARE = 0.16;
const PURPLE: RGBA = { r: 178, g: 76, b: 255, a: 1 };
const NEON_RED: RGBA = { r: 255, g: 45, b: 85, a: 1 };

function buildPalette(ringColor: string, ringEdgeColor: string, ribbonColor: string): Palette {
  const top = parseColor(ringColor, parseColor(DEFAULTS.ringColor, WHITE));
  const edge = parseColor(ringEdgeColor, parseColor(DEFAULTS.ringEdgeColor, WHITE));
  const rib = parseColor(ribbonColor, parseColor(DEFAULTS.ribbonColor, WHITE));
  return {
    ribbon: [rgb(rib), rgb(mix(rib, WHITE, 0.35)), rgb(mix(rib, BLACK, 0.35))],
    clean: [rgb(top), rgb(mix(top, WHITE, 0.45)), rgb(mix(top, BLACK, 0.25))],
    impurity: [rgb(PURPLE), rgb(NEON_RED)],
    top: rgb(top),
    edge: rgb(edge),
    inner: rgb(mix(top, WHITE, 0.15)),
  };
}

function toward(out: RGB, from: RGB, pal: Palette, t: number, j: number) {
  for (let i = 0; i < 3; i++) out[i] = from[i] + (pal.top[i] + (pal.edge[i] - pal.top[i]) * t - from[i]) * j;
  return out;
}

const VERT = `
attribute vec2 a_pos;
attribute float a_size;
attribute vec4 a_col;
uniform vec2 u_res;
varying vec4 v_col;
varying float v_size;
void main() {
    vec2 c = a_pos / u_res * 2.0 - 1.0;
    gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
    gl_PointSize = a_size + 2.0;
    v_col = a_col;
    v_size = a_size;
}`;

const FRAG = `
precision mediump float;
varying vec4 v_col;
varying float v_size;
void main() {
    float d = length(gl_PointCoord - 0.5) * (v_size + 2.0);
    float r = v_size * 0.5;
    float a = v_col.a * (1.0 - smoothstep(r - 0.75, r + 0.75, d));
    if (a < 0.003) discard;
    gl_FragColor = vec4(v_col.rgb * a, a);
}`;
const STRIDE = 7;

function createProgram(gl: WebGLRenderingContext) {
  const shader = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function HaloSpray({
  background = DEFAULTS.background,
  density = DEFAULTS.density,
  scale = DEFAULTS.scale,
  rotation = DEFAULTS.rotation,
  mirror = DEFAULTS.mirror,
  ring = { band: 5, fray: 5, spin: 4.1, tilt: -8, squash: 99 },
  spray = { core: 54, flow: 5, angle: -4, drift: 5, width: 100, breath: 5, strays: 9, direction: "out" },
  lines = { fan: 135, flow: 5, veil: 13, angle: 0, pinch: 56, direction: "right" },
  dotSize = DEFAULTS.dotSize,
  ringColor = DEFAULTS.ringColor,
  ringEdgeColor = DEFAULTS.ringEdgeColor,
  ribbonColor = DEFAULTS.ribbonColor,
  reach = DEFAULTS.reach,
  strength = DEFAULTS.strength,
  speed = DEFAULTS.speed,
  className,
  style,
  children,
}: HaloSprayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const values = {
    density,
    scale,
    rotation,
    mirror,
    ring: { ...DEFAULT_RING, ...ring },
    spray: { ...DEFAULT_SPRAY, ...spray },
    lines: { ...DEFAULT_LINES, ...lines },
    dotSize,
    ringColor,
    ringEdgeColor,
    ribbonColor,
    reach,
    strength,
    speed,
  };
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const prog = createProgram(gl);
    gl.useProgram(prog);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const attr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
    };
    attr("a_pos", 2, 0);
    attr("a_size", 1, 2);
    attr("a_col", 4, 3);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    let data = new Float32Array(0);

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      W = root.offsetWidth;
      H = root.offsetHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      // publish the ring's on-screen centre + diameter so children can sit inside it
      const v = valuesRef.current;
      const k = Math.max(1e-3, Math.min(W / ART_W, H / ART_H) * (clamp(v.scale, 50, 150) / 100));
      root.style.setProperty("--halo-x", `${W / 2 + (RING_X - ART_W / 2) * k}px`);
      root.style.setProperty("--halo-y", `${H / 2 + (RING_Y - ART_H / 2) * k}px`);
      root.style.setProperty("--halo-d", `${2 * RING_R * k}px`);
      if (!running) requestDraw();
    };

    const reduce =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ptr = { x: 0, y: 0, sx: 0, sy: 0, target: 0, over: 0, down: false, press: 0 };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      ptr.x = (e.clientX - r.left) * (r.width > 0 ? W / r.width : 1);
      ptr.y = (e.clientY - r.top) * (r.height > 0 ? H / r.height : 1);
      if (ptr.over < 0.01) {
        ptr.sx = ptr.x;
        ptr.sy = ptr.y;
      }
      ptr.target = 1;
    };
    const onLeave = () => {
      ptr.target = 0;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      ptr.down = true;
    };
    const onUp = () => {
      ptr.down = false;
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    let field: Field | null = null;
    let fieldKey = "";
    let palette: Palette | null = null;
    let paletteKey = "";
    let T = 0;
    let last = -1;
    let raf = 0;
    let running = false;
    let onScreen = false;

    const frame = (now: number) => {
      raf = running ? requestAnimationFrame(frame) : 0;
      const dt = last < 0 ? 0 : Math.min(1 / 20, Math.max(0, (now - last) / 1000));
      last = now;

      const v = valuesRef.current;
      const rg = v.ring;
      const sp = v.spray;
      const ln = v.lines;
      if (!reduce) T += dt * (clamp(v.speed, 0, 10) / 5);

      if (dt > 0) {
        const e = (tau: number) => 1 - Math.exp(-dt / tau);
        ptr.over += (ptr.target - ptr.over) * e(ptr.target > ptr.over ? 0.15 : 0.35);
        ptr.press += ((ptr.down ? 1 : 0) - ptr.press) * e(0.15);
        ptr.sx += (ptr.x - ptr.sx) * e(0.08);
        ptr.sy += (ptr.y - ptr.sy) * e(0.08);
      }

      const k = Math.max(1e-3, Math.min(W / ART_W, H / ART_H) * (clamp(v.scale, 50, 150) / 100));
      const ox = W / 2 - (ART_W / 2) * k;
      const oy = H / 2 - (ART_H / 2) * k;

      let extent = 0;
      for (const [cx, cy] of [
        [0, 0],
        [W, 0],
        [0, H],
        [W, H],
      ])
        extent = Math.max(extent, Math.hypot((cx - ox) / k - RING_X, (cy - oy) / k - RING_Y));
      extent += 260;
      const d0 = ARM_DIST[0];
      const d1 = ARM_DIST[1];
      let i0 = 0;
      while (i0 < d0.length - 1 && d0[i0] > extent) i0++;
      let i1 = d1.length - 1;
      while (i1 > 0 && d1[i1] > extent) i1--;

      const runFrom = [Math.min(ARM_FROM[0], (i0 / (d0.length - 1)) * LEFT_ARM.len), 0];
      const runTo = [LEFT_ARM.len, Math.max(ARM_TO[1], (i1 / (d1.length - 1)) * RIGHT_ARM.len)];

      const armRun = [0, 1].map((a) =>
        Math.min(4, Math.ceil(((runTo[a] - runFrom[a]) / (ARM_TO[a] - ARM_FROM[a])) * 4) / 4)
      );

      const dens = clamp(v.density, 20, 100) / 100;
      const coreShare = clamp(sp.core, 0, 100) / 100;
      const strayShare = Math.min(1 - coreShare, clamp(sp.strays, 0, 20) / 100);
      const fk = `${dens}|${coreShare}|${strayShare}|${armRun}`;
      if (!field || fk !== fieldKey) {
        field = buildField(dens, coreShare, strayShare, armRun);
        fieldKey = fk;
        const total = field.ring.length + field.veil.length + field.thread.length + field.ribbon.length;
        data = new Float32Array(total * STRIDE);
      }
      const pk = `${v.ringColor}|${v.ringEdgeColor}|${v.ribbonColor}`;
      if (!palette || pk !== paletteKey) {
        palette = buildPalette(v.ringColor, v.ringEdgeColor, v.ribbonColor);
        paletteKey = pk;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (W < 2 || H < 2) return;

      const ds = k * (clamp(v.dotSize, 50, 200) / 100);

      const pushR = (0.05 + clamp(v.reach, 0, 10) * 0.016) * 1000 * k * (1 + ptr.press);
      const pushS = clamp(v.strength, 0, 10) * 6 * k * ptr.over;
      const nW = TAU / DRIFT_SEC;

      const flip = v.mirror ? -1 : 1;
      const gc = Math.cos(clamp(v.rotation, -180, 180) * RAD);
      const gs = Math.sin(clamp(v.rotation, -180, 180) * RAD);

      let n = 0;
      const C: RGB = [0, 0, 0];
      const draw = (col: RGB, u: number, vv: number, sf: number, alpha: number) => {
        if (alpha <= 0.01) return;
        const du = (u - RING_X) * flip;
        const dv = vv - RING_Y;
        let X = ox + (RING_X + du * gc - dv * gs) * k;
        let Y = oy + (RING_Y + du * gs + dv * gc) * k;
        if (pushS > 0.01) {
          const dx = X - ptr.sx;
          const dy = Y - ptr.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < pushR * pushR && d2 > 1e-6) {
            const d = Math.sqrt(d2);
            const f = 1 - d / pushR;
            const m = (f * f * pushS) / d;
            X += dx * m;
            Y += dy * m;
          }
        }
        let size = (DOT_MIN + (DOT_MAX - DOT_MIN) * sf) * ds;
        if (size < DOT_FLOOR) {
          alpha *= size / DOT_FLOOR;
          size = DOT_FLOOR;
        }
        const h = size / 2;
        if (X < -h || Y < -h || X > W + h || Y > H + h) return;
        const o = n++ * STRIDE;
        data[o] = X * dpr;
        data[o + 1] = Y * dpr;
        data[o + 2] = size * dpr;
        data[o + 3] = col[0];
        data[o + 4] = col[1];
        data[o + 5] = col[2];
        data[o + 6] = Math.min(1, alpha);
      };
      const twinkleOf = (p: Dot) => 1 - TWINKLE * (0.5 + 0.5 * Math.sin((TAU * T) / p.tp + p.ph));

      const tilt = clamp(rg.tilt, -45, 45) * RAD;
      const tc = Math.cos(tilt);
      const ts = Math.sin(tilt);
      const squash = clamp(rg.squash, 60, 100) / 100 / RING_SQUASH;
      const I = { x: 0, y: 0 };
      const ringFit = (x: number, y: number) => {
        const a = x * tc + y * ts;
        const b = (-x * ts + y * tc) * squash;
        I.x = RING_X + a * tc - b * ts;
        I.y = RING_Y + a * ts + b * tc;
        return I;
      };

      const lc = Math.cos(clamp(ln.angle, -90, 90) * RAD);
      const ls = Math.sin(clamp(ln.angle, -90, 90) * RAD);
      const fit = (u: number, vv: number) => {
        const x = u - RING_X;
        const y = vv - RING_Y;
        return ringFit(x * lc - y * ls, x * ls + y * lc);
      };

      const sDir = sp.direction === "in" ? -1 : 1;
      const sFlow = (sDir * T * RIBBON_PX_PER_SEC * clamp(sp.flow, 0, 10)) / 5;
      const sc = Math.cos(clamp(sp.angle, -90, 90) * RAD);
      const ss = Math.sin(clamp(sp.angle, -90, 90) * RAD);
      const sWidth = clamp(sp.width, 40, 200) / 100;
      const sBreath = (clamp(sp.breath, 0, 10) / 5) * 0.08;
      const sDrift = (clamp(sp.drift, 0, 10) / 5) * DRIFT;
      for (const p of field.ribbon) {
        const left = p.arm === 0;
        const path = ARMS[p.arm];
        const a0 = runFrom[p.arm];
        const run = runTo[p.arm] - a0;

        const q = frac(p.s + (sFlow * p.v) / run);
        const arc = a0 + q * run;
        sample(path, arc / path.len);

        const s = (arc - ARM_FROM[p.arm]) / (ARM_TO[p.arm] - ARM_FROM[p.arm]);

        const w =
          sWidth *
          (left
            ? 0.8 + 0.55 * clamp(s, 0, 1) + 0.3 * clamp(-s, 0, 1)
            : 0.45 + 0.75 * smoothstep(0.12, 0.45, s) - 0.5 * smoothstep(0.78, 1, s));

        const breath = 1 + sBreath * Math.sin(TAU * (T / 7 - s));

        const riding = left ? 0 : 1 - smoothstep(0.12, 0.4, s);
        const off = p.g * w * breath * (p.g < 0 ? 1 - 0.8 * riding : 1);
        let u = SX + SNX * off;
        let vv = SY + SNY * off;
        const amp = sDrift * (1 + Math.min(1, Math.abs(p.g) / RIBBON_SIGMA));
        u += amp * Math.sin(vv * 0.013 + T * nW + p.ph);
        vv += amp * Math.cos(u * 0.011 - T * nW + p.ph);

        const ru = u - RING_X;
        const rv = vv - RING_Y;
        const dx = ru * sc - rv * ss;
        const dy = ru * ss + rv * sc;

        const ramp = left
          ? smoothstep(0, 0.04, q) * (1 - smoothstep(0.86, 1, s))
          : smoothstep(0, 0.07, s) * (1 - 0.65 * smoothstep(0.75, 1.15, s)) * (1 - smoothstep(0.96, 1, q));
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const alpha = p.a * ramp * smoothstep(RING_R - 28, RING_R - 5, dist) * twinkleOf(p);

        const join = Math.max(riding, 1 - smoothstep(RING_R - 5, RING_R + RING_JOIN, dist));

        const hold = 1 - smoothstep(RING_R + 40, RING_R + 200, dist);
        const at = ringFit(dx, dy);
        // left = raw input (gold + impurities), right = filtered output (blue)
        let base: RGB;
        if (left) {
          const h = frac(p.ph * 12.9898);
          base = h < IMPURITY_SHARE ? palette.impurity[h < IMPURITY_SHARE / 2 ? 0 : 1] : palette.ribbon[p.c];
        } else {
          base = palette.clean[p.c];
        }
        draw(
          toward(C, base, palette, tone(dy / dist), join),
          RING_X + dx + (at.x - RING_X - dx) * hold,
          RING_Y + dy + (at.y - RING_Y - dy) * hold,
          p.sf,
          alpha
        );
      }

      const lDir = ln.direction === "left" ? -1 : 1;
      const lFlow = (lDir * T * clamp(ln.flow, 0, 10)) / 5;

      const veilFlow = (lFlow * VEIL_SPEED * TAU) / RING_SPIN_SEC;
      const veilFrom = VEIL_EDGES[0][0] * RAD;
      const veilSpan = (VEIL_EDGES[VEIL_EDGES.length - 1][0] - VEIL_EDGES[0][0]) * RAD;
      const veilDepth = clamp(ln.veil, 0, 150) / 100;
      for (const p of field.veil) {
        const q = frac(p.s + (veilFlow * p.v) / veilSpan);
        const th = veilFrom + q * veilSpan;
        veilEdges(th);

        const depth = veilDepth * (p.c ? VL + (p.g - 1) * 90 : VU + (VL - VU) * p.g);
        const r = Math.max(60, RING_R - depth);
        const at = fit(RING_X + Math.cos(th) * r, RING_Y + Math.sin(th) * r);
        const ramp = p.c
          ? smoothstep(0.25, 0.4, q) * (1 - smoothstep(0.85, 1, q))
          : smoothstep(0, 0.06, q) * (1 - smoothstep(0.9, 1, q));

        const edge = p.c ? 1 : 1 - 0.7 * smoothstep(0.6, 1.1, p.g);
        draw(
          palette.inner,
          at.x + 1.2 * Math.sin(T * nW + p.ph),
          at.y + 1.2 * Math.cos(T * nW + p.ph),
          p.sf,
          p.a * edge * ramp * twinkleOf(p)
        );
      }

      const thFlow = lFlow / THREAD_FLOW_SEC;
      const pinch = THREAD_FROM + ((THREAD_TO - THREAD_FROM) * clamp(ln.pinch, 20, 80)) / 100;
      const fan = clamp(ln.fan, 0, 200) / 100;
      for (const p of field.thread) {
        const t = frac(p.s + thFlow * p.v);
        let x: number;
        let off: number;
        if (p.arm === 0) {
          x = THREAD_FROM + (THREAD_TO - THREAD_FROM) * t;
          off = p.g * (1.5 + 0.12 * threadHalf(x, pinch, fan));
        } else if (p.arm === 1) {
          x = THREAD_FROM + (pinch + 40 - THREAD_FROM) * frac(t * 1.8);
          off = p.g * threadHalf(x, pinch, fan);
        } else {
          x = pinch - 20 + (THREAD_TO - pinch + 20) * (1 - Math.pow(1 - t, 1.7));
          off = p.g * threadHalf(x, pinch, fan);
        }
        const ramp =
          smoothstep(THREAD_FROM, THREAD_FROM + 30, x) *
          (1 - smoothstep(THREAD_TO - 60, THREAD_TO, x)) *
          (p.arm === 2 ? smoothstep(pinch - 20, pinch + 10, x) : 1) *
          (p.arm === 1 ? 1 - smoothstep(pinch, pinch + 40, x) : 1);

        const swell = p.arm === 0 ? 0.2 * Math.exp(-Math.pow((x - pinch - 45) / 35, 2)) : 0;
        const at = fit(x, THREAD_Y + 20 * smoothstep(pinch, THREAD_TO, x) + off);
        draw(
          palette.inner,
          at.x + 1.5 * Math.sin(T * nW + p.ph),
          at.y + 1.5 * Math.cos(T * nW + p.ph),
          p.sf + swell,
          p.a * ramp * twinkleOf(p)
        );
      }

      const spin = ((TAU * T) / RING_SPIN_SEC) * (clamp(rg.spin, -10, 10) / 5);
      const band = clamp(rg.band, 0, 10) / 5;
      const frayAmt = (clamp(rg.fray, 0, 10) / 5) * RING_FRAY;
      const ringSquash = clamp(rg.squash, 60, 100) / 100;
      for (const p of field.ring) {
        const th = p.s + spin * p.v;
        const ex = Math.cos(th);
        const ey = Math.sin(th) * ringSquash;
        const rx = ex * tc - ey * ts;
        const ry = ex * ts + ey * tc;
        const len = Math.sqrt(rx * rx + ry * ry) || 1;
        const ux = rx / len;
        const uy = ry / len;
        const top = Math.max(0, -uy);

        const sig = band * (RING_BAND + RING_TOP_SPREAD * top * Math.sqrt(top));

        const fray = p.g < 0 ? frayAmt * smoothstep(0.85, 1, ux * 0.423 - uy * 0.906) : 0;
        const rr = RING_R * len + p.g * (sig + fray) + 1.5 * Math.sin((TAU * T) / 7 + p.ph);
        draw(toward(C, palette.top, palette, tone(uy), 1), RING_X + ux * rr, RING_Y + uy * rr, p.sf, p.a * twinkleOf(p));
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, n * STRIDE), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.POINTS, 0, n);
    };

    // one-off redraw (reduced motion, resizes while paused)
    function requestDraw() {
      if (!raf) raf = requestAnimationFrame(frame);
    }
    const update = () => {
      const want = onScreen && !document.hidden && !reduce;
      if (want && !running) {
        running = true;
        last = -1;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      } else if (!want && running) {
        running = false;
      }
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", update);

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    resize();
    requestDraw();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        background,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
      {children && <div className="halo-center">{children}</div>}
    </div>
  );
}
