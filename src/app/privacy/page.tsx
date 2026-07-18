"use client";
import Link from "next/link";
import { useEffect } from "react";

const BLUE = "#4B44DF";
const BLUE_MID = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const LAVENDER = "#EDE9FF";
const DARK = "#1C1A4A";
const CREAM = "#F5EDD8";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen py-16 px-6 font-sans selection:bg-[#B8B3FF] selection:text-[#1C1A4A]"
      style={{
        backgroundColor: DARK,
        color: LAVENDER,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:-translate-x-1"
            style={{ color: BLUE_LIGHT }}
          >
            ← Torna alla Home
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <p
            className="text-xs tracking-[0.5em] uppercase mb-3 font-bold"
            style={{ color: BLUE_LIGHT, fontFamily: "'Space Mono', monospace" }}
          >
            Informativa Legale
          </p>
          <h1
            className="font-black mb-4 leading-tight text-white"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Privacy & Cookie <span className="italic font-normal" style={{ color: BLUE_LIGHT }}>Policy</span>
          </h1>
          <p className="text-sm text-slate-400">
            Ultimo aggiornamento: 18 Luglio 2026 · Collettivo Gelatina
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-slate-300 leading-relaxed text-base">
          {/* Intro */}
          <section className="space-y-4">
            <p>
              Benvenuto sul sito del <strong>Collettivo Gelatina</strong> (collettivo-gelatina.vercel.app).
              La tua privacy è fondamentale per noi. In questa pagina ti spieghiamo quali dati personali raccogliamo, come li usiamo, le basi giuridiche e come puoi esercitare i tuoi diritti in conformità con il Regolamento Generale sulla Protezione dei Dati dell'Unione Europea (GDPR).
            </p>
          </section>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              1. Titolare del Trattamento dei Dati
            </h2>
            <p>
              Il titolare del trattamento dei dati raccolti tramite questo sito è:
            </p>
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderColor: "rgba(184, 179, 255, 0.15)",
              }}
            >
              <p className="font-bold text-white mb-1">Collettivo Gelatina</p>
              <p className="text-sm">Associazione e collettivo artistico di Poetry Slam</p>
              <p className="text-sm">Latina, Lazio, Italia</p>
              <p className="text-sm mt-2">
                Email di contatto:{" "}
                <a href="mailto:collettivogelatina@gmail.com" className="underline" style={{ color: BLUE_LIGHT }}>
                  collettivogelatina@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              2. Tipologie di Dati Raccolti
            </h2>
            <p>
              Raccogliamo e trattiamo diverse tipologie di dati a seconda dell'interazione con il sito:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Candidatura Poeti ("Sei un poeta?")</strong>: Raccogliamo il tuo nome/pseudonimo, la tua email, il titolo della poesia e qualsiasi nota inserita nel modulo. Successivamente, se inviato, il file PDF/DOC contenente la tua opera.
              </li>
              <li>
                <strong>Registrazione Audio (VoiceMic)</strong>: Se decidi di registrare una poesia vocale tramite il nostro microfono virtuale, la registrazione audio viene caricata e memorizzata sul nostro database Supabase.
              </li>
              <li>
                <strong>Dati di navigazione e tecnici</strong>: Dati anonimi trasmessi durante la navigazione, come l'indirizzo IP, dati del browser, tempi di permanenza, e le scelte sul consenso dei cookie.
              </li>
              <li>
                <strong>Piattaforme di terze parti</strong>: Interazioni con widget esterni (feed di Instagram caricato tramite Behold.so; widget di e-commerce e preordini tramite Gumroad).
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              3. Finalità del Trattamento e Base Giuridica
            </h2>
            <p>
              Trattiamo i tuoi dati esclusivamente per le seguenti finalità:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(184, 179, 255, 0.1)",
                }}
              >
                <h4 className="font-bold text-white mb-2 text-sm">Candidature e Pubblicazione</h4>
                <p className="text-xs text-slate-400">
                  Valutare le poesie inviate per inserirle nella zine mensile <em>Gelatino</em> o per la partecipazione ai nostri slam. La base giuridica è il tuo esplicito consenso fornito all'invio del modulo.
                </p>
              </div>
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(184, 179, 255, 0.1)",
                }}
              >
                <h4 className="font-bold text-white mb-2 text-sm">Open Mic Vocale</h4>
                <p className="text-xs text-slate-400">
                  Consentire l'ascolto e la condivisione delle poesie lette dagli utenti registrandosi tramite VoiceMic. La base giuridica è il tuo consenso nell'attivare il microfono e salvare la registrazione.
                </p>
              </div>
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(184, 179, 255, 0.1)",
                }}
              >
                <h4 className="font-bold text-white mb-2 text-sm">Esperienza Utente</h4>
                <p className="text-xs text-slate-400">
                  Mostrare il nostro feed di Instagram e consentire l'acquisto della rivista o dei biglietti tramite Gumroad. La base giuridica è il legittimo interesse a presentare le attività del collettivo.
                </p>
              </div>
              <div
                className="p-5 rounded-2xl border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(184, 179, 255, 0.1)",
                }}
              >
                <h4 className="font-bold text-white mb-2 text-sm">Adempimenti di Legge</h4>
                <p className="text-xs text-slate-400">
                  Garantire il rispetto delle normative vigenti, incluse quelle fiscali relative a eventuali acquisti e la gestione delle richieste sui diritti di privacy degli interessati.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              4. Conservazione dei Dati
            </h2>
            <p>
              I dati personali (candidature) sono conservati esclusivamente per il tempo necessario alla gestione delle selezioni letterarie della rivista <em>Gelatino</em>. Le registrazioni audio su Supabase rimangono archiviate finché la funzionalità è attiva, a meno che tu non ne richieda la rimozione. I dati tecnici dei cookie seguono i tempi di scadenza indicati nella Cookie Policy di ciascun servizio terzo.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              5. Servizi di Terze Parti e Cookie
            </h2>
            <p>
              Questo sito non utilizza cookie di profilazione diretta. Utilizza tuttavia servizi terzi che potrebbero installare cookie e tracciare la tua navigazione:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Instagram Feed (Behold.so)</strong>: Utilizzato per mostrare le foto del nostro profilo Instagram sulla home page. Rinviamo alla privacy policy di Behold.so e Meta per la gestione dei relativi cookie.
              </li>
              <li>
                <strong>Gumroad</strong>: Utilizzato per gestire l'acquisto e il preordine di copie cartacee o PDF di Gelatino. Rinviamo alla privacy policy di Gumroad Inc. per i dati relativi alle transazioni.
              </li>
              <li>
                <strong>Supabase</strong>: Fornisce l'infrastruttura backend per il caricamento in cloud dei file audio registrati tramite VoiceMic. I dati rimangono in spazi europei e protetti.
              </li>
              <li>
                <strong>Google Fonts</strong>: Carichiamo i font tipografici in modo da ottimizzare l'aspetto estetico. Le chiamate alle API dei font possono trasmettere dati tecnici anonimi a Google.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              6. Diritti dell'Utente
            </h2>
            <p>
              In qualità di interessato, hai il diritto in qualunque momento di chiedere al Titolare del Trattamento:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>L'<strong>accesso</strong> ai tuoi dati personali da noi conservati.</li>
              <li>La <strong>rettifica</strong> o correzione di dati inesatti.</li>
              <li>La <strong>cancellazione</strong> dei tuoi dati (es. rimozione di una registrazione audio o di una candidatura passata).</li>
              <li>La <strong>limitazione</strong> del trattamento dei dati o l'opposizione allo stesso.</li>
              <li>La <strong>revoca del consenso</strong> in qualsiasi momento, senza pregiudicare la liceità del trattamento basata sul consenso prestato prima della revoca.</li>
            </ul>
            <p>
              Per esercitare uno qualsiasi di questi diritti, puoi inviare una richiesta scritta via email a:{" "}
              <a href="mailto:collettivogelatina@gmail.com" className="underline" style={{ color: BLUE_LIGHT }}>
                collettivogelatina@gmail.com
              </a>. Risponderemo tempestivamente alla tua richiesta.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              7. Modifiche alla presente Policy
            </h2>
            <p>
              Ci riserviamo il diritto di apportare modifiche alla presente Privacy & Cookie Policy in qualunque momento. Ti consigliamo di consultare regolarmente questa pagina per rimanere aggiornato, facendo riferimento alla data dell'ultimo aggiornamento indicata all'inizio.
            </p>
          </section>
        </div>

        {/* Footer info inside Privacy */}
        <div className="border-t border-white/10 mt-16 pt-8 text-center text-xs text-slate-500">
          <p>© 2026 Collettivo Gelatina. Spoken Word · Latina, Italia.</p>
        </div>
      </div>
    </div>
  );
}
