import { problemSection, problems } from "@/data/content";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import CtaButton from "./CtaButton";
import SignalLine from "./fx/SignalLine";

export default function ProblemSection() {
  return (
    <section className="problems padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={problemSection.heading} subtitle={problemSection.subtitle} half />
        </Reveal>

        <div className="problem-grid">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="problem-card" ack touch>
              <img src={p.image} alt="" className="problem-image" loading="lazy" />
              <div className="problem-content">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
              <div className="risk-bg" aria-hidden="true" />
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
