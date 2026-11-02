"use client";

import React, { useState, useEffect } from "react";
import ShareGelatinoModal, { ShareIssueTarget } from "./ShareGelatinoModal";

export interface GelatinoIssueData {
  number: number;
  flavor: string;
  emoji: string;
  date: string;
  pages: number;
  description: string;
  authors?: string[];
  cover: string;
  pdfUrl: string;
  gumroadUrl?: string;
  color: {
    primary: string;
    bg: string;
    border: string;
    stripe: string;
    badgeText: string;
  };
}

export const GELATINI_ISSUES: GelatinoIssueData[] = [
  {
    number: 1,
    flavor: "Gusto Puffo",
    emoji: "🫐",
    date: "Giugno 2026",
    pages: 32,
    description: "Il primo storico numero di Gelatino: poesie illustrate che colorano di blu.",
    authors: ["Collettivo Gelatina", "Autori vari"],
    cover: "/Gelatina1Cover.jpeg",
    pdfUrl: "/gelatini/Gelatino1.pdf",
    gumroadUrl: "https://closurecomics.gumroad.com/l/Gelatinodigitale1",
    color: {
      primary: "#3B6FE8",
      bg: "#EEF2FF",
      border: "#A8BCFF",
      stripe: "linear-gradient(135deg, #3B6FE8 0%, #7090FF 100%)",
      badgeText: "#2548B0",
    },
  },
  {
    number: 2,
    flavor: "Gusto Limone",
    emoji: "🍋",
    date: "Giugno 2026",
    pages: 36,
    description: "Il secondo numero: poesie illustrate aspre, luminose e inattese come una spruzzata d'agrume.",
    authors: ["Collettivo Gelatina", "Autori vari"],
    cover: "/Gelatina2Cover.jpeg",
    pdfUrl: "/gelatini/Gelatino2.pdf",
    gumroadUrl: "https://closurecomics.gumroad.com/l/Gelatino2",
    color: {
      primary: "#C49200",
      bg: "#FFFDE8",
      border: "#FFE066",
      stripe: "linear-gradient(135deg, #E8B800 0%, #FFD740 100%)",
      badgeText: "#8A6600",
    },
  },
  {
    number: 3,
    flavor: "Gusto Menta e Basilico",
    emoji: "🌿",
    date: "Luglio 2026",
    pages: 36,
    description: "Il terzo numero: fresco, balsamico e verdeggiante per accompagnare le notti d'estate.",
    authors: ["Collettivo Gelatina", "Autori vari"],
    cover: "/Gelatina3cover.jpeg",
    pdfUrl: "/gelatini/Gelatino3.pdf",
    gumroadUrl: "https://closurecomics.gumroad.com/l/Gelatino3",
    color: {
      primary: "#2A8A5A",
      bg: "#E8F8F0",
      border: "#80D4A8",
      stripe: "linear-gradient(135deg, #2A8A5A 0%, #3DC878 100%)",
      badgeText: "#1B5D3C",
    },
  },
  {
    number: 4,
    flavor: "Gusto Zucca e Amaretto",
    emoji: "🎃",
    date: "Novembre 2026",
    pages: 36,
    description: "Il quarto numero: atmosfere autunnali tra carrozze di zucca, foglie dorate e profumo dolce-amaro d'amaretto.",
    authors: [
      "Aldo Sorrentino",
      "Gianfranco Domizi",
      "Marzia Schenetti",
      "Rino Gilbronchi",
      "Alessia Cianfanelli",
      "Akinorev",
      "Leukida",
      "Martina Azzurra",
      "Francesca Riccetti",
      "Joe P.",
    ],
    cover: "/Gelatina4Cover.jpeg",
    pdfUrl: "/gelatini/Gelatino4.pdf",
    gumroadUrl: "https://closurecomics.gumroad.com/l/Gelatino4",
    color: {
      primary: "#D95D00",
      bg: "#FFF7ED",
      border: "#FED7AA",
      stripe: "linear-gradient(135deg, #EA580C 0%, #FB923C 100%)",
      badgeText: "#9A3412",
    },
  },
];

