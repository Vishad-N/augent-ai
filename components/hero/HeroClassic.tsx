"use client";

import { motion, useReducedMotion } from "framer-motion";
import { hero } from "@/data/content";
import CtaButton from "../CtaButton";

export default function HeroClassic() {
  const reduce = useReducedMotion();
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="hero" className="hero padding-global">
      <video className="hero-video" src={hero.video} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      <video className="hero-video mobile" src={hero.videoMobile} autoPlay muted loop playsInline preload="none" aria-hidden="true" />

      <div className="container">
        <div className="hero-content">
          <motion.h1 className="hero-title" {...item(0.1)}>
            {hero.title}
          </motion.h1>
          <motion.p className="hero-subtitle" {...item(0.25)}>
            {hero.subtitle}
          </motion.p>
          <motion.div className="hero-buttons" {...item(0.4)}>
            <CtaButton label={hero.primaryCta.label} href={hero.primaryCta.href} />
            <CtaButton label={hero.secondaryCta.label} href={hero.secondaryCta.href} variant="alternate" noArrow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
