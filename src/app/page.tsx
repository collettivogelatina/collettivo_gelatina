"use client";
import { useState, useEffect } from "react";
import VoiceMic from "@/components/VoiceMic";
import SlamTimeline from "@/components/SlamTimeline";

const BLUE = "#4B44DF";
const BLUE_MID = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const LAVENDER = "#EDE9FF";
const CREAM = "#F5EDD8";
const DARK = "#1C1A4A";

const events = [
  {
    date: "5 Luglio 2025",
    title: "Slam al Chiostro",
    venue: "Chiostro di San Domenico",
    time: "21:00",
    description:
      "Una notte di voci e versi nel cuore storico di Latina. Sali sul palco o siediti ad ascoltare chi lo fa.",
    tag: "OPEN MIC",
  },
  {
    date: "19 Luglio 2025",
    title: "Estate di Parole",
    venue: "Piazza del Quadrato",
    time: "20:30",
    description:
      "Slam all'aperto nel cuore della città razionalista. L'estate come sfondo, le parole come protagoniste.",
    tag: "SLAM",
  },
  {
    date: "2 Agosto 2025",
    title: "La Notte dei Poeti",
    venue: "Cantina Sociale · Pontinia",
    time: "22:00",
    description:
      "Poesia e vino rosso: abbinamenti imprevisti e versi che non si dimenticano facilmente.",
    tag: "SERATA SPECIALE",
  },
  {
    date: "16 Agosto 2025",
    title: "Ferragosto in Versi",
    venue: "Lido di Latina",
    time: "21:30",
    description:
      "La poesia incontra il mare. Una serata slam tra onde e parole, sabbia e microfoni aperti a tutti.",
    tag: "SLAM",
  },
];

const issues = [
  {
    number: 1,
    flavor: "Gusto Puffo",
    emoji: "🫐",
    tagline: "Il primo numero. Poesie illustrate che colorano di blu.",
    price: 2,
    url: "https://closurecomics.gumroad.com/l/Gelatinodigitale1",
    preorder: false,
    cover: "/Gelatina1Cover.jpeg",
    c: {
      primary: "#3B6FE8",
      bg: "#EEF2FF",
      border: "#A8BCFF",
      stripe: "linear-gradient(135deg, #3B6FE8 0%, #7090FF 100%)",
      badge: "#EEF2FF",
      badgeText: "#3B6FE8",
    },
  },
  {
    number: 2,
    flavor: "Gusto Limone",
    emoji: "🍋",
    tagline: "Il secondo numero. Poesie illustrate — aspre, luminose, inattese.",
    price: 2,
    url: "https://closurecomics.gumroad.com/l/Gelatino2",
    preorder: false,
    cover: "/Gelatina2Cover.jpeg",
    c: {
      primary: "#C49200",
      bg: "#FFFDE8",
      border: "#FFE066",
      stripe: "linear-gradient(135deg, #E8B800 0%, #FFD740 100%)",
      badge: "#FFFDE8",
      badgeText: "#A07800",
    },
  },
  {
    number: 3,
    flavor: "Gusto Menta e Basilico",
    emoji: "🌿",
    tagline: "Il terzo numero illustrato — fresco e balsamico. Ora disponibile!",
    price: 2,
    url: "https://closurecomics.gumroad.com/l/Gelatino3",
    preorder: false,
    cover: "/Gelatina3cover.jpeg",
    c: {
      primary: "#2A8A5A",
      bg: "#E8F8F0",
      border: "#80D4A8",
      stripe: "linear-gradient(135deg, #2A8A5A 0%, #3DC878 100%)",
      badge: "#E8F8F0",
      badgeText: "#2A8A5A",
    },
  },
  {
    number: 4,
    flavor: "Gusto Cocomero",
    emoji: "🍉",
    tagline: "Il quarto numero illustrato — in arrivo. Prenota la tua copia.",
    price: 2,
    url: "mailto:collettivogelatina@gmail.com?subject=Preordine%20Gelatino%20N.4%20Gusto%20Cocomero",
    preorder: true,
    cover: null,
    c: {
      primary: "#E63946",
      bg: "#FFF0F2",
      border: "#FFA3B1",
      stripe: "linear-gradient(135deg, #E63946 0%, #FF6B6B 100%)",
      badge: "#FFF0F2",
      badgeText: "#E63946",
    },
  },
];