interface GelatinoReaderGalleryProps {
  selectedIssueNumber: number;
  onSelectIssue: (num: number) => void;
  onShareIssue?: (issue: ShareIssueTarget) => void;
}

export default function GelatinoReaderGallery({
  selectedIssueNumber,
  onSelectIssue,
  onShareIssue,
}: GelatinoReaderGalleryProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalShareIssue, setInternalShareIssue] = useState<ShareIssueTarget | null>(null);

  const currentIssue =
    GELATINI_ISSUES.find((item) => item.number === selectedIssueNumber) || GELATINI_ISSUES[0];

  const handlePrev = () => {
    if (currentIssue.number > 1) {
      onSelectIssue(currentIssue.number - 1);
    }
  };

  const handleNext = () => {
    if (currentIssue.number < GELATINI_ISSUES.length) {
      onSelectIssue(currentIssue.number + 1);
    }
  };

  const handleShare = () => {
    const target: ShareIssueTarget = {
      number: currentIssue.number,
      flavor: currentIssue.flavor,
      emoji: currentIssue.emoji,
      cover: currentIssue.cover,
      color: {
        primary: currentIssue.color.primary,
        border: currentIssue.color.border,
      },
    };
    if (onShareIssue) {
      onShareIssue(target);
    } else {
      setInternalShareIssue(target);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div id="leggi-gelatino" className="mt-8 mb-10 scroll-mt-24">
      {/* Active Issue Reader Container */}
      <div
        className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          border: `2.5px solid ${currentIssue.color.primary}55`,
          background: "#1F1E29",
        }}
      >
        {/* Reader Top Bar */}
        <div
          className="px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white border-b border-white/10"
          style={{ background: currentIssue.color.stripe }}
        >
          {/* Issue title & metadata */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl">{currentIssue.emoji}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                  NUMERO {currentIssue.number}
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {currentIssue.date} · {currentIssue.pages} pagine
                </span>
                <span className="bg-white/25 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  📖 Sala di Lettura Online
                </span>
              </div>
              <h4 className="font-black text-lg sm:text-xl text-white tracking-tight">
                Gelatino {currentIssue.flavor}
              </h4>
            </div>
          </div>

          {/* Reader Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Prev / Next buttons */}
            <div className="inline-flex items-center bg-black/25 rounded-full p-1 border border-white/10">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIssue.number <= 1}
                className="px-3 py-1.5 text-xs font-black rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 text-white cursor-pointer"
                title="Numero precedente"
              >
                ← Prev
              </button>
              <span className="px-2 text-xs font-mono font-bold text-white/80">
                {currentIssue.number}/4
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIssue.number >= GELATINI_ISSUES.length}
                className="px-3 py-1.5 text-xs font-black rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 text-white cursor-pointer"
                title="Numero successivo"
              >
                Next →
              </button>
            </div>

            {/* Condividi nei social */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-sm"
              title="Condividi questo numero sui social"
            >
              <span>📲</span>
              <span>Condividi</span>
            </button>

            {/* Acquista Copia Digitale Gumroad */}
            {currentIssue.gumroadUrl && (
              <a
                href={currentIssue.gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs px-3.5 py-2 rounded-full shadow-md transition-all cursor-pointer whitespace-nowrap"
                title="Acquista la copia digitale su Gumroad (€2)"
              >
                <span>🛒</span>
                <span>Acquista copia digitale (€2) ↗</span>
              </a>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-1.5 bg-white text-gray-900 font-black text-xs px-3.5 py-2 rounded-full shadow-md hover:bg-amber-300 transition-all cursor-pointer"
              title="Modalità lettura a schermo intero"
            >
              <span>🔍</span>
              <span>Schermo Intero</span>
            </button>

            {/* Download Button */}
            <a
              href={currentIssue.pdfUrl}
              download
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-full transition-all"
              title="Scarica il PDF"
            >
              <span>⬇️</span>
              <span className="hidden sm:inline">Scarica</span>
            </a>

            {/* New Tab Button */}
            <a
              href={currentIssue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-full transition-all"
              title="Apri in nuova scheda"
            >
              <span>↗️</span>
              <span className="hidden sm:inline">Nuova scheda</span>
            </a>
          </div>
        </div>

        {/* Authors info strip if available (especially issue 4) */}
        {currentIssue.authors && currentIssue.authors.length > 2 && (
          <div className="bg-black/35 px-5 py-2.5 text-xs text-white/85 border-b border-white/5 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="font-bold text-amber-300 flex-shrink-0">✍️ Autori del numero:</span>
            <span>{currentIssue.authors.join(" · ")}</span>
          </div>
        )}

        {/* Embedded PDF Viewer */}
        <div className="relative w-full bg-[#2A2938]" style={{ height: "740px" }}>
          <iframe
            key={currentIssue.pdfUrl}
            src={`${currentIssue.pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            title={`Lettore PDF Gelatino N.${currentIssue.number} - ${currentIssue.flavor}`}
            className="w-full h-full border-0"
          />
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-6 py-3 bg-[#171622] text-xs text-gray-300 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5">
          <p className="flex items-center gap-2">
            <span>💡</span>
            <span>
              Stai leggendo <strong>Gelatino N.{currentIssue.number} ({currentIssue.flavor})</strong>. Per leggere a tutta pagina apri a{" "}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="underline font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                Schermo Intero
              </button>
              .
            </span>
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleShare}
              className="text-amber-300 hover:text-white font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>📲</span> Condividi questo numero
            </button>
            <a
              href={currentIssue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white font-semibold transition-colors"
            >
              Apri PDF a pagina intera ↗
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen Reader Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div
            className="px-6 py-3 flex items-center justify-between text-white border-b border-white/10"
            style={{ background: currentIssue.color.stripe }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentIssue.emoji}</span>
              <div>
                <h3 className="font-black text-lg text-white leading-tight">
                  Gelatino N.{currentIssue.number} — {currentIssue.flavor}
                </h3>
                <p className="text-xs text-white/80">
                  {currentIssue.date} · {currentIssue.pages} pagine · Modalità Lettura a Schermo Intero
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Prev / Next */}
              <div className="inline-flex items-center bg-black/30 rounded-full p-1 border border-white/10">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIssue.number <= 1}
                  className="px-3 py-1 text-xs font-bold rounded-full disabled:opacity-30 text-white hover:bg-white/20 cursor-pointer"
                >
                  ← Prec
                </button>
                <span className="px-2 text-xs font-mono font-bold text-white/70">
                  {currentIssue.number}/4
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIssue.number >= GELATINI_ISSUES.length}
                  className="px-3 py-1 text-xs font-bold rounded-full disabled:opacity-30 text-white hover:bg-white/20 cursor-pointer"
                >
                  Succ →
                </button>
              </div>

              {/* Share in Fullscreen */}
              <button
                type="button"
                onClick={handleShare}
                className="hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer"
              >
                📲 Condividi
              </button>

              {/* Gumroad Buy */}
              {currentIssue.gumroadUrl && (
                <a
                  href={currentIssue.gumroadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md transition-all"
                  title="Acquista la copia digitale su Gumroad (€2)"
                >
                  🛒 Acquista (€2) ↗
                </a>
              )}

              {/* Download */}
              <a
                href={currentIssue.pdfUrl}
                download
                className="hidden sm:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full"
              >
                ⬇️ Scarica
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                ✕ Chiudi
              </button>
            </div>
          </div>

          {/* Modal PDF Frame */}
          <div className="flex-1 w-full bg-[#1A1A24]">
            <iframe
              key={currentIssue.pdfUrl + "-fs"}
              src={`${currentIssue.pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
              title={`Lettore Schermo Intero - ${currentIssue.flavor}`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Internal share modal if used as fallback */}
      {internalShareIssue && !onShareIssue && (
        <ShareGelatinoModal
          isOpen={!!internalShareIssue}
          onClose={() => setInternalShareIssue(null)}
          issue={internalShareIssue}
        />
      )}
    </div>
  );
}
