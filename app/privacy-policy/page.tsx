import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { privacyPolicy as doc } from "@/data/legal";

export const metadata: Metadata = {
  title: `${doc.title} | AuGENT`,
  description: doc.description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: `${doc.title} | AuGENT`, description: doc.description, type: "website" },
};

export default function Page() {
  return <LegalPage doc={doc} />;
}
