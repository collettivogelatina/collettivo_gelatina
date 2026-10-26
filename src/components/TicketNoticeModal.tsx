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
              background: "#ECFDF5",
              color: "#047857",
              border: "1px solid #6EE7B7",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isLive ? "Prevendita Attiva · 5,50 €" : "Prevendita Attiva · 3,00 €"}
          </span>
        </div>

        <h3 className="text-2xl font-black text-[#1C1A4A] mb-2 leading-tight">
          {isLive ? "Biglietto Dal Vivo (Billetto)" : "Streaming Live da Casa (Iris)"}
        </h3>

        <p className="text-xs font-bold text-[#FF8A00] mb-4">
          Mercoledì 28 Ottobre · Ore 19:30 · Bacco e Venere (Via P. R. Giuliani 12, Latina)
        </p>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {isLive ? (
            <>
              Assisti di persona allo slam a Latina! Posto in sala e voto della giuria popolare per decidere il vincitore. 
              Biglietto a <strong>5,50 €</strong> su Billetto. Posti limitati!
            </>
          ) : (
            <>
              La prevendita per seguire la <strong>diretta streaming video</strong> (3 €) e votare i poeti in tempo reale comodamente dal divano è attiva sulla piattaforma ufficiale <strong>Iris</strong>! In regalo per te il PDF di Gelatino N°1.
            </>
          )}
        </p>

        <div className="flex flex-col gap-3">
          {isLive ? (
            <>
              <a
                href="https://billetto.it/e/poetry-slam-biglietti-2032403?bref=eyJzIjoiYmlsbGV0dG8iLCJtIjoiYmlsbGV0dG8iLCJjIjoiZmluZCIsImNvIjoiMUlUIiwidCI6MTc5MzAxODcxNn0%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full font-black text-sm py-3.5 px-6 rounded-full transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FF5E36 0%, #FF8A00 100%)",
                  color: "white",
                }}
              >
                <span>🎟️</span> Compra Biglietto su Billetto (5,50 €) →
              </a>
              <button
                onClick={() => {
                  const text = "🎟️ Biglietto per il Poetry Slam di Mercoledì 28 Ottobre da Bacco e Venere (Latina) a 5,50€:";
                  const url = "https://billetto.it/e/poetry-slam-biglietti-2032403?bref=eyJzIjoiYmlsbGV0dG8iLCJtIjoiYmlsbGV0dG8iLCJjIjoiZmluZCIsImNvIjoiMUlUIiwidCI6MTc5MzAxODcxNn0%3D";
                  if (navigator.share) {
                    navigator.share({ title: "Biglietto Poetry Slam 28 Ottobre (Bacco e Venere)", text, url });
                  } else {
                    navigator.clipboard.writeText(`${text}\n${url}`);
                    alert("Link biglietto Billetto copiato negli appunti!");
                  }
                }}
                className="w-full text-xs font-bold py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↗️</span> Condividi Link Biglietto
              </button>
              <p className="text-[11px] text-gray-500">
                Prenotazioni anche via tel: <a href="tel:3514910626" className="text-orange-600 underline font-bold">351 491 0626</a> · <a href="mailto:collettivogelatina@gmail.com" className="text-orange-600 underline">email</a>
              </p>
            </>
          ) : (
            <>
              <a
                href="https://iris.giun.one/live/poetry-slam-bacco-e-venere"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full font-black text-sm py-3.5 px-6 rounded-full transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #FF9233 50%, #FFB03A 100%)",
                  color: "white",
                }}
              >
                <span>📡</span> Acquista Prevendita su Iris (3 €) →
              </a>
              <button
                onClick={() => {
                  const text = "📡 Segui in Streaming Live il Poetry Slam del 28 Ottobre da Bacco e Venere a Latina (3€)! Acquista la prevendita qui:";
                  const url = "https://iris.giun.one/live/poetry-slam-bacco-e-venere";
                  if (navigator.share) {
                    navigator.share({ title: "Streaming Live Poetry Slam 28 Ottobre (Bacco e Venere)", text, url });
                  } else {
                    navigator.clipboard.writeText(`${text}\n${url}`);
                    alert("Link prevendita streaming copiato negli appunti!");
                  }
                }}
                className="w-full text-xs font-bold py-2.5 px-4 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↗️</span> Condividi Link Prevendita
              </button>
            </>
          )}
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
