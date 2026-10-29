"use client";

import { useEffect, useRef } from "react";

/**
 * "Living Signal Field": a full-bleed, very sparse field of thin flowing lines
 * and soft nodes behind the hero, drawn on one 2D canvas.
 *
 * - Desktop: lines bow gently toward the cursor and nodes near it brighten.
 * - Touch: slow auto-drift only, at ~30fps.
 * - Reduced motion: one still frame (redrawn on resize).
 * - Pauses when off screen or the tab is hidden.
 *
 * Low opacity throughout so it never competes with the text. Sits inside
 * `.hero-bg` (pointer-events: none), so pointer input is read from `window`.
 */

const LINE_COLOR = "0, 194, 255"; // Electric Blue
const NODE_COLOR = "232, 244, 255"; // Ice
const REACH = 190; // px: cursor influence radius
const BEND = 0.32; // share of the distance a line bows toward the cursor
const NODE_COUNT = 26;

type Line = { y: number; amp: number; freq: number; phase: number; speed: number };
type Node = { x: number; y: number; r: number; ph: number };

function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed seed: same layout on every load.
const rand = rng(20260816);
const LINES: Line[] = [0.16, 0.3, 0.46, 0.6, 0.74, 0.88].map((y, i) => ({
  y,
  amp: 0.018 + rand() * 0.03,
  freq: 1.2 + rand() * 1.6,
  phase: rand() * Math.PI * 2,
  speed: (i % 2 ? 1 : -1) * (0.05 + rand() * 0.06),
}));
const NODES: Node[] = Array.from({ length: NODE_COUNT }, () => ({
  x: rand(),
  y: rand(),
  r: 1.1 + rand() * 1.3,
  ph: rand() * Math.PI * 2,
}));

export default function SignalField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const frameGap = coarse ? 1000 / 30 : 0;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      if (!running) draw(lastT);
    };

    // cursor, smoothed; `inf` eases 0..1 as the mouse enters / leaves the hero
    const ptr = { x: -9999, y: -9999, sx: -9999, sy: -9999, inside: false, inf: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      const inside = ptr.x >= 0 && ptr.y >= 0 && ptr.x <= r.width && ptr.y <= r.height;
      if (inside && !ptr.inside && ptr.inf < 0.02) {
        ptr.sx = ptr.x;
        ptr.sy = ptr.y;
      }
      ptr.inside = inside;
    };
    const onLeave = () => (ptr.inside = false);

    const nodeX = new Float32Array(NODE_COUNT);
    const nodeY = new Float32Array(NODE_COUNT);

    function draw(t: number) {
      const s = t / 1000;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      const inf = ptr.inf;
      const mx = ptr.sx;
      const my = ptr.sy;

      // ---- lines ----
      ctx!.lineWidth = 1;
      const step = 14;
      for (const L of LINES) {
        ctx!.beginPath();
        let glow = 0;
        for (let x = -step; x <= W + step; x += step) {
          let y = H * (L.y + L.amp * Math.sin((x / W) * Math.PI * 2 * L.freq + L.phase + s * L.speed));
          if (inf > 0.001) {
            const d = Math.hypot(x - mx, y - my);
            if (d < REACH) {
              const f = 1 - d / REACH;
              const k = f * f * inf;
              y += (my - y) * BEND * k;
              glow = Math.max(glow, k);
            }
          }
          if (x === -step) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${LINE_COLOR}, ${0.07 + glow * 0.16})`;
        ctx!.stroke();
      }

      // ---- nodes (tiny drift) ----
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = NODES[i];
        nodeX[i] = n.x * W + Math.sin(s * 0.18 + n.ph) * 6;
        nodeY[i] = n.y * H + Math.cos(s * 0.14 + n.ph) * 5;
      }

      // faint links to the nearest neighbour within 220px
      for (let i = 0; i < NODE_COUNT; i++) {
        let best = -1;
        let bd = 220;
        for (let j = 0; j < NODE_COUNT; j++) {
          if (j === i) continue;
          const d = Math.hypot(nodeX[i] - nodeX[j], nodeY[i] - nodeY[j]);
          if (d < bd) {
            bd = d;
            best = j;
          }
        }
        if (best < i) continue; // draw each pair once
        const near = nearness(nodeX[i], nodeY[i], mx, my, inf);
        ctx!.strokeStyle = `rgba(${LINE_COLOR}, ${0.05 + near * 0.18})`;
        ctx!.beginPath();
        ctx!.moveTo(nodeX[i], nodeY[i]);
        ctx!.lineTo(nodeX[best], nodeY[best]);
        ctx!.stroke();
      }

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = NODES[i];
        const x = nodeX[i];
        const y = nodeY[i];
        const near = nearness(x, y, mx, my, inf);
        if (near > 0.02) {
          const g = ctx!.createRadialGradient(x, y, 0, x, y, 14 + near * 10);
          g.addColorStop(0, `rgba(${LINE_COLOR}, ${0.35 * near})`);
          g.addColorStop(1, `rgba(${LINE_COLOR}, 0)`);
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(x, y, 14 + near * 10, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.fillStyle = `rgba(${NODE_COLOR}, ${0.22 + near * 0.68})`;
        ctx!.beginPath();
        ctx!.arc(x, y, n.r + near * 0.9, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function nearness(x: number, y: number, mx: number, my: number, inf: number) {
      if (inf < 0.001) return 0;
      const d = Math.hypot(x - mx, y - my);
      if (d >= REACH * 0.9) return 0;
      const f = 1 - d / (REACH * 0.9);
      return f * f * inf;
    }

    let raf = 0;
    let running = false;
    let lastT = 0;
    let lastFrame = 0;
    let onScreen = false;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (frameGap && t - lastFrame < frameGap) return;
      const dt = lastFrame ? Math.min(0.05, (t - lastFrame) / 1000) : 0;
      lastFrame = t;
      lastT = t;
      const ease = (tau: number) => 1 - Math.exp(-dt / tau);
      ptr.inf += ((ptr.inside ? 1 : 0) - ptr.inf) * ease(ptr.inside ? 0.25 : 0.6);
      ptr.sx += (ptr.x - ptr.sx) * ease(0.12);
      ptr.sy += (ptr.y - ptr.sy) * ease(0.12);
      draw(t);
    };

    const sync = () => {
      const want = onScreen && !document.hidden && !reduce;
      if (want && !running) {
        running = true;
        lastFrame = 0;
        raf = requestAnimationFrame(frame);
      } else if (!want && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw(0);
    document.addEventListener("visibilitychange", sync);
    if (!reduce && !coarse) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={`signal-field ${className}`.trim()} aria-hidden="true" />;
}
