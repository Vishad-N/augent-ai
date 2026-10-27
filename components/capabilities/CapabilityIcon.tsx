"use client";

import { useEffect, useRef } from "react";
import type { IconHandle, IconKind } from "@/lib/iconStage";

const PX = 72; // keep in sync with ICON_PX in lib/iconStage.ts

/**
 * One small 3D icon. Owns a plain 2D canvas; the shared Three.js stage draws
 * into it. Three.js is fetched (dynamic import) only when the first icon gets
 * within 200px of the viewport, and each icon stops drawing when off screen.
 */
export default function CapabilityIcon({ kind, hovered }: { kind: IconKind; hovered: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<IconHandle | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(PX * dpr);

    let cancelled = false;
    let loading = false;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !handle.current && !loading) {
          loading = true;
          const { registerIcon } = await import("@/lib/iconStage");
          if (cancelled) return;
          handle.current = registerIcon(kind, canvas);
        }
        handle.current?.setVisible(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );
    io.observe(canvas);

    return () => {
      cancelled = true;
      io.disconnect();
      handle.current?.dispose();
      handle.current = null;
    };
  }, [kind]);

  useEffect(() => {
    handle.current?.setHover(hovered);
  }, [hovered]);

  return (
    <span className="cap-icon" aria-hidden="true">
      <canvas ref={ref} width={PX} height={PX} />
    </span>
  );
}
