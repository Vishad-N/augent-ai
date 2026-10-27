/**
 * Toggles for the "Living Signal Field" hero. Flip any of these to false to
 * switch that behaviour off without touching the components; each one also
 * has its own reduced-motion fallback.
 */
export const HERO_FX = {
  /** Interactive canvas field of lines + nodes behind the hero. */
  signalField: true,
  /** Headline lines rise in one by one (mask + spring); subtitle follows. */
  headlineStagger: true,
  /** Gold "Au" pulse in the header logo when the last headline line lands. */
  auPulse: true,
  /** Slow idle float of the plane stack. */
  stackFloat: true,
  /** Stack shifts slightly with the cursor (mouse only). */
  stackParallax: true,
  /** Primary CTA glow flares once on the first mouse move inside the hero. */
  ctaGlow: true,
} as const;

/** Window event the header listens for to pulse the "Au" mark. */
export const AU_PULSE_EVENT = "augent:au-pulse";
