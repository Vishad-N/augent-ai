import { whySection } from "@/data/content";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import WhyFocusCards from "./WhyFocusCards";
import SignalLine from "./fx/SignalLine";

export default function WhyAugent() {
  return (
    <section className="why padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={whySection.heading} subtitle={whySection.subtitle} />
        </Reveal>
        <WhyFocusCards />
      </div>
      <div className="pink-blur" aria-hidden="true" />
    </section>
  );
}
