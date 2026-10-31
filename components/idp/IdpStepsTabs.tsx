"use client";

import { useState } from "react";
import { idpSteps } from "@/data/idp";
import Lottie from "../Lottie";

// Step animations exported from the live page (public/assets/idp), in step order.
const STEP_LOTTIES = [1, 2, 3, 4, 5].map((n) => `/assets/idp/step${n}.lottie`);

/**
 * "How it works": the live page's tab layout. Animation for the selected step on
 * the left, the five steps on the right with the active one expanded.
 */
export default function IdpStepsTabs() {
  const [active, setActive] = useState(0);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = idpSteps.items.length;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (active + 1) % n
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (active - 1 + n) % n
          : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`idp-step-tab-${next}`)?.focus();
  };

  return (
    <div className="idp-tabs">
      <div className="idp-tabs-art" id="idp-step-panel" role="tabpanel" aria-labelledby={`idp-step-tab-${active}`}>
        <Lottie key={STEP_LOTTIES[active]} src={STEP_LOTTIES[active]} className="idp-tabs-lottie" />
      </div>

      <div className="idp-tabs-list" role="tablist" aria-orientation="vertical" onKeyDown={onKeyDown}>
        {idpSteps.items.map((s, i) => {
          const on = active === i;
          return (
            <div key={s.title} className={`idp-tab ${on ? "is-active" : ""}`}>
              <button
                type="button"
                role="tab"
                id={`idp-step-tab-${i}`}
                aria-selected={on}
                aria-controls="idp-step-panel"
                tabIndex={on ? 0 : -1}
                className="idp-tab-head"
                onClick={() => setActive(i)}
              >
                <span className="idp-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="idp-step-title">{s.title}</span>
              </button>
              {on && (
                <div className="idp-tab-body">
                  {s.paragraphs.map((p) => (
                    <p key={p} className="idp-step-text">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
