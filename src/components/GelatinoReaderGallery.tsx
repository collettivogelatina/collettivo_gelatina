"use client";

import React, { useState, useEffect } from "react";

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
      "Leuikida",
      "Martina Azzurra",
      "Francesca Riccetti",
      "Joe P.",
    ],
    cover: "/Gelatina4Cover.jpeg",
    pdfUrl: "/gelatini/Gelatino4.pdf",
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
  selectedIssueNumber?: number;
  onSelectIssue?: (num: number) => void;
}

export default function GelatinoReaderGallery({
  selectedIssueNumber,
  onSelectIssue,
}: GelatinoReaderGalleryProps) {
  const [internalIssueNumber, setInternalIssueNumber] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeNumber = selectedIssueNumber ?? internalIssueNumber;
  const currentIssue =
    GELATINI_ISSUES.find((item) => item.number === activeNumber) || GELATINI_ISSUES[0];

  const handleSelect = (num: number) => {
    if (onSelectIssue) {
      onSelectIssue(num);
    } else {
      setInternalIssueNumber(num);
    }
  };

  const handlePrev = () => {
    if (currentIssue.number > 1) {
      handleSelect(currentIssue.number - 1);
    }
  };

  const handleNext = () => {
    if (currentIssue.number < GELATINI_ISSUES.length) {
      handleSelect(currentIssue.number + 1);
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
    <div id="leggi-gelatino" className="mt-16 pt-10 border-t border-purple-100">
      {/* Title & Introduction */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 shadow-sm"
          style={{ background: "rgba(75,68,223,0.08)", border: "1px solid rgba(75,68,223,0.18)" }}
        >
          <span className="text-base">📖</span>
          <span className="text-xs font-black tracking-widest uppercase font-mono" style={{ color: "#4B44DF" }}>
            Sala di Lettura Digitale
          </span>
        </div>
        <h3 className="font-black text-2xl sm:text-3xl md:text-4xl leading-tight mb-3" style={{ color: "#0F0E17" }}>
          Sfoglia e leggi i numeri di <em style={{ fontFamily: "'Playfair Display', serif" }}>Gelatino</em>
        </h3>
        <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#4A4880" }}>
          Tutti i numeri della nostra raccolta mensile di poesie illustrate sono disponibili per la lettura diretta online.
          Scegli un numero per iniziare a sfogliarlo subito!
        </p>
      </div>

      {/* Issue Selection Gallery (4 items) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {GELATINI_ISSUES.map((issue) => {
          const isSelected = issue.number === currentIssue.number;
          return (
            <button
              key={issue.number}
              type="button"
              onClick={() => handleSelect(issue.number)}
              className="relative rounded-2xl p-3 sm:p-4 text-left transition-all duration-300 focus:outline-none flex flex-col justify-between group cursor-pointer"
              style={{
                background: isSelected ? issue.color.bg : "#FFFFFF",
                border: isSelected
                  ? `2.5px solid ${issue.color.primary}`
                  : "1.5px solid rgba(0,0,0,0.08)",
                boxShadow: isSelected
                  ? `0 10px 28px ${issue.color.primary}33, 0 2px 10px rgba(0,0,0,0.06)`
                  : "0 2px 8px rgba(0,0,0,0.04)",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}
            >
              {/* Badge Number */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono"
                  style={{
                    background: isSelected ? issue.color.primary : "#E8E8FA",
                    color: isSelected ? "#FFFFFF" : "#4B44DF",
                  }}
                >
                  N. {issue.number}
                </span>
                <span className="text-xl">{issue.emoji}</span>
              </div>

              {/* Cover Preview */}
              <div className="flex justify-center my-2">
                <div
                  className="relative transition-transform duration-300 group-hover:scale-105"
                  style={{ perspective: "600px" }}
                >
                  <div
                    className="absolute -bottom-1 -right-1 w-full h-full rounded"
                    style={{
                      background: issue.color.primary,
                      opacity: isSelected ? 0.35 : 0.15,
                      filter: "blur(2px)",
                    }}
                  />
                  <img
                    src={issue.cover}
                    alt={issue.flavor}
                    className="w-24 sm:w-28 h-auto rounded shadow-md object-cover border border-white/60"
                    style={{ aspectRatio: "3 / 4.2" }}
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="mt-3">
                <h4
                  className="font-black text-sm leading-snug line-clamp-1 mb-1"
                  style={{ color: isSelected ? issue.color.primary : "#0F0E17" }}
                >
                  {issue.flavor}
                </h4>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                  <span>{issue.date}</span>
                  <span>{issue.pages} pag.</span>
                </div>
              </div>

              {/* Active Indicator Button */}
              <div className="mt-3 pt-2 border-t border-black/5">
                <span
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-black py-1.5 px-2 rounded-xl transition-colors"
                  style={{
                    background: isSelected ? issue.color.primary : "rgba(75,68,223,0.06)",
                    color: isSelected ? "#FFFFFF" : "#4B44DF",
                  }}
                >
                  {isSelected ? "📖 In Lettura" : "Sfoglia questo →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Issue Reader Container */}
      <div
        className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          border: `2px solid ${currentIssue.color.primary}44`,
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
                <span className="bg-white/20 text-white font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                  NUMERO {currentIssue.number}
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {currentIssue.date} · {currentIssue.pages} pagine
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
        <div className="relative w-full bg-[#2A2938]" style={{ height: "720px" }}>
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
              Per sfogliare comodamente le pagine puoi ingrandire il lettore a{" "}
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
            <a
              href={currentIssue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white font-semibold transition-colors"
            >
              Visualizza PDF a pagina intera ↗
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
    </div>
  );
}
