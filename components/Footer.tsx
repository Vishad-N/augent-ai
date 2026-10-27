import { footer } from "@/data/content";
import SwapWordmark from "./fx/SwapWordmark";
import HaloSpray from "./fx/HaloSpray";
import LayeredSocials from "./fx/LayeredSocials";

export default function Footer() {
  return (
    <footer className="footer">
      {/* full-width particle halo with the logo sitting inside the ring */}
      <HaloSpray className="footer-halo" scale={150}>
        <a href="#hero" className="footer-halo-logo" aria-label="AuGENT, back to top">
          {/* the logo, split so GENT can run a continuous letter swap */}
          <SwapWordmark color="#ffffff" />
        </a>
      </HaloSpray>

      <div className="padding-global">
        <div className="container">
          <div className="footer-bottom">
            <div className="footer-credit">{footer.copyright}</div>
            <LayeredSocials className="footer-socials" />
            <div className="footer-legal">
              {footer.legal.map((l) => (
                <a key={l} href="#">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
