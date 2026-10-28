import Link from "next/link";
import { nav, footer } from "@/data/content";
import { legalDocs, orgName, siteUrl, updatedIso, type LegalDoc } from "@/data/legal";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const url = `${siteUrl}/${doc.slug}`;

  // Structured data for search and answer engines: page, breadcrumb trail and FAQ.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${doc.title} | AuGENT`,
        description: doc.description,
        inLanguage: "en",
        dateModified: updatedIso,
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: doc.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: doc.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="legal-header padding-global">
        <div className="legal-header-inner">
          <Link href="/" aria-label="AuGENT home" className="legal-logo">
            <img src={nav.logoWhite} alt="AuGENT" />
          </Link>
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="legal-main padding-global">
        <article className="legal-article">
          <nav className="legal-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <span aria-hidden="true">/</span> <span>{doc.title}</span>
          </nav>
          <h1 className="legal-title">{doc.title}</h1>
          <p className="legal-updated">
            Last updated: <time dateTime={updatedIso}>{doc.updated}</time> · Published by {orgName}
          </p>
          <p className="legal-intro">{doc.intro}</p>

          <section className="legal-summary" aria-labelledby="summary">
            <h2 id="summary">Key points</h2>
            <ul>
              {doc.summary.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <nav className="legal-toc" aria-label="Contents">
            <h2>On this page</h2>
            <ol>
              {doc.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${slugify(s.heading)}`}>{s.heading}</a>
                </li>
              ))}
              <li>
                <a href="#faq">Frequently asked questions</a>
              </li>
            </ol>
          </nav>

          {doc.sections.map((s, i) => (
            <section key={s.heading} className="legal-section" aria-labelledby={slugify(s.heading)}>
              <h2 id={slugify(s.heading)}>
                {i + 1}. {s.heading}
              </h2>
              {s.paragraphs?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="legal-section legal-faq" aria-labelledby="faq">
            <h2 id="faq">Frequently asked questions</h2>
            {doc.faqs.map((f) => (
              <div key={f.q} className="legal-faq-item">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        </article>
      </main>

      <footer className="legal-footer padding-global">
        <div className="legal-footer-inner">
          <div className="footer-credit">{footer.copyright}</div>
          <nav className="footer-legal" aria-label="Legal">
            {legalDocs.map((d) => (
              <Link
                key={d.slug}
                href={`/${d.slug}`}
                aria-current={d.slug === doc.slug ? "page" : undefined}
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
