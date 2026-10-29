import { philosophy, philosophySection } from "@/data/content";
import { Title } from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";

export default function Philosophy() {
  return (
    <section id="philosophy" className="philosophy padding-global section-small">
      <div className="container">
        <SignalLine />
        <Reveal className="heading">
          <Title heading={philosophySection.heading} />
        </Reveal>

        <Reveal>
          <img src={philosophySection.logo} alt="AuGENT: Guided, Evolution, Neural, Transformation" className="philosophy-logo" width={831} height={179} loading="lazy" decoding="async" />
        </Reveal>

        <Reveal className="philosophy-grid">
          <div className="philosophy-left">
            {philosophy.map((line) => (
              <p key={line}>
                <strong>{line.charAt(0)}</strong>
                {line.slice(1)}
              </p>
            ))}
          </div>
          <div className="philosophy-right">
            <p className="philosophy-tagline">{philosophySection.tagline}</p>
            <div>
              <CtaButton label="Schedule a Demo" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
