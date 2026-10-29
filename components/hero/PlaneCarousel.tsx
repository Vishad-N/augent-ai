"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { planes } from "@/data/content";
import CtaButton from "../CtaButton";
import PlaneGlyph from "./PlaneGlyph";

type Props = {
  onEngage: () => void;
  onExplore: (index: number) => void;
};

/**
 * Mobile version of the plane stack: a native scroll-snap carousel (no JS
 * dragging, so swipes stay on the compositor). Tap a card to expand it and
 * reveal the description plus an Explore button.
 */
export default function PlaneCarousel({ onEngage, onExplore }: Props) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [visible, setVisible] = useState(0);

  // Which card is centred, for the progress segments.
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setVisible(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root, threshold: 0.6 }
    );
    root.querySelectorAll("[data-index]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) => {
    onEngage();
    setOpen((cur) => (cur === i ? null : i));
  };

  return (
    <div className="plane-carousel-wrap">
      <div
        ref={track}
        className="plane-carousel"
        role="list"
        aria-label="AuGENT planes"
        onScroll={onEngage}
      >
        {planes.map((p, i) => {
          const isOpen = open === i;
          return (
            <div key={p.id} role="listitem" data-index={i} className={`plane-card ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                data-ack
                className="plane-card-head"
                aria-expanded={isOpen}
                aria-controls={`plane-card-body-${p.id}`}
                onClick={() => toggle(i)}
              >
                <span className="plane-glyph">
                  <PlaneGlyph index={i} />
                </span>
                <span className="plane-card-text">
                  <span className="plane-card-title">{p.title}</span>
                  <span className="plane-card-tag">{p.tag}</span>
                </span>
                <CaretDown className="plane-card-caret" size={20} weight="bold" aria-hidden="true" />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    id={`plane-card-body-${p.id}`}
                    className="plane-card-body"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="plane-card-inner">
                      <p>{p.description}</p>
                      <CtaButton
                        label="Explore"
                        href="#structured-system"
                        variant="alternate"
                        onClick={(e) => {
                          e.preventDefault();
                          onExplore(i);
                        }}
                      />
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="carousel-progress" aria-hidden="true">
        {planes.map((p, i) => (
          <span key={p.id} className={visible === i ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}
