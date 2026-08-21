import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Iscriviti allo Slam del 3 Settembre come poeta o pubblico",
  description:
    "Gelatina torna sul palco. Sali a leggere le tue poesie, prova l'Open Mic o goditi la serata come pubblico. Clicca qui per iscriverti!",
  openGraph: {
    title: "Iscriviti allo Slam del 3 Settembre come poeta o pubblico",
    description: "Gelatina torna sul palco. Sali a leggere le tue poesie, prova l'Open Mic o goditi la serata come pubblico. Clicca qui per iscriverti!",
    url: "https://www.collettivogelatina.it",
    siteName: "Gelatina Poetry Slam",
    images: [
      {
        url: "https://www.collettivogelatina.it/og-microphone.jpg",
        width: 1200,
        height: 675,
        alt: "Gelatina Poetry Slam Microphone",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iscriviti allo Slam del 3 Settembre come poeta o pubblico",
    description: "Gelatina torna sul palco. Sali a leggere le tue poesie, prova l'Open Mic o goditi la serata come pubblico. Clicca qui per iscriverti!",
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
