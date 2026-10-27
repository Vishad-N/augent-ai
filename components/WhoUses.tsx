"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { whoUses, whoUsesSection } from "@/data/content";
import { ParticleAssembler } from "@/lib/particleText";
import { Title } from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";

type Item = (typeof whoUses)[number];

/**
 * "Who Uses" cards. On hover / focus / tap, an Electric Blue frame settles
 * inside the card while the icon + role dissolve into a few thousand particles
 * that stream across and assemble the full role + description at once. The
 * real text then fades in under them. Card size, icon and copy are unchanged.
 */
export default function WhoUses() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="who padding-global section-small">
      <div className="container">
        <SignalLine />
        <Reveal className="heading">
          <Title heading={whoUsesSection.heading} />
        </Reveal>

        <div className="who-grid">
          {whoUses.map((w, i) => (
            <Reveal key={w.role} delay={(i % 4) * 0.08}>
              <WhoCard item={w} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            </Reveal>
          ))}
        </div>

        <Reveal className="who-footer">
          <p>{whoUsesSection.footer}</p>
          <CtaButton label="Schedule a Demo" />
        </Reveal>
      </div>
    </section>
  );
}

function WhoCard({ item, open, onToggle }: { item: Item; open: boolean; onToggle: () => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ParticleAssembler | null>(null);
  const pointer = useRef("mouse");
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [textOn, setTextOn] = useState(false);
  const active = hover || focus || open;

  useEffect(() => {
    const e = new ParticleAssembler(cardRef.current!, canvasRef.current!, () => setTextOn(true));
    engine.current = e;
    return () => e.destroy();
  }, []);

  useEffect(() => {
    if (reduce) {
      setTextOn(active);
      return;
    }
    if (active) {
      engine.current?.assemble();
    } else {
      setTextOn(false);
      engine.current?.scatter();
    }
  }, [active, reduce]);

  return (
    <button
      ref={cardRef}
      type="button"
      data-ack
      className={`who-card${active ? " is-active" : ""}${textOn ? " text-on" : ""}`}
      aria-label={`${item.role}: ${item.description}`}
      aria-pressed={open}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && setFocus(true)}
      onBlur={() => setFocus(false)}
      onClick={() => {
        // mouse users get hover; taps and keyboard toggle the card open
        if (pointer.current !== "mouse") onToggle();
        pointer.current = "";
      }}
    >
      <img src={whoUsesSection.glow} alt="" className="value-glow" loading="lazy" />
      {/* resting face: icon + role */}
      <span className="who-face who-front">
        <img src={item.icon} alt="" className="user-icon" loading="lazy" />
        <span className="role">{item.role}</span>
      </span>
      {/* revealed face: role + description (assembled by the particles) */}
      <span className="who-face who-reveal">
        <span className="who-reveal-role">{item.role}</span>
        <span className="who-desc">{item.description}</span>
      </span>
      <canvas ref={canvasRef} className="who-particles" aria-hidden="true" />
      <span className="who-border" aria-hidden="true" />
    </button>
  );
}
