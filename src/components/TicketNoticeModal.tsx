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
              background: "#FAF5FF",
              color: "#7C3AED",
              border: "1px solid #DDD6FE",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Prossimo Evento · In Arrivo
          </span>
        </div>

        <h3 className="text-2xl font-black text-[#1C1A4A] mb-2 leading-tight">
          Il Divano Astarnato @ Caffè Poeta
        </h3>

        <p className="text-xs font-bold text-[#7C3AED] mb-4">
          Giovedì 12 Novembre 2026 · Caffè Poeta Bistrot (Piazza del Popolo 12, Latina)
        </p>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          L'evento del 28 Ottobre si è concluso con successo! Il prossimo appuntamento è con il talk show comico dal vivo e podcast <strong>Il Divano Astarnato</strong> insieme al <strong>Collettivo Gelatina</strong>. Posti limitati in sala.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="mailto:collettivogelatina@gmail.com?subject=Info%20e%20Prenotazioni%20Il%20Divano%20Astarnato"
            className="w-full font-black text-sm py-3.5 px-6 rounded-full transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #4B44DF 100%)",
              color: "white",
            }}
          >
            <span>✉️</span> Contatta per Info o Prenotazione Tavoli
          </a>
          <p className="text-[11px] text-gray-500">
            Oppure chiama o scrivi via WhatsApp al: <a href="tel:3514910626" className="text-purple-600 underline font-bold">351 491 0626</a>
          </p>
          <button
            onClick={onClose}
            className="w-full text-xs font-bold py-2.5 px-4 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
