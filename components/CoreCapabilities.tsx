import { additionalCapabilities, coreCapabilities, coreCapabilitiesHeading } from "@/data/content";
import type { IconKind } from "./capabilities/CapabilityIcon";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";
import CapabilityCard from "./capabilities/CapabilityCard";

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
 * Core Capabilities: section header, then a uniform grid of equal-height cards
 * (3 / 2 / 1 columns). Each card has a line icon; the text is HTML.
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

        <div className="cap-grid">
          {items.map((c, i) => (
            <Reveal key={c.title} className="cap-cell" delay={(i % 3) * 0.08}>
              <CapabilityCard title={c.title} description={c.description} icon={ICONS[c.title] ?? "agentic"} />
            </Reveal>
          ))}
        </div>

        <Reveal className="section-button">
          <CtaButton label="Schedule a Demo" />
        </Reveal>
      </div>
    </section>
  );
}
