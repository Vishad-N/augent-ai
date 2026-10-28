import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { termsOfService as doc } from "@/data/legal";

export const metadata: Metadata = {
  title: `${doc.title} | AuGENT`,
  description: doc.description,
  alternates: { canonical: "/terms-of-service" },
  openGraph: { title: `${doc.title} | AuGENT`, description: doc.description, type: "website" },
};

export default function Page() {
  return <LegalPage doc={doc} />;
}
