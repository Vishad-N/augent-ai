import { trusted } from "@/data/content";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import SignalLine from "./fx/SignalLine";

export default function LogoMarquee() {
  // Two copies back-to-back so the -50% translate loops seamlessly.
  const loop = [...trusted.logos, ...trusted.logos];
  return (
    <section className="logos padding-global section-small">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={trusted.heading} subtitle={trusted.subtitle} />
        </Reveal>
        <Reveal className="logos-mask">
          <div className="logos-track">
            {loop.map((l, i) => (
              <div className="logo-item" key={`${l.name}-${i}`} aria-hidden={i >= trusted.logos.length}>
                <img src={l.src} alt={i < trusted.logos.length ? l.name : ""} loading="lazy" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
