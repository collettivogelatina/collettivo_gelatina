"use client";

import React, { useState, useEffect } from "react";

interface OrderPrintedGelatinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIssueNumber?: number;
  initialBundle?: "trio" | "natale" | null;
}

export default function OrderPrintedGelatinoModal({
  isOpen,
  onClose,
  defaultIssueNumber,
  initialBundle,
}: OrderPrintedGelatinoModalProps) {
  const [copies, setCopies] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  const [selectedFormula, setSelectedFormula] = useState<"natale" | "trio" | "custom">("natale");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState("");
  const [cityCap, setCityCap] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync initial setup whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialBundle === "natale") {
        setSelectedFormula("natale");
        setCopies({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
      } else if (initialBundle === "trio") {
        setSelectedFormula("trio");
        setCopies({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
      } else if (defaultIssueNumber && defaultIssueNumber >= 1 && defaultIssueNumber <= 5) {
        setSelectedFormula("custom");
        setCopies({
          1: defaultIssueNumber === 1 ? 1 : 0,
          2: defaultIssueNumber === 2 ? 1 : 0,
          3: defaultIssueNumber === 3 ? 1 : 0,
          4: defaultIssueNumber === 4 ? 1 : 0,
          5: defaultIssueNumber === 5 ? 1 : 0,
        });
      } else {
        setSelectedFormula("natale");
        setCopies({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
      }
    }
  }, [isOpen, defaultIssueNumber, initialBundle]);

  if (!isOpen) return null;

  const totalCopies =
    (copies[1] || 0) +
    (copies[2] || 0) +
    (copies[3] || 0) +
    (copies[4] || 0) +
    (copies[5] || 0);

  // Price Calculation:
  // - 1-2 copies: 5€ each + 2€ shipping
  // - 3 copies (Trio): 13€ + 2€ shipping = 15€
  // - 4 copies: 18€ + 2€ shipping = 20€
  // - 5 copies (Offerta Natale - tutti i primi 5 numeri): 20€ flat (spese di spedizione COMPRESE!)
  // - >5 copies: 20€ + 4€ per extra copy (spedizione compresa)
  let copiesPrice = 0;
  let shippingCost = 0;
  let isChristmasDeal = false;
  let isTrioDeal = false;

  if (totalCopies === 0) {
    copiesPrice = 0;
    shippingCost = 0;
  } else if (totalCopies === 5) {
    copiesPrice = 20;
    shippingCost = 0; // Spese di spedizione comprese!
    isChristmasDeal = true;
  } else if (totalCopies === 3) {
    copiesPrice = 13;
    shippingCost = 2;
    isTrioDeal = true;
  } else if (totalCopies < 3) {
    copiesPrice = totalCopies * 5;
    shippingCost = 2;
  } else if (totalCopies === 4) {
    copiesPrice = 18;
    shippingCost = 2;
    isTrioDeal = true;
  } else {
    // More than 5
    copiesPrice = 20 + (totalCopies - 5) * 4;
    shippingCost = 0;
    isChristmasDeal = true;
  }

  const totalPrice = copiesPrice + shippingCost;

  const updateQuantity = (issueNum: number, delta: number) => {
    setCopies((prev) => {
      const current = prev[issueNum] || 0;
      const next = Math.max(0, current + delta);
      const nextMap = { ...prev, [issueNum]: next };
      const nextTotal =
        (nextMap[1] || 0) +
        (nextMap[2] || 0) +
        (nextMap[3] || 0) +
        (nextMap[4] || 0) +
        (nextMap[5] || 0);

      if (
        nextTotal === 5 &&
        nextMap[1] >= 1 &&
        nextMap[2] >= 1 &&
        nextMap[3] >= 1 &&
        nextMap[4] >= 1 &&
        nextMap[5] >= 1
      ) {
        setSelectedFormula("natale");
      } else if (nextTotal === 3) {
        setSelectedFormula("trio");
      } else {
        setSelectedFormula("custom");
      }
      return nextMap;
    });
  };

  const handleSelectFormula = (f: "natale" | "trio" | "custom") => {
    setSelectedFormula(f);
    if (f === "natale") {
      setCopies({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    } else if (f === "trio") {
      setCopies({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
    } else if (f === "custom") {
      if (totalCopies === 0) {
        setCopies({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 });
      }
    }
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      const base = window.location.origin;
      if (selectedFormula === "natale") return `${base}/?ordina=gelatino&bundle=natale#ordina-gelatino`;
      if (selectedFormula === "trio") return `${base}/?ordina=gelatino&bundle=trio#ordina-gelatino`;
      return `${base}/?ordina=gelatino#ordina-gelatino`;
    }
    return "https://www.collettivogelatina.it/?ordina=gelatino";
  };

  const getShareText = () => {
    if (selectedFormula === "natale") {
      return "🎄 Ordina o regala il Cofanetto di Natale di Gelatino: tutti i 5 numeri fisici a soli 20€ con spedizione inclusa e dedica regalo!";
    }
    if (selectedFormula === "trio") {
      return "🌟 Ordina l'Offerta Trio di Gelatino su carta: 3 numeri a scelta a soli 13€ (+2€ sped.) con dedica regalo inclusa!";
    }
    return "📦 Ordina o regala le copie cartacee da collezione di Gelatino (da 5€ a copia) con dedica inclusa:";
  };

  const handleShareForm = async () => {
    const url = getShareUrl();
    const text = getShareText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Ordina o Regala Gelatino su Carta — Collettivo Gelatina",
          text,
          url,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setShowSharePanel((prev) => !prev);
        }
      }
    } else {
      setShowSharePanel((prev) => !prev);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${getShareText()}\n${getShareUrl()}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCopies === 0) {
      setErrorMsg("Seleziona almeno 1 copia di un Gelatino.");
      return;
    }
    if (!name.trim() || !email.trim() || !address.trim() || !cityCap.trim()) {
      setErrorMsg("Compila tutti i campi obbligatori contrassegnati con l'asterisco.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const issuesSummary = [
      copies[1] > 0 ? `N.1 Gusto Puffo: ${copies[1]} cop.` : null,
      copies[2] > 0 ? `N.2 Gusto Limone: ${copies[2]} cop.` : null,
      copies[3] > 0 ? `N.3 Gusto Menta e Basilico: ${copies[3]} cop.` : null,
      copies[4] > 0 ? `N.4 Gusto Zucca e Amaretto: ${copies[4]} cop.` : null,
      copies[5] > 0 ? `N.5 Edizione di Natale: ${copies[5]} cop.` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const res = await fetch("https://formsubmit.co/ajax/collettivogelatina@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `📦 Nuovo Ordine Gelatino Cartaceo da ${name} (${totalCopies} copie - ${totalPrice}€${isChristmasDeal ? " - OFFERTA NATALE" : ""})`,
          _replyto: email,
          "Nome e Cognome": name,
          Email: email,
          Telefono_WhatsApp: phone || "Non indicato",
          "Totale Copie": totalCopies,
          "Dettaglio Copie": issuesSummary,
          "Costo Copie (€)": copiesPrice,
          "Spese Spedizione (€)": shippingCost === 0 ? "0 € (COMPRESE NELL'OFFERTA)" : `${shippingCost} €`,
          "Totale Finale (€)": totalPrice,
          "Offerta Applicata": isChristmasDeal
            ? "🎄 OFFERTA DI NATALE (Tutti e 5 i numeri a 20€ con spedizione inclusa)"
            : isTrioDeal
            ? "🌟 OFFERTA TRIO (13€ per 3 copie + 2€ spedizione)"
            : "Prezzo standard (5€ a copia)",
          "È un regalo per terzi": isGift ? `SÌ, destinatario: ${recipientName || "Vedi indirizzo"}` : "No (per me)",
          "Indirizzo di Consegna": address,
          "Città e CAP": cityCap,
          "Messaggio o Dedica nel Pacchetto": personalNote || "Nessun messaggio aggiuntivo",
        }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        throw new Error("Errore nell'invio");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Qualcosa è andato storto nell'invio. Puoi comunque scriverci via email a collettivogelatina@gmail.com.");
    }
  };

  const handleResetAndClose = () => {
    setStatus("idle");
    setErrorMsg("");
    setShowSharePanel(false);
    setCopiedLink(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative my-8 border-2 border-amber-300 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsante Condividi */}
        <button
          type="button"
          onClick={handleShareForm}
          className="absolute top-4 right-15 h-9 px-3 flex items-center justify-center gap-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs transition-all cursor-pointer z-10 shadow-xs"
          title="Condividi il modulo d'ordine"
        >
          <span>📲</span>
          <span className="hidden sm:inline">Condividi</span>
        </button>

        {/* Pulsante chiudi */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm transition-all cursor-pointer z-10"
          aria-label="Chiudi"
        >
          ✕
        </button>

        {status === "sent" ? (
          <div className="text-center py-10 px-2 animate-fade-in">
            <div className="text-6xl mb-4">📬 ✨</div>
            <span
              className="inline-block text-xs font-black tracking-widest uppercase font-mono px-3.5 py-1 rounded-full mb-3"
              style={{ background: "#DCFCE7", color: "#166534" }}
            >
              Richiesta Ricevuta con Successo
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F0E17] mb-3">
              Grazie, {name}!
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto mb-6">
              Abbiamo registrato la tua richiesta per <strong>{totalCopies} {totalCopies === 1 ? "copia" : "copie"}</strong> di Gelatino cartaceo (totale: <strong>{totalPrice}€</strong>
              {shippingCost === 0 ? " con spese di spedizione comprese!" : " con spedizione inclusa"}).
              <br /><br />
              Ti ricontatteremo prestissimo via <strong>email o WhatsApp</strong> per confermare l&apos;indirizzo e concordare il pagamento (PayPal, Bonifico, Satispay o PostePay) prima di spedire il pacchetto!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleShareForm}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-black text-xs sm:text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>📲</span>
                <span>{copiedLink ? "Link Copiato!" : "Consiglia o condividi con amici"}</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-8 py-3 rounded-full font-black text-sm text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                style={{ background: "#4B44DF" }}
              >
                Torna al sito
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-5 pr-14 sm:pr-0">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full mb-2"
                style={{ background: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E" }}
              >
                <span>📦</span>
                <span className="text-xs font-black tracking-wider uppercase font-mono">
                  Edizione Stampata da Collezione
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F0E17] leading-tight">
                Ordina o Spedisci Gelatino su Carta
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
                La poesia illustrata da toccare, sfogliare o regalare a una persona speciale.
              </p>

              {/* Tasto condividi pill sotto descrizione */}
              <div className="mt-2.5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleShareForm}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
                >
                  <span>📲</span>
                  <span>Condividi questo modulo o l&apos;offerta</span>
                </button>
              </div>
            </div>

            {/* Share Panel (visibile al click o quando navigator.share non è disponibile) */}
            {showSharePanel && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50/95 border-2 border-amber-300 animate-fade-in text-left shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>📲</span>
                    <span>Condividi il modulo d&apos;ordine:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSharePanel(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mb-3">
                  Invia il link diretto a chi desidera ordinare o ricevere le copie cartacee di Gelatino:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-white hover:bg-gray-50 border border-amber-300 text-amber-950 shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>📋</span>
                    <span>{copiedLink ? "Link Copiato!" : "Copia Link"}</span>
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${getShareText()} ${getShareUrl()}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#229ED9] hover:bg-[#1e8ec3] text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>✈️</span>
                    <span>Telegram</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>📘</span>
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            )}

            {/* ── 1. SELETTORE DELLE FORMULE D'ACQUISTO ── */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                1. Scegli la tua formula o offerta:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Opzione 1: Cofanetto Natale */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula("natale")}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedFormula === "natale" || isChristmasDeal
                      ? "border-rose-500 bg-rose-50/90 shadow-md ring-2 ring-rose-400/30"
                      : "border-gray-200 bg-white hover:border-rose-300 hover:bg-rose-50/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🎄</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full font-mono shadow-xs">
                        Offerta Top
                      </span>
                    </div>
                    <p className="font-black text-xs sm:text-sm text-rose-950 leading-tight">
                      Cofanetto Natale (5 Numeri)
                    </p>
                    <p className="text-sm font-black text-rose-700 mt-1">
                      20€ <span className="text-[10px] font-normal text-rose-900/80">(invece di 27€)</span>
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-rose-200/70 text-[10px] text-rose-900 font-semibold flex items-center gap-1">
                    <span>✨</span>
                    <span>Sped. GRATUITA Inclusa</span>
                  </div>
                </button>

                {/* Opzione 2: Trio */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula("trio")}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    (selectedFormula === "trio" || isTrioDeal) && !isChristmasDeal
                      ? "border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-400/30"
                      : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🌟</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full font-mono shadow-xs">
                        Risparmi 2€
                      </span>
                    </div>
                    <p className="font-black text-xs sm:text-sm text-amber-950 leading-tight">
                      Offerta Trio (3 Numeri)
                    </p>
                    <p className="text-sm font-black text-amber-800 mt-1">
                      13€ <span className="text-[10px] font-normal text-amber-900/80">(+2€ sped.)</span>
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-200/70 text-[10px] text-amber-900 font-semibold flex items-center gap-1">
                    <span>📚</span>
                    <span>3 gusti a tua scelta</span>
                  </div>
                </button>

                {/* Opzione 3: Personalizzata */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula("custom")}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedFormula === "custom" && !isChristmasDeal && !isTrioDeal
                      ? "border-purple-500 bg-purple-50/90 shadow-md ring-2 ring-purple-400/30"
                      : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">📖</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full font-mono shadow-xs">
                        Flessibile
                      </span>
                    </div>
                    <p className="font-black text-xs sm:text-sm text-purple-950 leading-tight">
                      Copia Singola / Libera
                    </p>
                    <p className="text-sm font-black text-purple-800 mt-1">
                      5€ <span className="text-[10px] font-normal text-purple-900/80">a copia (+2€ sped.)</span>
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-purple-200/70 text-[10px] text-purple-900 font-semibold flex items-center gap-1">
                    <span>✏️</span>
                    <span>Componi come vuoi</span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 2. SELEZIONE DEI GUSTI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 font-mono">
                    2. Personalizza o verifica le copie selezionate:
                  </label>
                  <span className="text-[11px] font-bold text-gray-500">
                    {totalCopies} {totalCopies === 1 ? "copia totale" : "copie totali"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Issue 1 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-blue-200 bg-blue-50/60">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🫐</span>
                      <div>
                        <p className="font-black text-xs text-blue-900 leading-tight">N.1 Gusto Puffo</p>
                        <p className="text-[10px] text-gray-500">Giugno 2026 · 32 pag.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-blue-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(1, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs text-gray-900">{copies[1] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(1, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Issue 2 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-yellow-200 bg-yellow-50/60">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍋</span>
                      <div>
                        <p className="font-black text-xs text-yellow-900 leading-tight">N.2 Gusto Limone</p>
                        <p className="text-[10px] text-gray-500">Giugno 2026 · 36 pag.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-yellow-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(2, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs text-gray-900">{copies[2] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(2, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Issue 3 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <p className="font-black text-xs text-emerald-900 leading-tight">N.3 Gusto Menta &amp; Basilico</p>
                        <p className="text-[10px] text-gray-500">Luglio 2026 · 36 pag.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-emerald-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(3, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs text-gray-900">{copies[3] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(3, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Issue 4 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-orange-200 bg-orange-50/60">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎃</span>
                      <div>
                        <p className="font-black text-xs text-orange-900 leading-tight">N.4 Gusto Zucca &amp; Amaretto</p>
                        <p className="text-[10px] text-gray-500">Novembre 2026 · 36 pag.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-orange-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(4, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs text-gray-900">{copies[4] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(4, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Issue 5 - Christmas Edition */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-rose-300 bg-rose-50/70 sm:col-span-2 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎄</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-black text-xs text-rose-950 leading-tight">N.5 Edizione di Natale</p>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.2 rounded-full font-mono">
                            Speciale Natale
                          </span>
                        </div>
                        <p className="text-[10px] text-rose-800 font-medium">Dicembre 2026 · Il 5° volume da collezione</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-rose-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(5, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-xs text-gray-900">{copies[5] || 0}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(5, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal Pill */}
                <div className={`mt-3 p-3.5 rounded-2xl border flex flex-wrap items-center justify-between text-xs gap-2 transition-colors ${
                  isChristmasDeal
                    ? "bg-rose-50/90 border-rose-300"
                    : isTrioDeal
                    ? "bg-amber-50/90 border-amber-300"
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <span className="font-bold text-gray-700">Riepilogo: </span>
                    <strong className="font-black text-gray-900">
                      {totalCopies} {totalCopies === 1 ? "copia" : "copie"}
                    </strong>
                    {isChristmasDeal && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                        <span>🎄</span> Spedizione Gratuita Compresa! (Risparmi 7€)
                      </span>
                    )}
                    {!isChristmasDeal && isTrioDeal && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                        <span>🌟</span> Sconto Trio Applicato (Risparmi 2€)!
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">
                      Copie: {copiesPrice}€ + Sped: {shippingCost === 0 ? "0€ (Inclusa!)" : `${shippingCost}€`} ={" "}
                    </span>
                    <strong className="text-base font-black text-gray-900">{totalPrice}€</strong>
                  </div>
                </div>
              </div>

              {/* 3. DATI DI CONTATTO */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  3. I tuoi dati:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      La tua Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mario.rossi@email.it"
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Cellulare / WhatsApp (facoltativo, per comunicazioni rapide)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="333 1234567"
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* 4. OPZIONE REGALO & INDIRIZZO SPEDIZIONE */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  4. Indirizzo di Spedizione:
                </label>

                {/* Toggle Regalo */}
                <div className="mb-3 p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <span className="text-xs font-bold text-purple-900">
                      È un regalo da spedire direttamente a un&apos;altra persona?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {isGift && (
                  <div className="mb-3 animate-fade-in">
                    <label className="block text-[11px] font-bold text-purple-800 mb-1">
                      Nome e Cognome del Destinatario del Regalo *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Giulia Bianchi"
                      className="w-full text-xs bg-white border border-purple-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Indirizzo e Numero Civico *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Via Garibaldi 12"
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Città, Provincia e CAP *
                    </label>
                    <input
                      type="text"
                      required
                      value={cityCap}
                      onChange={(e) => setCityCap(e.target.value)}
                      placeholder="Latina (LT) - 04100"
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-purple-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. MESSAGGIO / DEDICA */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1 font-mono">
                  5. Messaggio o dedica per il pacchetto (gratuita):
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Scrivi un messaggio o una dedica speciale: la inseriremo con cura all&apos;interno del plico postale!
                </p>
                <textarea
                  rows={3}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Es. Un piccolo dono di poesia per te, con affetto..."
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-purple-500 font-medium resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 text-center">
                  {errorMsg}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-xs text-gray-500">Nessun pagamento ora</p>
                  <p className="text-sm font-black text-gray-900">
                    Totale: <span className="text-purple-600 text-base">{totalPrice}€</span>{" "}
                    <span className="text-[11px] font-normal text-gray-500">
                      {shippingCost === 0 ? "(spese di spedizione incluse!)" : "(inclusa spedizione)"}
                    </span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={status === "sending" || totalCopies === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-sm text-white shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: isChristmasDeal
                      ? "linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)"
                      : "linear-gradient(135deg, #4B44DF 0%, #7A74FF 100%)",
                    boxShadow: isChristmasDeal
                      ? "0 8px 25px rgba(220, 38, 38, 0.45)"
                      : "0 8px 25px rgba(75, 68, 223, 0.35)",
                  }}
                >
                  {status === "sending" ? "Invio in corso..." : `Invia Richiesta d'Ordine (${totalPrice}€) →`}
                </button>
              </div>

              <p className="text-[11px] text-gray-400 text-center italic">
                * Riceverai una conferma via email o WhatsApp con le indicazioni per il pagamento (PayPal, Bonifico, Satispay o PostePay).
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
