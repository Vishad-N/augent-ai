"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { nav } from "@/data/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import CtaButton from "./CtaButton";
import { AU_PULSE_EVENT } from "@/lib/heroFx";

type HeaderProps = {
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
  /** Where the logo goes: "#hero" on the home page, "/" on sub-pages. */
  logoHref?: string;
  /** Always render the light header (for pages that open on a light hero). */
  solid?: boolean;
};

export default function Header({ links: navLinks = nav.links, cta = nav.cta, logoHref = "#hero", solid = false }: HeaderProps = {}) {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(navLinks.map((l) => l.href.slice(1)));

  // Motion's scroll value instead of a window scroll listener; only flips state
  // when the 40px threshold is actually crossed.
  const { scrollY } = useScroll();
  const scrolledRef = useRef(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 40;
    if (next !== scrolledRef.current) {
      scrolledRef.current = next;
      setScrolled(next);
    }
  });
  useEffect(() => {
    const next = window.scrollY > 40;
    scrolledRef.current = next;
    setScrolled(next);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // One soft gold pulse on the "Au" mark when the hero headline finishes landing.
  const [auPulse, setAuPulse] = useState(false);
  useEffect(() => {
    let t = 0;
    const fire = () => {
      setAuPulse(true);
      t = window.setTimeout(() => setAuPulse(false), 1400);
    };
    window.addEventListener(AU_PULSE_EVENT, fire);
    return () => {
      window.removeEventListener(AU_PULSE_EVENT, fire);
      window.clearTimeout(t);
    };
  }, []);

  const close = () => setOpen(false);

  const links = (layoutId: string, onClick?: () => void) =>
    navLinks.map((l) => {
      const isActive = active === l.href.slice(1);
      return (
        <a
          key={l.href}
          href={l.href}
          className={`nav-link ${isActive ? "is-active" : ""}`}
          aria-current={isActive ? "location" : undefined}
          onClick={onClick}
        >
          {l.label}
          {isActive && (
            <m.span
              layoutId={layoutId}
              className="nav-indicator"
              aria-hidden="true"
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
        </a>
      );
    });

  return (
    <>
      <header className={`header padding-global ${scrolled || solid ? "scrolled" : ""} ${open ? "menu-open" : ""}`}>
        <div className="header-inner">
          <a href={logoHref} className={`header-logo${auPulse ? " au-pulsing" : ""}`} aria-label="AuGENT home" onClick={close}>
            <img src={nav.logoWhite} alt="AuGENT" className="logo-white" />
            <img src={nav.logoDark} alt="" aria-hidden="true" className="logo-dark" />
            <span className="au-pulse" aria-hidden="true" />
          </a>

          <nav className="nav" aria-label="Primary">
            {links("nav-indicator")}
          </nav>

          <div className="header-cta">
            <CtaButton label={cta.label} href={cta.href} />
          </div>

          <button
            type="button"
            className="menu-button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {links("nav-indicator-mobile", close)}
            <CtaButton label={cta.label} href={cta.href} onClick={close} />
          </m.nav>
        )}
      </AnimatePresence>
    </>
  );
}
