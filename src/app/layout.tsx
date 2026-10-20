import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Poetry Slam (28 Ottobre) & Streaming Live — Gelatina",
  description:
    "Gelatina torna mercoledì 28 Ottobre da Bacco e Venere a Latina (ore 19:30). Sali sul palco con l'Open Mic o segui la diretta Streaming Live con voto da casa!",
  openGraph: {
    title: "Poetry Slam (28 Ottobre) & Streaming Live — Gelatina",
    description: "Gelatina torna mercoledì 28 Ottobre da Bacco e Venere a Latina (ore 19:30). Sali sul palco con l'Open Mic o segui la diretta Streaming Live con voto da casa!",
    url: "https://www.collettivogelatina.it",
    siteName: "Gelatina Poetry Slam",
    images: [
      {
        url: "https://www.collettivogelatina.it/og-microphone.jpg",
        width: 1200,
        height: 675,
        alt: "Microfono e Bocca Poetry Slam Gelatina",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poetry Slam (28 Ottobre) & Streaming Live — Gelatina",
    description: "Gelatina torna mercoledì 28 Ottobre da Bacco e Venere a Latina (ore 19:30). Sali sul palco con l'Open Mic o segui la diretta Streaming Live con voto da casa!",
    images: ["https://www.collettivogelatina.it/og-microphone.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Space+Mono:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://w.behold.so/widget.js" type="module" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