const members = [
  { name: "Aldo Sorrentino",       role: "Fondastorie", initial: "AS", gradient: ["#4B44DF", "#7A74FF"], size: 130, rot: -4 },
  { name: "Francesco Mastrostefano", role: "Fondastorie", initial: "FM", gradient: ["#6060F0", "#9895FF"], size: 124, rot:  3 },
  { name: "Julia Vignapiano",      role: "Poeta",       initial: "JV", gradient: ["#7A74FF", "#A09BFF"], size: 118, rot: -2 },
  { name: "Flavio Riccardi",       role: "Poeta",       initial: "FR", gradient: ["#8A85FF", "#C8C4FF"], size: 120, rot:  5 },
  { name: "Joe P.",                role: "Poeta",       initial: "JP", gradient: ["#9895FF", "#D0CDFF"], size: 116, rot: -3, image: "/Joe_p.png" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [gelatinFormat, setGelatinFormat] = useState<"pdf" | "cartaceo">("pdf");
  const [poetryName, setPoetryName] = useState("");
  const [poetryEmail, setPoetryEmail] = useState("");
  const [poetryTitle, setPoetryTitle] = useState("");
  const [poetryNote, setPoetryNote] = useState("");
  const [poetrySending, setPoetrySending] = useState(false);
  const [poetryDone, setPoetryDone] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handlePoetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoetrySending(true);
    try {
      await fetch("https://alluring-encouragement-production.up.railway.app/public/lead_v3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: poetryName,
          email: poetryEmail,
          message: `Invio poesia: "${poetryTitle}"\n\n${poetryNote}`,
        }),
      });
    } catch {}
    setPoetryDone(true);
    setPoetrySending(false);
  };


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", color: DARK }}>

      {/* ── BOTTONE FLOTTANTE VOTA LIVE ── */}
      <a
        href="/vota-live"
        aria-label="Vota in Livestream"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
          color: "white",
          borderRadius: 50,
          padding: "13px 20px 13px 14px",
          boxShadow: `0 8px 28px ${BLUE}66, 0 2px 8px rgba(0,0,0,0.18)`,
          textDecoration: "none",
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: "0.88rem",
          letterSpacing: "0.01em",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.07)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 36px ${BLUE}88, 0 2px 10px rgba(0,0,0,0.22)`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 28px ${BLUE}66, 0 2px 8px rgba(0,0,0,0.18)`;
        }}
      >
        {/* Pallina pulse */}
        <span style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          fontSize: "1.25rem",
          flexShrink: 0,
        }}>
          🤚
          <span style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.35)",
            animation: "votePulse 2s ease-in-out infinite",
          }} />
        </span>
        <span style={{ lineHeight: 1.2 }}>
          Vota<br />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, opacity: 0.75 }}>Livestream →</span>
        </span>
        <style>{`
          @keyframes votePulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.35); opacity: 0; }
          }
        `}</style>
      </a>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(75,68,223,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="#"
            className="font-black text-xl tracking-tight transition-colors"
            style={{ color: scrolled ? BLUE : "white", fontFamily: "'Nunito', sans-serif" }}
          >
            Gelatina
          </a>

          <div className="hidden md:flex items-center gap-7">
            {[
              { label: "Chi Siamo", href: "#chi-siamo" },
              { label: "Slam", href: "#slam" },
              { label: "Gelatino", href: "#gelatino" },
              { label: "Open Mic", href: "#open-mic" },
              { label: "Contatti", href: "#contatti" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold tracking-wide transition-opacity hover:opacity-60"
                style={{ color: scrolled ? DARK : "white" }}
              >
                {item.label}
              </a>
            ))}
            <a
              href="mailto:collettivogelatina@gmail.com?subject=Acquisto%20Gelatino"
              className="px-5 py-2 rounded-full text-sm font-black transition-all"
              style={{
                background: scrolled ? BLUE : "white",
                color: scrolled ? "white" : BLUE,
              }}
            >
              Gelatino →
            </a>
          </div>

          <button
            className="md:hidden p-1 transition-colors"
            style={{ color: scrolled ? DARK : "white" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-4"
            style={{ background: "white", borderTop: `2px solid ${LAVENDER}` }}
          >
            {["Chi Siamo", "Slam", "Gelatino", "Open Mic", "Contatti"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMenuOpen(false)}
                className="font-bold py-2 border-b text-base"
                style={{ color: DARK, borderColor: LAVENDER }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
        style={{
          background: `linear-gradient(160deg, ${BLUE} 0%, ${BLUE_MID} 28%, ${BLUE_LIGHT} 55%, #D8D4FF 72%, #F0EEFF 87%, #FAFAFF 100%)`,
        }}
      >
        {/* Floating blobs */}
        <div
          className="absolute blob-float"
          style={{
            top: "8%", left: "6%",
            width: 180, height: 180,
            borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
            background: "rgba(255,255,255,0.12)",
          }}
        />
        <div
          className="absolute blob-float-slow"
          style={{
            top: "15%", right: "8%",
            width: 120, height: 120,
            borderRadius: "40% 60% 70% 30% / 50% 60% 40% 60%",
            background: "rgba(255,255,255,0.10)",
          }}
        />
        <div
          className="absolute blob-float"
          style={{
            bottom: "18%", left: "12%",
            width: 90, height: 90,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          className="absolute blob-float-slow"
          style={{
            bottom: "22%", right: "14%",
            width: 150, height: 150,
            borderRadius: "50% 50% 40% 60% / 40% 60% 40% 60%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        {/* Playful dots */}
        {[
          { top: "30%", left: "20%",  size: 10 },
          { top: "55%", left: "8%",   size: 6  },
          { top: "70%", right: "22%", size: 8  },
          { top: "20%", right: "30%", size: 12 },
          { top: "82%", left: "35%",  size: 7  },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full blob-float"
            style={{
              ...dot,
              width: dot.size,
              height: dot.size,
              background: "rgba(255,255,255,0.35)",
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <img
            src="/logo_gelatina.jpeg"
            alt="Gelatina"
            className="mb-6 shadow-2xl"
            style={{
              width: "clamp(160px, 30vw, 260px)",
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.3)",
            }}
          />

          <p
            className="text-white/60 tracking-[0.6em] text-xs uppercase mb-5"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Latina, Italia · Dal 2023
          </p>

          <h1
            className="text-white font-black leading-tight mb-4"
            style={{
              fontSize: "clamp(1.8rem, 6vw, 4.5rem)",
              textShadow: "0 2px 30px rgba(75,68,223,0.3)",
            }}
          >
            Spoken Word.<br />
            Slam. Comunità.
          </h1>

          <p
            className="text-white/80 text-lg md:text-xl max-w-lg mb-10 leading-relaxed"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            "Un collettivo di voci diverse che si incontrano ogni mese
            a Latina per creare, ascoltare, trasformare."
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#slam"
              className="font-black text-sm px-9 py-3.5 rounded-full transition-all hover:scale-105"
              style={{ background: "white", color: BLUE }}
            >
              Prossimi Slam →
            </a>
            <a
              href="#gelatino"
              className="font-black text-sm px-9 py-3.5 rounded-full border-2 border-white text-white transition-all hover:bg-white hover:scale-105"
              style={{ color: "white" }}
            >
              Scopri Gelatino
            </a>
          </div>

          <div className="mt-16 text-white/30 text-xs tracking-[0.4em] uppercase animate-bounce">
            ↓ scorri
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "#FAFAFF" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p
              className="text-xs tracking-[0.5em] uppercase mb-4 font-bold"
              style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
            >
              @collettivogelatina
            </p>
            <h2
              className="font-black leading-tight mb-3"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)", color: DARK }}
            >
              Seguici su{" "}
              <a
                href="https://www.instagram.com/collettivogelatina"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: BLUE }}
              >
                Instagram
              </a>
            </h2>
            <p className="text-base" style={{ color: "#6B68A8" }}>
              Slam, backstage, versi rubati al volo.
            </p>
          </div>

          <div style={{ borderRadius: 24, overflow: "hidden" }}>
            {/* @ts-expect-error behold custom element */}
            <behold-widget feed-id="pRyGntLXTU1nW87ewyV4" />
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/collettivogelatina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-black text-sm px-8 py-3 rounded-full transition-all hover:scale-105"
              style={{ background: LAVENDER, color: BLUE }}
            >
              Vedi tutto su Instagram →
            </a>
          </div>
        </div>
      </section>

      {/* ── PROSSIMI SLAM ── */}
      <section id="slam" className="py-32 relative" style={{ background: LAVENDER }}>
        <div
          className="absolute -bottom-16 -left-16 opacity-30"
          style={{
            width: 300, height: 300,
            borderRadius: "40% 60% 70% 30% / 60% 40% 60% 40%",
            background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
          }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p
                className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
                style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
              >
                02 · Slam
              </p>
              <h2
                className="font-black leading-tight"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: DARK }}
              >
                Prossimi<br />
                <span style={{ color: BLUE }}>Appuntamenti</span>
              </h2>
            </div>
            <p className="text-sm font-semibold max-w-xs leading-relaxed" style={{ color: "#6B68A8" }}>
              Sali sul palco o siediti ad ascoltare. In entrambi i casi,
              sarai parte di qualcosa che non dimenticherai.
            </p>
          </div>

          <SlamTimeline />

          {/* ── LIPS badge ── */}
          <div
            className="mt-12 flex flex-col sm:flex-row items-center gap-5 p-6 rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${LAVENDER} 0%, #DDD8FF 100%)`,
              border: `1.5px solid ${BLUE_LIGHT}`,
            }}
          >
            {/* Icon / logo placeholder */}
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: BLUE, color: "white", fontFamily: "'Space Mono', monospace", letterSpacing: "-0.05em" }}
            >
              🎙️
            </div>

            <div className="flex-grow text-center sm:text-left">
              <p
                className="text-xs font-bold tracking-[0.35em] uppercase mb-1"
                style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
              >
                Affiliati LIPS
              </p>
              <p className="font-black text-base mb-1" style={{ color: DARK }}>
                I nostri slam sono ufficiali per la{" "}
                <a
                  href="https://www.lipslam.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-75 transition-opacity"
                  style={{ color: BLUE }}
                >
                  LIPS — Lega Italiana Poetry Slam
                </a>
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#4A4880" }}>
                Ogni evento di Gelatina fa parte del circuito ufficiale LIPS: i punteggi sono validi
                per le qualificazioni al{" "}
                <strong style={{ color: DARK }}>Campionato Italiano di Poetry Slam</strong>.
                Se sei un poeta agonistico, sali sul palco — conta davvero.
              </p>
            </div>

            <a
              href="https://www.lipslam.it"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-black px-5 py-3 rounded-full transition-all hover:scale-105 whitespace-nowrap"
              style={{ background: BLUE, color: "white" }}
            >
              Scopri la LIPS →
            </a>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm font-semibold mb-2" style={{ color: "#9896CC" }}>
              Vuoi ospitare uno slam nel tuo locale?
            </p>
            <a href="#contatti" className="text-sm font-black hover:underline" style={{ color: BLUE }}>
              Scrivici →
            </a>
          </div>
        </div>
      </section>

      {/* ── CHI SIAMO ── */}
      <section id="chi-siamo" className="py-32 relative overflow-hidden" style={{ background: "#FAFAFF" }}>
        {/* Decorative blob */}
        <div
          className="absolute -top-20 -right-20 opacity-20"
          style={{
            width: 400, height: 400,
            borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
            background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE_MID})`,
          }}
        />
        {/* Scattered dots */}
        {[
          { top: "12%", left: "5%",   size: 14, opacity: 0.25 },
          { top: "60%", left: "2%",   size: 8,  opacity: 0.18 },
          { bottom: "10%", right: "5%", size: 12, opacity: 0.22 },
          { top: "40%", right: "3%",  size: 6,  opacity: 0.15 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full blob-float"
            style={{
              ...dot,
              width: dot.size,
              height: dot.size,
              background: BLUE_MID,
              animationDelay: `${i * 1.8}s`,
            }}
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
            <div>
              <p
                className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
                style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
              >
                01 · Chi Siamo
              </p>
              <h2
                className="font-black mb-8 leading-tight"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: DARK }}
              >
                Un collettivo nato<br />
                dalle parole{" "}
                <span style={{ color: BLUE, fontStyle: "italic" }}>vere</span>.
              </h2>
              <div className="space-y-5 text-lg leading-relaxed" style={{ color: "#4A4880" }}>
                <p>
                  Siamo Gelatina: poeti, performer, ascoltatori, agitatori
                  culturali. Abitiamo Latina ma con le parole andiamo ovunque.
                </p>
                <p>
                  Organizziamo poetry slam nei locali, nei cortili, negli spazi
                  insoliti — perché la poesia non appartiene ai libri polverosi
                  ma ai microfoni accesi e alle voci che tremano.
                </p>
                <p>
                  Ogni mese pubblichiamo{" "}
                  <strong style={{ color: BLUE }}>Gelatino</strong>, una piccola
                  raccolta di poesie selezionate dalla nostra community.
                  Da gustare con lentezza.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "12", label: "Slam organizzati", icon: "🎤" },
                { number: "50", label: "Poeti ospitati", icon: "✍️" },
                { number: "3", label: "Numeri di Gelatino", icon: "📖" },
                { number: "∞", label: "Parole dette", icon: "💬" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-7 rounded-3xl flex flex-col gap-2"
                  style={{ background: LAVENDER }}
                >
                  <p className="text-2xl">{stat.icon}</p>
                  <p
                    className="font-black leading-none"
                    style={{ fontSize: "2.5rem", color: BLUE }}
                  >
                    {stat.number}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "#6B68A8" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Members circles */}
          <div className="mt-20">
            <p
              className="text-xs tracking-[0.5em] uppercase mb-10 font-bold text-center"
              style={{ color: BLUE_MID, fontFamily: "'Space Mono', monospace" }}
            >
              Le voci del collettivo
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {members.map((m) => (
                <div key={m.name} className="flex flex-col items-center gap-3 group">
                  <div
                    className="rounded-full flex items-center justify-center text-white font-black select-none transition-transform duration-300 group-hover:scale-110 group-hover:rotate-0 shadow-lg overflow-hidden"
                    style={{
                      width: m.size,
                      height: m.size,
                      background: m.image ? "transparent" : `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})`,
                      fontSize: m.size * 0.32,
                      transform: `rotate(${m.rot}deg)`,
                      boxShadow: `0 8px 30px ${m.gradient[0]}44`,
                    }}
                  >
                    {m.image ? (
                      <img
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      m.initial
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-sm" style={{ color: DARK }}>{m.name}</p>
                    <p className="text-xs font-semibold" style={{ color: "#9896CC" }}>{m.role}</p>
                  </div>
                </div>
              ))}

              {/* +community bubble */}
              <div className="flex flex-col items-center gap-3 group">
                <div
                  className="rounded-full flex items-center justify-center font-black select-none transition-transform duration-300 group-hover:scale-110 shadow-md border-4 border-dashed"
                  style={{
                    width: 110,
                    height: 110,
                    fontSize: "1.4rem",
                    color: BLUE_MID,
                    borderColor: BLUE_LIGHT,
                    background: "white",
                  }}
                >
                  +
                </div>
                <div className="text-center">
                  <p className="font-black text-sm" style={{ color: DARK }}>E tanti altri</p>
                  <p className="text-xs font-semibold" style={{ color: "#9896CC" }}>La comunità</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GELATINO ── */}
      <section id="gelatino" className="py-32 relative overflow-hidden" style={{ background: CREAM }}>
        <div
          className="absolute top-0 right-0 w-1/3 h-full opacity-20"
          style={{ background: `linear-gradient(to left, ${BLUE_LIGHT}, transparent)` }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
              style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
            >
              03 · La Raccolta Mensile
            </p>
            <h2
              className="font-black leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: DARK }}
            >
              <em style={{ fontFamily: "'Playfair Display', serif" }}>Gelatino</em> —
              ogni mese, nuove voci.
            </h2>
            <p className="text-lg leading-relaxed max-w-xl mx-auto mb-10" style={{ color: "#4A4880" }}>
              Una raccolta mensile di poesie <strong>illustrate</strong> — ogni verso
              accompagnato da un&apos;immagine originale. Disponibile in PDF
              da scaricare subito o in versione stampata da ricevere a casa.{" "}
              <span className="font-black" style={{ color: BLUE }}>
                Da gustare con lentezza.
              </span>
            </p>

            {/* Format toggle */}
            <div
              className="inline-flex rounded-full p-1.5"
              style={{ background: "rgba(75,68,223,0.10)" }}
            >
              {(["pdf", "cartaceo"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setGelatinFormat(fmt)}
                  className="px-8 py-3 rounded-full font-black text-sm transition-all duration-300"
                  style={{
                    background: gelatinFormat === fmt ? BLUE : "transparent",
                    color: gelatinFormat === fmt ? "white" : BLUE,
                    transform: gelatinFormat === fmt ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {fmt === "pdf" ? "📄 PDF" : "📦 Cartaceo"}
                </button>
              ))}
            </div>
          </div>

          {/* ── PDF ── */}
          {gelatinFormat === "pdf" && (
            <div>
              {/* Subtitle */}
              <p
                className="text-center text-xs font-bold mb-8 tracking-[0.4em] uppercase"
                style={{ color: "#9896CC", fontFamily: "'Space Mono', monospace" }}
              >
                Scegli il tuo gusto
              </p>

              {/* Flavor cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {issues.map((issue) => {
                  return (
                    <div
                      key={issue.number}
                      className="rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] select-none flex flex-col justify-between"
                      style={{
                        background: issue.c.bg,
                        border: `1.5px solid ${issue.c.border || "rgba(75,68,223,0.09)"}`,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                      }}
                    >
                      {/* Stripe header */}
                      <div
                        className="relative h-16 flex items-center justify-between px-5"
                        style={{ background: issue.c.stripe }}
                      >
                        <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{issue.emoji}</span>
                        <div className="flex items-center gap-2">
                          {issue.preorder && (
                            <span
                              className="text-xs font-black px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(255,255,255,0.22)", color: "white", fontSize: "0.6rem" }}
                            >
                              PROSSIMAMENTE
                            </span>
                          )}
                          <span
                            className="text-xs font-black tracking-widest px-3 py-1 rounded-full"
                            style={{ background: "rgba(255,255,255,0.2)", color: "white", fontFamily: "'Space Mono', monospace" }}
                          >
                            N.{issue.number}
                          </span>
                        </div>
                      </div>

                      {/* Cover showcase */}
                      {issue.cover ? (
                        <div
                          className="flex items-center justify-center py-6 px-4"
                          style={{ background: `linear-gradient(180deg, ${issue.c.bg} 0%, ${issue.c.border}33 100%)` }}
                        >
                          {/* Book volume effect */}
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                              perspective: "800px",
                            }}
                          >
                            {/* Page stack shadow (depth illusion) */}
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-6px",
                                right: "-10px",
                                width: "100%",
                                height: "100%",
                                background: `linear-gradient(135deg, ${issue.c.border}88, ${issue.c.primary}44)`,
                                borderRadius: "4px",
                                transform: "skewY(-1deg) scaleX(0.97)",
                                filter: "blur(1px)",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-3px",
                                right: "-5px",
                                width: "100%",
                                height: "100%",
                                background: `linear-gradient(135deg, ${issue.c.border}cc, ${issue.c.primary}66)`,
                                borderRadius: "4px",
                                transform: "skewY(-0.5deg) scaleX(0.985)",
                              }}
                            />
                            {/* Main cover */}
                            <img
                              src={issue.cover}
                              alt={`Copertina Gelatino N.${issue.number} — ${issue.flavor}`}
                              style={{
                                position: "relative",
                                width: "130px",
                                height: "auto",
                                borderRadius: "4px",
                                boxShadow: `
                                  -4px 4px 0px ${issue.c.border},
                                  -2px 6px 18px rgba(0,0,0,0.22),
                                  0 2px 8px rgba(0,0,0,0.14)
                                `,
                                display: "block",
                                objectFit: "cover",
                              }}
                            />
                            {/* Spine highlight */}
                            <div
                              style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                width: "8px",
                                height: "100%",
                                background: `linear-gradient(90deg, ${issue.c.primary}cc 0%, transparent 100%)`,
                                borderRadius: "4px 0 0 4px",
                                opacity: 0.6,
                              }}
                            />
                            {/* Gloss reflection */}
                            <div
                              style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                width: "100%",
                                height: "40%",
                                background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
                                borderRadius: "4px 4px 0 0",
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        /* Preorder placeholder */
                        <div
                          className="flex items-center justify-center py-8 px-4"
                          style={{ background: `linear-gradient(180deg, ${issue.c.bg} 0%, ${issue.c.border}33 100%)` }}
                        >
                          <div
                            style={{
                              width: "100px",
                              height: "140px",
                              borderRadius: "4px",
                              background: `linear-gradient(135deg, ${issue.c.border}99, ${issue.c.primary}44)`,
                              border: `2px dashed ${issue.c.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2.5rem",
                              boxShadow: `-3px 4px 14px rgba(0,0,0,0.13)`,
                            }}
                          >
                            {issue.emoji}
                          </div>
                        </div>
                      )}

                      {/* Body */}
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-black text-base mb-1" style={{ color: DARK }}>{issue.flavor}</h3>
                          <p className="text-xs leading-relaxed mb-4" style={{ color: "#4A4880" }}>{issue.tagline}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          {issue.preorder ? (
                            <span className="text-sm font-bold italic" style={{ color: issue.c.primary }}>In arrivo</span>
                          ) : (
                            <span className="text-xl font-black" style={{ color: issue.c.primary }}>€{issue.price}</span>
                          )}
                          <a
                            href={issue.url}
                            target={issue.preorder ? "_self" : "_blank"}
                            rel="noopener noreferrer"
                            className="text-xs font-black px-3 py-2 rounded-full transition-all duration-200 hover:scale-105"
                            style={{
                              background: issue.c.primary,
                              color: "white",
                              border: `2px solid ${issue.c.primary}`,
                            }}
                          >
                            {issue.preorder ? "Pre-ordina" : "Compra"}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subscription strip */}
              <div
                className="p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: "rgba(75,68,223,0.06)", border: `1px dashed ${BLUE_LIGHT}` }}
              >
                <div>
                  <p className="font-black text-sm mb-1" style={{ color: BLUE }}>📚 Abbonamento annuale</p>
                  <p className="text-sm" style={{ color: "#4A4880" }}>
                    Ricevi ogni numero direttamente nella tua inbox. €20/anno · tutti i Gelatini.
                  </p>
                </div>
                <a
                  href="mailto:collettivogelatina@gmail.com?subject=Abbonamento%20annuale%20Gelatino%20PDF"
                  className="font-black text-sm px-8 py-3 rounded-full border-2 transition-all hover:scale-105 whitespace-nowrap flex-shrink-0"
                  style={{ borderColor: BLUE, color: BLUE, background: "white" }}
                >
                  Abbonati — €20/anno
                </a>
              </div>

              {/* ── POETRY SUBMISSION ── */}
              <div
                className="mt-8 rounded-3xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #7A74FF 55%, #A89BFF 100%)` }}
              >
                <div className="p-8 md:p-10">

                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                      <p
                        className="text-xs font-bold tracking-[0.4em] uppercase mb-2"
                        style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Space Mono', monospace" }}
                      >
                        Sei un poeta?
                      </p>
                      <h3
                        className="font-black text-white leading-tight"
                        style={{ fontSize: "clamp(1.4rem, 2.8vw, 2rem)" }}
                      >
                        Invia la tua poesia
                      </h3>
                      <p className="text-sm leading-relaxed mt-2 max-w-sm" style={{ color: "rgba(255,255,255,0.78)" }}>
                        Ogni numero accoglie nuove voci. Inviaci il tuo testo
                        in <strong className="text-white">PDF o DOC</strong> per
                        preservare la formattazione originale.
                      </p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-full text-xs font-black flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.18)", color: "white" }}
                    >
                      📅 Entro il 1° di ogni mese
                    </div>
                  </div>

                  {!poetryDone ? (
                    <form onSubmit={handlePoetrySubmit} className="grid sm:grid-cols-2 gap-3">
                      <input
                        required
                        type="text"
                        placeholder="Il tuo nome"
                        value={poetryName}
                        onChange={e => setPoetryName(e.target.value)}
                        className="px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-white/50 transition-all"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                      />
                      <input
                        required
                        type="email"
                        placeholder="La tua email"
                        value={poetryEmail}
                        onChange={e => setPoetryEmail(e.target.value)}
                        className="px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-white/50 transition-all"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                      />
                      <input
                        required
                        type="text"
                        placeholder="Titolo della poesia"
                        value={poetryTitle}
                        onChange={e => setPoetryTitle(e.target.value)}
                        className="sm:col-span-2 px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-white/50 transition-all"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                      />
                      <textarea
                        rows={3}
                        placeholder="Una nota (facoltativa) — presentati, racconta la poesia..."
                        value={poetryNote}
                        onChange={e => setPoetryNote(e.target.value)}
                        className="sm:col-span-2 px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-white/50 transition-all resize-none"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                      />
                      <div className="sm:col-span-2 flex items-start gap-2.5 my-1">
                        <input
                          required
                          type="checkbox"
                          id="privacy-check"
                          checked={privacyAccepted}
                          onChange={e => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded accent-[#4B44DF] cursor-pointer"
                        />
                        <label htmlFor="privacy-check" className="text-xs text-white/80 leading-snug select-none cursor-pointer">
                          Accetto la{" "}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold text-white hover:text-[#B8B3FF] transition-colors"
                          >
                            Privacy Policy
                          </a>{" "}
                          e acconsento al trattamento dei miei dati personali.
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <div
                          className="p-4 rounded-2xl text-sm mb-4"
                          style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                        >
                          📎 Dopo aver inviato questo modulo, allega il tuo file{" "}
                          <strong className="text-white">PDF o DOC</strong> a{" "}
                          <strong className="text-white">collettivogelatina@gmail.com</strong>{" "}
                          con oggetto:{" "}
                          <em className="text-white">Invio Poesia — [titolo]</em>
                        </div>
                        <button
                          type="submit"
                          disabled={poetrySending}
                          className="w-full font-black text-sm py-4 rounded-2xl transition-all hover:scale-[1.02] disabled:opacity-60"
                          style={{ background: "white", color: BLUE }}
                        >
                          {poetrySending ? "Invio in corso..." : "Invia la tua candidatura →"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-4xl mb-4">✨</p>
                      <p className="font-black text-xl text-white mb-2">Candidatura ricevuta!</p>
                      <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.78)" }}>
                        Ci hai lasciato i tuoi dati. Ora mandaci il file con la poesia.
                      </p>
                      <a
                        href={`mailto:collettivogelatina@gmail.com?subject=Invio%20Poesia%20%E2%80%94%20${encodeURIComponent(poetryTitle)}&body=Ciao%2C%20sono%20${encodeURIComponent(poetryName)}.%20In%20allegato%20la%20mia%20poesia.`}
                        className="inline-block font-black text-sm px-8 py-4 rounded-full transition-all hover:scale-105"
                        style={{ background: "white", color: BLUE }}
                      >
                        Allega il file via email →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CARTACEO ── */}
          {gelatinFormat === "cartaceo" && (
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Book mockup */}
              <div className="flex justify-center">
                <div className="relative w-64 h-80">
                  <div
                    className="absolute w-64 h-80 rounded-2xl"
                    style={{ top: 10, left: 10, background: BLUE_LIGHT, opacity: 0.4 }}
                  />
                  <div
                    className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ transform: "rotate(-2deg)", background: "white" }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-16"
                      style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})` }}
                    />
                    <div
                      className="absolute top-0 left-0 bottom-0 w-5 rounded-l-2xl"
                      style={{ background: BLUE_LIGHT, opacity: 0.5 }}
                    />
                    <div className="absolute top-0 left-5 right-0 bottom-0 p-6 pt-10 flex flex-col">
                      <p
                        className="text-xs tracking-[0.4em] uppercase mb-3 font-bold"
                        style={{ color: BLUE_MID, fontFamily: "'Space Mono', monospace" }}
                      >
                        Vol. 1 · Stampato
                      </p>
                      <h3 className="font-black leading-none mb-3" style={{ fontSize: "3rem", color: DARK }}>
                        Gela<span style={{ color: BLUE }}>ti</span>no
                      </h3>
                      <p
                        className="text-sm italic leading-relaxed"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#6B68A8" }}
                      >
                        poesie da gustare<br />con lentezza
                      </p>
                      <div className="mt-auto pt-4 border-t" style={{ borderColor: LAVENDER }}>
                        <p className="text-xs font-bold" style={{ color: "#9896CC", fontFamily: "'Space Mono', monospace" }}>
                          A5 · 36 PAGINE
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cartaceo info */}
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Formato", value: "A5 · 36 pagine" },
                    { label: "Frequenza", value: "Mensile" },
                    { label: "Consegna", value: "Spedizione postale" },
                    { label: "Spedizione", value: "Italia + Europa" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-2xl" style={{ background: "white" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "#9896CC", fontFamily: "'Space Mono', monospace" }}>
                        {item.label}
                      </p>
                      <p className="font-black text-sm" style={{ color: DARK }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div
                  className="p-5 rounded-2xl"
                  style={{ background: "rgba(75,68,223,0.07)", borderLeft: `4px solid ${BLUE}` }}
                >
                  <p className="font-black text-sm mb-1" style={{ color: BLUE }}>
                    📦 Come funziona
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4880" }}>
                    Scrivici con il numero che ti interessa, ti mandiamo i
                    dettagli per il pagamento e la spedizione. Puoi anche
                    abbonarti e ricevere ogni numero direttamente a casa.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="mailto:collettivogelatina@gmail.com?subject=Ordine%20Gelatino%20Cartaceo"
                    className="font-black text-sm px-8 py-4 rounded-full transition-all hover:scale-105 text-center"
                    style={{ background: BLUE, color: "white" }}
                  >
                    Ordina la versione stampata →
                  </a>
                  <a
                    href="mailto:collettivogelatina@gmail.com?subject=Abbonamento%20annuale%20Gelatino%20Cartaceo"
                    className="font-black text-sm px-8 py-4 rounded-full border-2 transition-all hover:scale-105 text-center"
                    style={{ borderColor: BLUE, color: BLUE, background: "white" }}
                  >
                    Abbonati — €50 · 12 Gelatini annuali
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SPAZI & AMICI ── */}
      <section id="ecosistema" className="py-32 relative overflow-hidden" style={{ background: CREAM }}>
        <div
          className="absolute -bottom-24 -right-24 opacity-15"
          style={{
            width: 380, height: 380,
            borderRadius: "60% 40% 30% 70% / 40% 60% 40% 60%",
            background: `linear-gradient(135deg, ${BLUE_MID}, ${BLUE_LIGHT})`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <p
              className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
              style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
            >
              04 · Ecosistema
            </p>
            <h2
              className="font-black leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: DARK }}
            >
              Spazi & <span style={{ color: BLUE }}>Amici</span>
            </h2>
            <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "#4A4880" }}>
              Le realtà culturali con cui condividiamo palchi, idee e comunità.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Spazio Idea Kennedy",            type: "Spazio Culturale",     url: "https://spazioideakennedy.it/",                                                            icon: "🏛️" },
              { name: "Open Hub Lazio",                 type: "Hub Culturale",         url: "https://openhublazio.it/",                                                                 icon: "🌐" },
              { name: "Lestrella Pop",                  type: "Associazione",          url: "https://www.instagram.com/lestrellapop/",                                                  icon: "⭐" },
              { name: "Quartieri Connessi",             type: "Associazione",          url: "https://www.q4q5.it/",                                                                     icon: "🏘️" },
              { name: "Caffè Poeta",                    type: "Bistrot Letterario",    url: "https://www.facebook.com/p/Caff%C3%A8-Poeta-Bistrot-Letterario-61588142742806/",          icon: "☕" },
              { name: "Scrittura Creativa Lab",         type: "Workshop Scrittura",    url: "https://www.facebook.com/p/ScritturacreativaLab-61558158616136/",                         icon: "✍️" },
              { name: "Sottoscala9",                    type: "Spazio Creativo",       url: "https://www.sottoscala9.com/",                                                             icon: "🎨" },
              { name: "Spazio Zero",                    type: "Associazione & Lab",    url: "https://www.spaziozerolab.it/",                                                            icon: "🌀" },
              { name: "Zeldart",                        type: "Arte & Media",          url: "https://www.zeldart.it/",                                                                  icon: "🎙️" },
              { name: "Oriselia",                       type: "Podcast & Mondi",       url: "https://velocalm.com/",                                                                    icon: "🌙" },
            ].map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                style={{
                  background: "white",
                  border: `1.5px solid ${LAVENDER}`,
                  boxShadow: "0 2px 12px rgba(75,68,223,0.06)",
                  textDecoration: "none",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{partner.icon}</span>
                  <span
                    className="text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: BLUE }}
                  >
                    visita →
                  </span>
                </div>
                <p className="font-black text-base leading-tight mb-1" style={{ color: DARK }}>
                  {partner.name}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#9896CC", fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em" }}
                >
                  {partner.type}
                </p>
                <div
                  className="mt-4 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: `linear-gradient(to right, ${BLUE}, ${BLUE_MID})` }}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTATTI ── */}
      <section id="contatti" className="py-32" style={{ background: "#FAFAFF" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p
            className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
            style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
          >
            05 · Contatti
          </p>
          <h2
            className="font-black mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: DARK }}
          >
            Hai parole da condividere?
          </h2>
          <p
            className="text-xl leading-relaxed mb-14 max-w-2xl mx-auto"
            style={{ color: "#4A4880" }}
          >
            Sei un poeta, un locale interessato ad ospitarci, o vuoi semplicemente
            sapere di più? Scrivici — le parole ci trovano sempre.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-14">
            {[
              { icon: "✉️", label: "Email", value: "collettivogelatina@gmail.com", href: "mailto:collettivogelatina@gmail.com" },
              { icon: "📸", label: "Instagram", value: "@collettivogelatina", href: "https://www.instagram.com/collettivogelatina?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
              { icon: "📍", label: "Dove siamo", value: "Latina, Lazio", href: "#" },
            ].map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                className="group p-8 rounded-3xl text-center transition-all duration-300 hover:shadow-lg hover:scale-105 block"
                style={{ background: LAVENDER }}
              >
                <p className="text-4xl mb-3">{contact.icon}</p>
                <p
                  className="text-xs font-black tracking-[0.4em] uppercase mb-2 transition-colors"
                  style={{ color: BLUE, fontFamily: "'Space Mono', monospace" }}
                >
                  {contact.label}
                </p>
                <p className="font-semibold text-sm" style={{ color: DARK }}>
                  {contact.value}
                </p>
              </a>
            ))}
          </div>

          {/* Contact form */}
          <div className="rounded-3xl p-10 text-left" style={{ background: DARK }}>
            <h3
              className="text-white font-black text-2xl mb-8"
            >
              Mandaci un messaggio
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── OPEN MIC ── */}
      <section id="open-mic" className="py-32 relative overflow-hidden" style={{ background: "#0E0C2E" }}>

        {/* Subtle background dots */}
        {[
          { top: "15%", left: "8%",  size: 3 },
          { top: "70%", left: "5%",  size: 5 },
          { top: "40%", right: "6%", size: 4 },
          { top: "85%", right: "12%",size: 3 },
          { top: "25%", right: "22%",size: 6 },
          { top: "60%", left: "18%", size: 4 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              top: dot.top, left: (dot as {left?: string}).left, right: (dot as {right?: string}).right,
              width: dot.size, height: dot.size,
              background: BLUE_LIGHT,
            }}
          />
        ))}

        {/* Subtle glow blob */}
        <div
          className="absolute opacity-10 blob-float-slow"
          style={{
            top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 500, height: 300,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${BLUE_MID}, transparent 70%)`,
          }}
        />

        <div className="max-w-3xl mx-auto px-6 relative z-10">

          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs tracking-[0.5em] uppercase mb-5 font-bold"
              style={{ color: BLUE_LIGHT, fontFamily: "'Space Mono', monospace" }}
            >
              05 · Open Mic Permanente
            </p>
            <div className="text-6xl mb-5">🎙️</div>
            <h2
              className="font-black leading-tight mb-5 text-white"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
            >
              Il microfono<br />è sempre aperto.
            </h2>
            <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              Lascia un messaggio vocale — una poesia, un verso, un frammento.
              Registra direttamente da qui, senza app. Il collettivo ti ascolta.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-3 mb-10">
            {[
              { step: "01", label: "Premi registra" },
              { step: "02", label: "Leggi la tua poesia" },
              { step: "03", label: "Invia al collettivo" },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center py-4 px-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p
                  className="font-black text-xs mb-1.5"
                  style={{ color: BLUE_LIGHT, fontFamily: "'Space Mono', monospace" }}
                >
                  {item.step}
                </p>
                <p className="font-bold text-white text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Custom VoiceMic recorder + public wall */}
          <VoiceMic />

          <p
            className="text-center mt-6 text-sm"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}
          >
            I messaggi più belli potranno risuonare nelle nostre serate slam.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-14"
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-black tracking-wide text-xl mb-1">
              Gelatina
            </p>
            <p
              className="text-white/50 text-xs"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Spoken Word · Latina
            </p>
          </div>

          <div className="flex flex-wrap gap-6 justify-center items-center">
            {["Chi Siamo", "Slam", "Gelatino", "Contatti"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-white/60 text-sm font-bold hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
            <a
              href="/privacy"
              className="text-white/60 text-sm font-bold hover:text-white transition-colors border-l border-white/20 pl-6"
            >
              Privacy & Cookies
            </a>
          </div>

          <p
            className="text-white/25 text-xs"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            © 2025 Gelatina
          </p>
        </div>
      </footer>

      {/* ── FLOATING MIC BUTTON ── */}
      <a
        href="#open-mic"
        className="fab-float fixed z-50 flex items-center justify-center group"
        aria-label="Open Mic"
        style={{
          bottom: "2rem",
          right: "2rem",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
          boxShadow: `0 8px 32px rgba(75,68,223,0.55)`,
        }}
      >
        {/* Pulse ring */}
        <span
          className="pulse-ring absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})` }}
        />
        {/* Mic SVG */}
        <svg
          width="26" height="26" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="relative z-10"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {/* Tooltip */}
        <span
          className="absolute right-16 whitespace-nowrap text-xs font-black px-3 py-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: DARK, color: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
        >
          Open Mic
        </span>
      </a>
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await fetch("https://alluring-encouragement-production.up.railway.app/public/lead_v3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message, source: "gelatina-poetry" }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p
          className="text-2xl mb-3"
          style={{ color: "#C8C4FF", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
        >
          Messaggio ricevuto.
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Ti risponderemo presto.</p>
      </div>
    );
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    color: "white",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
  } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
            Nome
          </label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Il tuo nome" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
            Email
          </label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="la@tuamail.it" style={inputStyle} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
          Messaggio
        </label>
        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Scrivi qui le tue parole..." style={{ ...inputStyle, resize: "none" }} />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="font-black text-sm px-9 py-3.5 rounded-full transition-all hover:scale-105 disabled:opacity-50"
        style={{ background: "#B8B3FF", color: DARK }}
      >
        {status === "sending" ? "Invio in corso..." : "Invia messaggio →"}
      </button>
      {status === "error" && (
        <p className="text-sm font-semibold" style={{ color: "#FF9999" }}>
          Qualcosa è andato storto. Riprova o scrivici via email.
        </p>
      )}
    </form>
  );
}
