import { idpHero, idpImpact, idpMarket, idpSteps } from "@/data/idp";
import CtaButton from "../CtaButton";
import Reveal from "../Reveal";
import SectionHeading, { Title } from "../SectionHeading";
import SignalLine from "../fx/SignalLine";
import Lottie from "../Lottie";
import IdpStepsTabs from "./IdpStepsTabs";

// Streamed from the live site's video host, like the home hero (see data/content.ts).
const HERO_BG_VIDEO = "https://video.wixstatic.com/video/53d759_79c460fb782e455a867934ee2f9a9e5d/1080p/mp4/file.mp4";

export function IdpHero() {
  return (
    <>
      <section id="hero" className="idp-top padding-global">
        <video className="idp-top-video" src={HERO_BG_VIDEO} autoPlay muted loop playsInline preload="none" aria-hidden="true" />
        <div className="container">
          <Reveal>
            <h1 className="idp-page-title">Intelligent Document Processing</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <Lottie src="/assets/idp/hero-v5.lottie" className="idp-hero-lottie" />
          </Reveal>
        </div>
      </section>

      <section className="idp-intro padding-global">
        <div className="container idp-intro-grid">
          <Reveal className="idp-intro-art">
            <img src="/assets/idp/about-us.svg" alt="" loading="lazy" className="idp-image" />
          </Reveal>
          <Reveal delay={0.1} className="idp-hero-copy">
            <p className="idp-eyebrow">{idpHero.eyebrow}</p>
            <h2 className="idp-hero-title">{idpHero.title}</h2>
            {idpHero.paragraphs.map((p) => (
              <p key={p} className="idp-hero-text">
                {p}
              </p>
            ))}
            <div className="hero-buttons idp-hero-buttons">
              <CtaButton label={idpHero.cta.label} href={idpHero.cta.href} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function IdpSteps() {
  return (
    <section id="steps" className="padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={idpSteps.heading} subtitle={idpSteps.subtitle} half />
        </Reveal>
        <Reveal>
          <IdpStepsTabs />
        </Reveal>
      </div>
    </section>
  );
}

export function IdpImpact() {
  const { stats, without, with: withIdp } = idpImpact;
  return (
    <section id="impact" className="idp-impact padding-global section-medium">
      <div className="container">
        <SignalLine onDark />
        <Reveal>
          <div className="heading">
            <Title heading={idpImpact.heading} light gold />
          </div>
        </Reveal>
        <Reveal>
          <ul className="idp-stats">
            {stats.map((s) => (
              <li key={s.label} className="idp-stat">
                <span className="idp-stat-value">{s.value}</span>
                <span className="idp-stat-label">{s.label}</span>
              </li>
            ))}
          </ul>
          <p className="idp-deployed">{idpImpact.deployed}</p>
        </Reveal>

        <Reveal>
          <div className="heading idp-qual-heading">
            <Title heading={idpImpact.qualitativeHeading} light gold />
          </div>
        </Reveal>
        <div className="idp-compare">
          {[without, withIdp].map((col, i) => (
            <Reveal key={col.title} delay={0.1 * i} className={`idp-compare-col ${i ? "with" : "without"}`}>
              <h3 className="idp-compare-title">{col.title}</h3>
              <ul>
                {col.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IdpMarket() {
  return (
    <section id="market" className="padding-global section-medium">
      <div className="container">
        <SignalLine />
        <Reveal>
          <SectionHeading heading={idpMarket.heading} subtitle={idpMarket.subtitle} half />
        </Reveal>
        <ul className="idp-market">
          {idpMarket.points.map((p, i) => (
            <Reveal as="li" key={p} className="idp-market-card" delay={0.05 * i}>
              {p}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
