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

  // Sync initial setup whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      if (initialBundle === "natale") {
        setCopies({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
      } else if (initialBundle === "trio") {
        setCopies({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
      } else if (defaultIssueNumber && defaultIssueNumber >= 1 && defaultIssueNumber <= 5) {
        setCopies({
          1: defaultIssueNumber === 1 ? 1 : 0,
          2: defaultIssueNumber === 2 ? 1 : 0,
          3: defaultIssueNumber === 3 ? 1 : 0,
          4: defaultIssueNumber === 4 ? 1 : 0,
          5: defaultIssueNumber === 5 ? 1 : 0,
        });
      } else {
        setCopies({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 });
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
      return { ...prev, [issueNum]: next };
    });
  };

  const selectTrioDeal = () => {
    setCopies({ 1: 1, 2: 1, 3: 1, 4: 0, 5: 0 });
  };

  const selectChristmasDeal = () => {
    setCopies({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
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
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-8 py-3 rounded-full font-black text-sm text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
              style={{ background: "#4B44DF" }}
            >
              Torna al sito
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6 pr-6">
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
            </div>

            {/* Offer Callout Banner */}
            <div
              className="p-4 rounded-2xl mb-6 space-y-3"
              style={{
                background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                border: "1.5px dashed #F59E0B",
              }}
            >
              {/* Row 1: Trio Deal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="text-left text-xs leading-relaxed">
                  <p className="font-black text-sm text-[#92400E] flex items-center gap-1.5 mb-0.5">
                    <span>✨</span>
                    <span>5€ a copia (+2€ spedizione)</span>
                  </p>
                  <p className="text-gray-700">
                    🌟 <strong>Offerta Trio: 3 numeri a soli 13€</strong> (+ 2€ spedizione).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={selectTrioDeal}
                  className="text-xs font-black px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
                >
                  ⚡ Scegli Trio (13€)
                </button>
              </div>

              {/* Row 2: Brilliant Red Christmas Offer Button */}
              <div className="pt-3 border-t border-amber-300/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="text-left text-xs leading-relaxed">
                  <p className="font-black text-sm text-red-700 flex items-center gap-1.5 mb-0.5">
                    <span>🎄</span>
                    <span>Speciale Natale: I primi 5 numeri a 20€</span>
                  </p>
                  <p className="text-red-900 font-semibold">
                    🎁 <strong>Tutti e 5 i primi numeri fisici</strong> a soli 20€ — <strong>spese di spedizione comprese!</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={selectChristmasDeal}
                  className="w-full sm:w-auto text-xs font-black px-4 py-2.5 rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-red-300 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)",
                    boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
                  }}
                >
                  <span>🎄</span>
                  <span>Offerta Natale: 5 Numeri a 20€ (Sped. Inclusa!)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. SELEZIONE DEI GUSTI */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  1. Scegli le copie per ciascun gusto:
                </label>
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
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-red-300 bg-red-50/70 sm:col-span-2 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎄</span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-black text-xs text-red-950 leading-tight">N.5 Edizione di Natale</p>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.2 rounded-full font-mono">
                            Speciale Natale
                          </span>
                        </div>
                        <p className="text-[10px] text-red-800 font-medium">Dicembre 2026 · Il 5° volume da collezione</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-red-200 shadow-xs">
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
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal Pill */}
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <span className="font-bold text-gray-700">Totale selezionato: </span>
                    <span className="font-black text-purple-700">{totalCopies} {totalCopies === 1 ? "copia" : "copie"}</span>
                    {isChristmasDeal && (
                      <span className="ml-2 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        🎄 Offerta Natale applicata (Sped. Gratuita!)
                      </span>
                    )}
                    {!isChristmasDeal && isTrioDeal && (
                      <span className="ml-2 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        🎉 Sconto Trio Applicato!
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">
                      Copie: {copiesPrice}€ + Sped: {shippingCost === 0 ? "0€ (Inclusa!)" : `${shippingCost}€`} ={" "}
                    </span>
                    <strong className="text-sm font-black text-gray-900">{totalPrice}€</strong>
                  </div>
                </div>
              </div>

              {/* 2. DATI DI CONTATTO */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  2. I tuoi dati:
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

              {/* 3. OPZIONE REGALO & INDIRIZZO SPEDIZIONE */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  3. Indirizzo di Spedizione:
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

              {/* 4. MESSAGGIO / DEDICA */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1 font-mono">
                  4. Messaggio o dedica per il pacchetto:
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
