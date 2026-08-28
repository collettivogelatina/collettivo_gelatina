"use client";
import { useState } from "react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
}

export default function RegistrationModal({ isOpen, onClose, eventTitle }: RegistrationModalProps) {
  const [role, setRole] = useState<"Pubblico" | "Poeta" | "Open Mic">("Pubblico");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [peopleCount, setPeopleCount] = useState("1");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      const validEmail = contact.includes("@") ? contact : "collettivogelatina@gmail.com";
      const ruoloEsteso = role === "Poeta" ? "Poeta (Slam)" : role;
      
      const payload: any = {
        "Nome e Cognome": name,
        "Email/Contatto": contact || "Nessuno",
        "Ruolo": ruoloEsteso,
        "Evento": eventTitle,
        _subject: `Nuova iscrizione: ${name} - ${ruoloEsteso}` 
      };

      if (role === "Pubblico") {
        payload["Numero di Persone"] = peopleCount;
      }

      await fetch("https://formsubmit.co/ajax/collettivogelatina@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
        style={{ border: "2px solid #E63946" }}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-black text-[#1C1A4A] mb-1">Iscriviti</h2>
        <p className="text-sm font-semibold text-gray-500 mb-6">{eventTitle}</p>
        
        {status === "sent" ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-[#4B44DF] mb-2">Iscrizione Inviata!</h3>
            <p className="text-gray-600">Grazie, abbiamo ricevuto la tua richiesta e ti contatteremo se necessario.</p>
            <button 
              onClick={handleClose}
              className="mt-6 px-6 py-2 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Chiudi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col text-left">
            <div>
              <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Nome e Cognome *</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "sending"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                placeholder="Es. Mario Rossi"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Come vuoi partecipare?</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                disabled={status === "sending"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20 bg-white"
              >
                <option value="Pubblico">Come Pubblico</option>
                <option value="Open Mic">Come Open Mic</option>
              </select>
              <p className="text-xs text-[#4B44DF] mt-1.5 font-bold">
                Le iscrizioni sono aperte per partecipare come pubblico o leggere all'Open Mic!
              </p>
            </div>

            {role === "Pubblico" && (
              <div>
                <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Numero di persone *</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  max="20"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">
                Contatto (Email o Cellulare) *
              </label>
              <input 
                required
                type="text" 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={status === "sending"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                placeholder="Es. mario@email.it oppure 3331234567"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full font-black text-sm px-9 py-4 rounded-full transition-all hover:scale-105 shadow-xl disabled:opacity-50"
                style={{ background: "#E63946", color: "white" }}
              >
                {status === "sending" ? "Invio in corso..." : "🔥 Conferma Iscrizione"}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-xs mt-3 text-center font-bold">Errore di connessione. Riprova tra poco.</p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
