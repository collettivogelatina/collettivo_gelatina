"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const BLUE = "#4B44DF";
const BLUE_MID = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const DARK = "#1C1A4A";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay for smooth entrance
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999] p-6 rounded-3xl border shadow-2xl transition-all duration-500 animate-slide-up flex flex-col gap-4 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(28, 26, 74, 0.95)", // DARK with opacity
        borderColor: "rgba(184, 179, 255, 0.25)", // BLUE_LIGHT border
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" role="img" aria-label="Cookie">
          🍪
        </span>
        <div className="flex flex-col gap-1">
          <h4
            className="font-black text-sm tracking-wider uppercase"
            style={{ color: BLUE_LIGHT, fontFamily: "'Space Mono', monospace" }}
          >
            Consenso Cookie
          </h4>
          <p className="text-xs leading-relaxed text-slate-200">
            Questo sito utilizza cookie tecnici e di terze parti (Instagram feed, Gumroad e Supabase) per migliorare la tua esperienza e raccogliere candidature.
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 leading-normal border-t border-slate-700/50 pt-3">
        Accettando acconsenti all'uso dei cookie. Puoi leggere i dettagli e modificare le tue scelte nella nostra{" "}
        <Link
          href="/privacy"
          className="underline hover:text-white transition-colors font-bold"
          style={{ color: BLUE_LIGHT }}
        >
          Privacy & Cookie Policy
        </Link>
        .
      </div>

      <div className="flex items-center justify-end gap-3 mt-1">
        <button
          onClick={handleDecline}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
        >
          Rifiuta
        </button>
        <button
          onClick={handleAccept}
          className="px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-[1.02] shadow-md shadow-indigo-900/40 text-white"
          style={{
            background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          }}
        >
          Accetta tutto
        </button>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
