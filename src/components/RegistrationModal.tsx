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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let body = `Ciao,\nvorrei iscrivermi all'evento "${eventTitle}".\n\n`;
    body += `Nome: ${name}\n`;
    body += `Partecipazione: ${role}\n`;
    
    if (role === "Pubblico") {
      body += `Numero di persone: ${peopleCount}\n`;
    }
    
    if (contact) {
      body += `Contatto: ${contact}\n`;
    }
    
    body += `\nGrazie!`;

    const subject = `Iscrizione ${role} — ${eventTitle}`;
    const mailtoLink = `mailto:collettivogelatina@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
        style={{ border: "2px solid #E63946" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-black text-[#1C1A4A] mb-1">Iscriviti</h2>
        <p className="text-sm font-semibold text-gray-500 mb-6">{eventTitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col text-left">
          <div>
            <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Nome e Cognome *</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
              placeholder="Es. Mario Rossi"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">Come vuoi partecipare?</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20 bg-white"
            >
              <option value="Pubblico">Come Pubblico</option>
              <option value="Poeta">Come Poeta (Slam)</option>
              <option value="Open Mic">Come Poeta (Open Mic)</option>
            </select>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#4B44DF] uppercase tracking-widest mb-1">
              Contatto (Email o Telefono) {role !== "Pubblico" && "*"}
            </label>
            <input 
              required={role !== "Pubblico"}
              type="text" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4B44DF] focus:ring-2 focus:ring-[#4B44DF]/20"
              placeholder={role !== "Pubblico" ? "Opzionale" : "Obbligatorio per i poeti"}
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full font-black text-sm px-9 py-4 rounded-full transition-all hover:scale-105 shadow-xl"
              style={{ background: "#E63946", color: "white" }}
            >
              ✉️ Genera Email di Iscrizione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
