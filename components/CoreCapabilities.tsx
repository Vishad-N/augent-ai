import { additionalCapabilities, coreCapabilities, coreCapabilitiesHeading } from "@/data/content";
import type { IconKind } from "./capabilities/CapabilityIcon";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";
import MagneticCapabilities from "./capabilities/MagneticCapabilities";

/** Which line icon each capability gets (keyed by its exact title). */
const ICONS: Record<string, IconKind> = {
  "Agentic Workflow Engine": "agentic",
  "Multi-Tenant Architecture": "tenant",
  "Multi-LLM Integration": "llm",
  "Modular RAG Pipelines": "rag",
  "Evaluation Module": "eval",
  "Enterprise Security": "security",
  "Observability & DevOps": "observability",
};

/**
 * Core Capabilities: section header, then magnetic cards (drift + cursor pull on desktop,
 * tap-to-expand on touch, click to lock and read). 3 / 2 / 1 columns.
 */
export default function CoreCapabilities() {
  const items = [...additionalCapabilities, ...coreCapabilities];

  return (
    <section id="core-capabilities" className="capabilities padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading
            heading={{ accent: coreCapabilitiesHeading.accent, after: ` ${coreCapabilitiesHeading.after}` }}
            subtitle={coreCapabilitiesHeading.subtitle}
          />
        </Reveal>

        <MagneticCapabilities items={items.map((c) => ({ ...c, icon: ICONS[c.title] ?? "agentic" }))} />

        <Reveal className="section-button">
          <CtaButton label="Schedule a Demo" />
        </Reveal>
      </div>
    </section>
  );
}
