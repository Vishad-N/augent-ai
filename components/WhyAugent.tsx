import { whyAugent, whySection } from "@/data/content";
import { whySvgs } from "@/data/svgs";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import SignalLine from "./fx/SignalLine";

export default function WhyAugent() {
  return (
    <section className="why padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={whySection.heading} subtitle={whySection.subtitle} />
        </Reveal>
        <div className="why-list">
          {whyAugent.map((text, i) => (
            <Reveal key={text} delay={i * 0.1} className="why-card" ack touch>
              {/* Icons are the live site's inline SVGs; they inherit the card's hover colour. */}
              <span className="why-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: whySvgs[i] ?? "" }} />
              <h3>{text}</h3>
            </Reveal>
          ))}
        </div>
      </div>
      <div className="pink-blur" aria-hidden="true" />
    </section>
  );
}
