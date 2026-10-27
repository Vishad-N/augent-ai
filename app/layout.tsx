import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { meta } from "@/data/content";
import "./globals.css";
import "./living.css";
import AckLayer from "@/components/fx/AckLayer";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  icons: { icon: "/assets/favicon.png", apple: "/assets/webclip.png" },
  openGraph: { title: meta.title, description: meta.description, type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable}>
      <body>
        {children}
        <AckLayer />
      </body>
    </html>
  );
}
