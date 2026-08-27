import type { Metadata } from "next";
import ClientHome from "@/components/ClientHome";

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const isInviaPoesia = typeof searchParams["invia-poesia"] !== "undefined";
  
  if (isInviaPoesia) {
    return {
      title: "Invia la tua poesia a Gelatino",
      description: "Gelatino è una raccolta mensile di poesie illustrate. Inviaci il tuo testo per partecipare al prossimo numero!",
      openGraph: {
        title: "Invia la tua poesia a Gelatino",
        description: "Gelatino è una raccolta mensile di poesie illustrate. Inviaci il tuo testo per partecipare al prossimo numero!",
        url: "https://www.collettivogelatina.it/?invia-poesia=gelatino",
        siteName: "Gelatino",
        images: [
          {
            url: "https://www.collettivogelatina.it/Gelatina3cover.jpeg",
            width: 1200,
            height: 675,
            alt: "Gelatino Poetry Cover",
          },
        ],
        locale: "it_IT",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Invia la tua poesia a Gelatino",
        description: "Gelatino è una raccolta mensile di poesie illustrate. Inviaci il tuo testo per partecipare al prossimo numero!",
        images: ["https://www.collettivogelatina.it/Gelatina3cover.jpeg"],
      },
    };
  }

  // Fallback ai valori di default in layout.tsx
  return {};
}

export default function Page() {
  return <ClientHome />;
}
