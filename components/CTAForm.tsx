"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ctaFields, ctaPoints, ctaSection } from "@/data/content";
import Reveal from "./Reveal";
import SignalLine from "./fx/SignalLine";

type Status = "idle" | "sending" | "sent" | "error";

// Full Formspree (or Getform) endpoint URL, e.g. https://formspree.io/f/xxxxxxxx.
// Set NEXT_PUBLIC_FORMSPREE_ENDPOINT in .env.local (see .env.example).
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

/**
 * Demo request form. Submissions are validated client-side, then POSTed as
 * JSON to the endpoint in NEXT_PUBLIC_FORMSPREE_ENDPOINT, which stores the lead
 * and sends the email notification.
 */
export default function CTAForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Scroll-driven 3D entrance: the card starts tipped back into the screen
  // (hinged on its bottom edge) and stands up flat as it scrolls into view.
  // Fully flat once its top reaches ~30% of the viewport, so scrolling past
  // it afterwards is completely normal. Reduced motion: always flat.
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "start 30%"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [34, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const y = useTransform(p, [0, 1], [60, 0]);
  const opacity = useTransform(p, [0, 0.5, 1], [0.55, 0.9, 1]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setError("");
    setStatus("sending");
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (!FORM_ENDPOINT) throw new Error("NEXT_PUBLIC_FORMSPREE_ENDPOINT is not set");
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Form submission failed (${res.status})`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <section id="cta" className="cta-section padding-global">
      <div className="container cta-stage">
        <m.div
          ref={cardRef}
          className="cta-card"
          style={reduce ? undefined : { rotateX, scale, y, opacity, transformOrigin: "50% 100%" }}
        >
          <Reveal className="cta-left">
            <SignalLine onDark />
            <h2 className="cta-heading">{ctaSection.heading}</h2>
            <ul className="cta-bullets" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {ctaPoints.map((p) => (
                <li key={p} className="cta-bullet">
                  <img src={ctaSection.tick} alt="" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="form-block" y={24}>
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <m.div
                  key="sent"
                  className="form-success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="status"
                >
                  <h3 style={{ fontSize: "1.75rem", fontWeight: 400 }}>Thank you!</h3>
                  <p>Your submission has been received.</p>
                  <div>
                    <button type="button" className="submit-btn" onClick={() => setStatus("idle")}>
                      Send another
                    </button>
                  </div>
                </m.div>
              ) : (
                <m.form key="form" className="cta-form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
                  <div className="form-col">
                    {ctaFields.left.map((f) => (
                      <input
                        key={f.name}
                        className="text-field"
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        aria-label={f.placeholder.replace("*", "")}
                        required={f.required}
                        maxLength={256}
                        autoComplete={f.name === "email" ? "email" : f.name === "name" ? "name" : f.name === "mobile" ? "tel" : undefined}
                      />
                    ))}
                  </div>
                  <div className="form-col">
                    {ctaFields.right.map((f) => (
                      <input
                        key={f.name}
                        className="text-field"
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        aria-label={f.placeholder.replace("*", "")}
                        required={f.required}
                        maxLength={256}
                        autoComplete={f.name === "company" ? "organization" : f.name === "jobTitle" ? "organization-title" : undefined}
                      />
                    ))}
                    <textarea
                      className="text-field"
                      name={ctaFields.message.name}
                      placeholder={ctaFields.message.placeholder}
                      aria-label={ctaFields.message.placeholder}
                      maxLength={5000}
                    />
                  </div>
                  <div className="form-full">
                    <label className="form-checkbox">
                      <input type="checkbox" name="consent" required />
                      <span>
                        I have read and agree to the{" "}
                        <a href={ctaSection.privacyHref} target="_blank" rel="noreferrer">
                          Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a href={ctaSection.termsHref} target="_blank" rel="noreferrer">
                          Terms &amp; Conditions.
                        </a>
                      </span>
                    </label>
                    <button type="submit" className="submit-btn" disabled={status === "sending"}>
                      {status === "sending" ? "Please wait..." : ctaSection.submitLabel}
                    </button>
                    {error && <p className="form-message error" role="alert">{error}</p>}
                  </div>
                </m.form>
              )}
            </AnimatePresence>
          </Reveal>
        </m.div>
      </div>
    </section>
  );
}
