"use client";

import React, { useState } from "react";

export interface ShareIssueTarget {
  number: number;
  flavor: string;
  emoji: string;
  cover?: string | null;
  color?: {
    primary?: string;
    border?: string;
  };
}

interface ShareGelatinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: ShareIssueTarget | null;
}

export default function ShareGelatinoModal({
  isOpen,
  onClose,
  issue,
}: ShareGelatinoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !issue) return null;

  const baseUrl = "https://www.collettivogelatina.it";
  const shareUrl = `${baseUrl}/?leggi=${issue.number}#leggi-gelatino`;
  const shareText = `📖 Leggi gratis online "Gelatino N.${issue.number} — ${issue.flavor}", la raccolta di poesie illustrate del Collettivo Gelatina!`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Gelatino N.${issue.number} (${issue.flavor})`,
          text: shareText,
          url: shareUrl,
        });
      } catch (e: any) {
        if (e.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const xTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl relative text-center border-2 border-purple-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsante chiudi */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-sm transition-all cursor-pointer"
          aria-label="Chiudi"
        >
          ✕
        </button>

        {/* Badge & Copertina */}
        <div className="flex flex-col items-center mb-3">
          <div className="relative mb-2">
            <span className="text-4xl">{issue.emoji}</span>
          </div>
          <span
            className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-mono"
            style={{ background: "#EEF2FF", color: "#4B44DF" }}
          >
            Condividi Gelatino N. {issue.number}
          </span>
          <h3 className="text-xl font-black text-[#0F0E17] mt-1">
            {issue.flavor}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Invia questo numero a chi vuoi o pubblicalo sulle tue storie e canali social!
          </p>
        </div>

        {/* ── Social Share Grid ── */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-transform hover:scale-[1.02]"
            style={{ background: "#25D366" }}
          >
            <span className="text-base">💬</span>
            <span>WhatsApp</span>
          </a>

          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-transform hover:scale-[1.02]"
            style={{ background: "#229ED9" }}
          >
            <span className="text-base">✈️</span>
            <span>Telegram</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-transform hover:scale-[1.02]"
            style={{ background: "#1877F2" }}
          >
            <span className="text-base">📘</span>
            <span>Facebook</span>
          </a>

          {/* X / Twitter */}
          <a
            href={xTwitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-transform hover:scale-[1.02]"
            style={{ background: "#000000" }}
          >
            <span className="text-base font-sans font-bold">𝕏</span>
            <span>Condividi</span>
          </a>
        </div>

        {/* Native mobile share if supported */}
        {hasNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-black transition-transform hover:scale-[1.01] cursor-pointer"
            style={{
              background: "rgba(75, 68, 223, 0.08)",
              color: "#4B44DF",
              border: "1.5px solid rgba(75, 68, 223, 0.2)",
            }}
          >
            <span>📲</span>
            <span>Altre app del telefono (Instagram, SMS, ecc.)</span>
          </button>
        )}

        {/* ── Copy Link Box ── */}
        <div className="mt-2 pt-3 border-t border-gray-100 text-left">
          <label className="block text-[11px] font-bold text-gray-500 mb-1">
            Oppure copia il link diretto:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs font-black text-white transition-all cursor-pointer whitespace-nowrap shadow-sm"
              style={{
                background: copied ? "#16A34A" : "#4B44DF",
              }}
            >
              {copied ? "✓ Copiato!" : "Copia"}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] font-bold text-green-600 mt-1.5 text-center animate-fade-in">
              Link copiato negli appunti! Pronto da incollare dove vuoi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
