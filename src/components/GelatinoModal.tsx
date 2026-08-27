"use client";
import { useState } from "react";

interface GelatinoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GelatinoModal({ isOpen, onClose }: GelatinoModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!isOpen) return null;

  const handleSubmit = () => {
    setStatus("sending");
  };

  const handleClose = () => {
    setStatus("idle");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
        style={{ border: "2px solid #4B44DF" }}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-black text-[#1C1A4A] mb-1">Invia la tua Poesia</h2>
        <p className="text-sm font-semibold text-gray-500 mb-6">Per la raccolta mensile Gelatino</p>
        
        {status === "sent" ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-[#4B44DF] mb-2">Poesia Inviata!</h3>
            <p className="text-gray-600">Grazie! L'abbiamo ricevuta con l'allegato e la leggeremo con cura.</p>
            <button 
              onClick={handleClose}
              className="mt-6 px-6 py-2 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Chiudi
            </button>
          </div>
        ) : (
          <>
            <iframe 
              name="hidden_iframe" 
              id="hidden_iframe" 
              style={{ display: "none" }} 
              onLoad={() => {
                if (status === "sending") {
                  setStatus("sent");
                }
              }}
            ></iframe>
            <form 
              action="https://formsubmit.co/collettivogelatina@gmail.com" 
              method="POST" 
              encType="multipart/form-data" 
              target="hidden_iframe"
              onSubmit={handleSubmit} 
              className="space-y-4 flex flex-col text-left"
            >
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_subject" value={"Nuova Poesia Gelatino: " + title + " (da " + name + ")"} />

              <div>
                <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Nome del Poeta *</label>
                <input 
                  required
                  name="Nome e Cognome"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                  placeholder="Es. Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Email di contatto *</label>
                <input 
                  required
                  name="Email o Contatto"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                  placeholder="Es. mario@email.it"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Titolo della Poesia *</label>
                <input 
                  required
                  name="Titolo Poesia"
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
                  placeholder="Titolo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Allega il Testo (PDF o DOC) *</label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#4B44DF] focus-within:ring-2 focus-within:ring-[#4B44DF]/20 relative">
                   <input 
                    required
                    name="attachment"
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    disabled={status === "sending"}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#4B44DF]/10 file:text-[#4B44DF] hover:file:bg-[#4B44DF]/20 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Allegare il file assicura che la struttura e gli a capo della poesia siano preservati fedelmente.</p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full font-black text-sm px-9 py-4 rounded-full transition-all hover:scale-105 shadow-xl disabled:opacity-50"
                  style={{ background: "#4B44DF", color: "white" }}
                >
                  {status === "sending" ? "Invio in corso..." : "✉️ Invia Poesia"}
                </button>
                {status === "error" && (
                  <p className="text-red-500 text-xs mt-3 text-center font-bold">Errore di connessione. Riprova tra poco.</p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
