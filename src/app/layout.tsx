import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DZFlow — Gestion simple pour entreprises algériennes",
  description:
    "Facturation conforme DGI, CRM, stocks, dashboard. Hébergé en Algérie, conforme loi 18-07. Essai gratuit sans carte bancaire.",
  keywords: [
    "facturation Algérie",
    "logiciel gestion PME Algérie",
    "conformité DGI",
    "devis facture Algérie",
    "auto-entrepreneur Algérie",
  ],
  authors: [{ name: "DZFlow" }],
  creator: "DZFlow",
  publisher: "DZFlow",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    url: "https://dzflow.vercel.app",
    siteName: "DZFlow",
    title: "DZFlow — Votre entreprise dans une seule app",
    description:
      "Facturation conforme DGI, CRM, stocks, dashboard. Hébergé en Algérie.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "DZFlow Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZFlow",
    description: "Gestion simple pour entreprises algériennes",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-surface-muted dark:bg-surface-dark antialiased">
        {children}
      </body>
    </html>
  );
}