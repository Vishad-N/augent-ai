import type { Metadata } from "next";
import Link from "next/link";
import { nav } from "@/data/content";
import { legalDocs } from "@/data/legal";

// Served with a real 404 status. noindex keeps dead URLs out of search results.
export const metadata: Metadata = {
  title: "Page not found | AuGENT",
  description: "The page you are looking for does not exist or has moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <header className="legal-header padding-global">
        <div className="legal-header-inner">
          <Link href="/" aria-label="AuGENT home" className="legal-logo">
            <img src={nav.logoWhite} alt="AuGENT" width={120} height={28} />
          </Link>
        </div>
      </header>
      <main className="legal-main padding-global">
        <div className="legal-article">
          <p className="legal-updated">Error 404</p>
          <h1 className="legal-title">Page not found</h1>
          <p className="legal-intro">
            The page you are looking for does not exist or has moved. Head back to the home page or try one of these:
          </p>
          <ul className="legal-section">
            <li>
              <Link href="/">Home</Link>
            </li>
            {legalDocs.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}`}>{d.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
