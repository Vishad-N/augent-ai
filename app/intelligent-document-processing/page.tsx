import type { Metadata } from "next";
import Header from "@/components/Header";
import UseCases from "@/components/UseCases";
import LogoMarquee from "@/components/LogoMarquee";
import CTAForm from "@/components/CTAForm";
import Footer from "@/components/Footer";
import { IdpHero, IdpImpact, IdpMarket, IdpSteps } from "@/components/idp/IdpSections";
import { idpCta, idpMeta, idpNav } from "@/data/idp";
import { siteUrl } from "@/data/legal";
import "./idp.css";

export const metadata: Metadata = {
  title: idpMeta.title,
  description: idpMeta.description,
  alternates: { canonical: idpMeta.path },
  openGraph: {
    title: idpMeta.title,
    description: idpMeta.description,
    type: "website",
    siteName: "AuGENT",
    url: `${siteUrl}${idpMeta.path}`,
  },
  twitter: { card: "summary_large_image", title: idpMeta.title, description: idpMeta.description },
};

const url = `${siteUrl}${idpMeta.path}`;

// Structured data: page + breadcrumb, linked to the site-wide Organization/WebSite in layout.tsx.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: idpMeta.title,
      description: idpMeta.description,
      inLanguage: "en",
      dateModified: idpMeta.updatedIso,
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Intelligent Document Processing", item: url },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header links={idpNav.links} cta={idpNav.cta} logoHref="/" solid />
      <main>
        <IdpHero />
        <IdpSteps />
        <IdpImpact />
        <UseCases id="frameworks" />
        <LogoMarquee />
        <IdpMarket />
        <CTAForm copy={idpCta} />
      </main>
      <Footer />
    </>
  );
}
