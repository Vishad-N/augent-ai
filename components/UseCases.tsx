"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCases, useCasesSection } from "@/data/content";
import { Title } from "./SectionHeading";
import Reveal from "./Reveal";
import SignalLine from "./fx/SignalLine";
import SectorRipple from "./fx/SectorRipple";

export default function UseCases() {
  const [active, setActive] = useState(0);
  const uc = useCases[active];

  return (
    <section id="use-cases" className="padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal className="usecases-heading">
          <Title heading={useCasesSection.heading} />
          <p className="heading-paragraph">{useCasesSection.subtitle}</p>
        </Reveal>

        <Reveal>
          <div className="industry-tabs" role="tablist" aria-label="Industries">
            {useCases.map((u, i) => (
              <button
                key={u.industry}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls="usecase-panel"
                data-ack
                className={`industry-tab ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
              >
                {u.industry}
              </button>
            ))}
          </div>
        </Reveal>

        <div id="usecase-panel" role="tabpanel" aria-label={uc.industry} className="usecase-panel">
          {/* stays mounted: the icon cross-fades and the rings pulse on every switch */}
          <SectorRipple icon={uc.icon} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={uc.industry}
              className="sector-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="sector-heading">{uc.industry}</h3>
              <div>
                <span className="sector-label">Business Outcomes</span>
                <p className="sector-text">{uc.outcomes}</p>
              </div>
              <div>
                <span className="sector-label">Document Type</span>
                <p className="sector-text">{uc.documentTypes}</p>
              </div>
              <p className="sector-text">{uc.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
