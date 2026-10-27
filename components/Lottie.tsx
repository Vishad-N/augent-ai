"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Props = {
  src: string;
  className?: string;
  loop?: boolean;
};

/**
 * Plays a .lottie file (the same files the live site uses), but only once it
 * scrolls near the viewport so the page doesn't decode a dozen animations up front.
 */
export default function Lottie({ src, className, loop = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lottie ${className ?? ""}`.trim()}>
      {visible && (
        <DotLottieReact src={src} loop={loop} autoplay style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}
