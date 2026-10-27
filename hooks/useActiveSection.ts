"use client";

import { useEffect, useState } from "react";

/**
 * Id of the section currently crossing the middle band of the viewport, or null.
 * IntersectionObserver only: no scroll listener, no per-frame work.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // keep document order so the earliest visible section wins
        const first = els.find((el) => visible.has(el.id));
        setActive(first ? first.id : null);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
