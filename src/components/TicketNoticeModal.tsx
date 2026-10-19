"use client";

interface TicketNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "live" | "stream" | null;
}

export default function TicketNoticeModal({ isOpen, onClose, type }: TicketNoticeModalProps) {
  if (!isOpen || !type) return null;

  const isLive = type === "live";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-center"
        style={{ border: "2px solid #FF8A00" }}
      >
        {/* Pulsante chiudi */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-all"
        >
          ✕
        </button>

        {/* Icona e Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-lg text-3xl"
          style={{
            background: "linear-gradient(135deg, #FF5E36 0%, #FF8A00 50%, #FFA834 100%)",
            color: "white",
            boxShadow: "0 10px 25px rgba(255, 94, 54, 0.35)",
          }}
        >
          {isLive ? "🎟️" : "📡"}
        </div>

        <div className="mb-2">
          <span 
            className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
            style={{
              background: "#FFF3E6",
              color: "#D95D00",
              border: "1px solid #FFCD99",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Funzionalità In Arrivo
          </span>
        </div>

        <h3 className="text-2xl font-black text-[#1C1A4A] mb-2 leading-tight">
          {isLive ? "Biglietto Dal Vivo" : "Streaming Live da Casa"}
        </h3>

        <p className="text-xs font-bold text-[#FF8A00] mb-4">
          Mercoledì 28 Ottobre · Ore 19:30 · Bacco e Venere (Latina)
        </p>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {isLive ? (
            <>
              Stiamo definendo gli ultimi dettagli con il locale. A brevissimo potrai acquistare direttamente qui sul sito il tuo <strong>biglietto in presenza</strong> per assistere allo slam dal vivo. I posti in sala saranno limitati!
            </>
          ) : (
            <>
              Stiamo preparando la piattaforma di <strong>diretta streaming</strong> con il nostro sistema interattivo per consentirti di guardare lo slam e votare i poeti in tempo reale comodamente da casa!
            </>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://www.instagram.com/collettivogelatina"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full font-black text-sm py-3.5 px-6 rounded-full transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #4B44DF 0%, #7A74FF 100%)",
              color: "white",
            }}
          >
            <span>📸</span> Seguici su Instagram per la notifica
          </a>
          <button
            onClick={onClose}
            className="w-full text-xs font-bold py-2.5 px-4 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          >
            Ho capito, grazie
          </button>
        </div>
      </div>
    </div>
  );
}
