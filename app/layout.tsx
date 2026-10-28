import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { meta, footer } from "@/data/content";
import { siteUrl, orgName } from "@/data/legal";
import "./globals.css";
import "./living.css";
import "./theme.css";
import AckLayer from "@/components/fx/AckLayer";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  // "optional": a late font never swaps in mid-load, so the headline cannot reflow (CLS).
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  icons: { icon: "/assets/favicon.png", apple: "/assets/webclip.png" },
  openGraph: { title: meta.title, description: meta.description, type: "website", siteName: "AuGENT", url: siteUrl },
  twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
};

// Site-wide entities, referenced by id from each page's own structured data.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: orgName,
      alternateName: "AuGENT",
      url: siteUrl,
      logo: `${siteUrl}/assets/logo-dark.svg`,
      description: meta.description,
      sameAs: footer.social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "AuGENT",
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E0E10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
        <AckLayer />
      </body>
    </html>
  );
}
