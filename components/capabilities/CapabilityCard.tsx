"use client";

import { useRef, useState } from "react";
import type { IconKind } from "@/lib/iconStage";
import CapabilityIcon from "./CapabilityIcon";

type Props = { title: string; description: string; icon: IconKind };

/**
 * Card: 3D icon on top, then title and description as plain HTML.
 * Mouse hover (or a tap on touch, held ~1.4s) wakes the icon up: it spins
 * faster, tilts toward you and glows gold.
 */
export default function CapabilityCard({ title, description, icon }: Props) {
  const [hovered, setHovered] = useState(false);
  const tapTimer = useRef<number>(0);

  return (
    <article
      className={`cap-tile ${hovered ? "is-hovered" : ""}`}
      data-ack
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        setHovered(true);
        window.clearTimeout(tapTimer.current);
        tapTimer.current = window.setTimeout(() => setHovered(false), 1400);
      }}
    >
      <CapabilityIcon kind={icon} hovered={hovered} />
      <h3 className="cap-title">{title}</h3>
      <p className="cap-desc">{description}</p>
    </article>
  );
}
