"use client";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const shareTitle = "Streaming Live Poetry Slam 28 Ottobre (Bacco e Venere)";
  const shareUrl = "https://iris.giun.one/live/poetry-slam-bacco-e-venere";
  const shareText = "📡 Segui in Streaming Live il Poetry Slam del 28 Ottobre da Bacco e Venere a Latina! Vota i poeti in diretta da casa:";

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Prova a recuperare il file immagine per allegarlo alla condivisione nativa
      const response = await fetch("/share-streaming.jpg");
      const blob = await response.blob();
      const file = new File([blob], "poetry-slam-streaming.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: `${shareText}\n${shareUrl}`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative text-center"
        style={{ border: "2px solid #FF8A00" }}
      >
        {/* Pulsante chiudi */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-all"
        >
          ✕
        </button>

        {/* Badge */}
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
            Condivisione Streaming Live
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#1C1A4A] mb-1">
          Condividi con l'Immagine
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Mercoledì 28 Ottobre ore 19:30 · Bacco e Venere (Latina)
        </p>

        {/* Immagine del microfono con la bocca */}
        <div className="relative rounded-2xl overflow-hidden mb-4 shadow-xl border-2 border-orange-200 bg-[#140b2d] max-h-60 flex items-center justify-center">
          <img 
            src="/share-streaming.jpg" 
            alt="Microfono con bocca per Poetry Slam Streaming Live" 
            className="w-full h-full object-cover max-h-60 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-left">
            <p className="text-[11px] font-black text-white flex items-center gap-1.5">
              <span>🎤</span> Collettivo Gelatina · Poetry Slam
            </p>
            <p className="text-[10px] text-orange-200 font-semibold">
              Prevendita Streaming attiva su Iris
            </p>
          </div>
        </div>

        {/* Pulsanti azione */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full font-black text-sm py-3.5 px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer text-white"
            style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF9233 50%, #FFB03A 100%)",
              boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
            }}
          >
            <span>📱</span> Condividi Immagine e Link
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="/share-streaming.jpg"
              download="poetry-slam-streaming-28-ottobre.jpg"
              className="text-xs font-bold py-2.5 px-3 rounded-full border border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-1.5"
            >
              <span>📥</span> Scarica Immagine
            </a>

            <button
              onClick={handleCopy}
              className="text-xs font-bold py-2.5 px-3 rounded-full border border-gray-200 hover:border-orange-300 text-gray-700 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{copied ? "✅" : "📋"}</span> {copied ? "Copiato!" : "Copia Link"}
            </button>
          </div>

          <a
            href="https://iris.giun.one/live/poetry-slam-bacco-e-venere"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors pt-1"
          >
            Apri direttamente su Iris →
          </a>
        </div>
      </div>
    </div>
  );
}
