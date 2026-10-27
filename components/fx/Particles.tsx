"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Particle count on desktop. Kept deliberately sparse. */
  count?: number;
  /** Particle count on phones / coarse pointers. */
  mobileCount?: number;
  className?: string;
};

/**
 * Sparse drifting Electric Blue specks on a single canvas. Runs only while the canvas is
 * on screen AND the tab is visible, at ~45fps desktop / ~24fps mobile, with the
 * device pixel ratio capped at 1.5. Reduced motion draws one static frame.
 */
export default function Particles({ count = 22, mobileCount = 8, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const n = small ? mobileCount : count;
    const frameMs = 1000 / (small ? 24 : 45);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const pts = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.000012,
      vy: -0.000006 - Math.random() * 0.000012, // slow upward drift
      r: 0.6 + Math.random() * 1.1,
      a: 0.18 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;
    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (dt) {
          p.x = (p.x + p.vx * dt + 1) % 1;
          p.y = (p.y + p.vy * dt + 1) % 1;
          p.phase += dt * 0.0011;
        }
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.fillStyle = `rgba(245, 188, 39,${alpha.toFixed(3)})`; // Electric Blue specks
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    let raf = 0;
    let last = 0;
    let running = false;
    let inView = false;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = t - last;
      if (dt < frameMs) return;
      last = t;
      draw(Math.min(dt, 100));
    };

    const sync = () => {
      const should = inView && !document.hidden && !reduce;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);
    io.observe(canvas);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [count, mobileCount]);

  return <canvas ref={ref} className={`particles ${className ?? ""}`.trim()} aria-hidden="true" />;
}
