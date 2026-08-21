"use client";
import { useRef, useEffect, useState } from "react";

const BLUE      = "#4B44DF";
const BLUE_MID  = "#7A74FF";
const BLUE_LIGHT= "#B8B3FF";
const LAVENDER  = "#EDE9FF";
const DARK      = "#1C1A4A";

const ITEM_W      = 190;
const CONTAINER_H = 400;
const PAD         = 600; // left/right padding so first/last items can center

interface TEvent {
  id: number;
  label: string;
  title: string;
  desc: string;
  tag: string;
  past: boolean;
  founding?: boolean;
}

const TAG_COLORS: Record<string, [string, string]> = {
  ORIGINE:        ["#EEE9FF", "#5540E0"],
  SLAM:           [LAVENDER,   BLUE],
  LIPS:           ["#FFE8E2", "#C03530"],
  COLLAB:         ["#E0F5EE", "#1A7A55"],
  "OPEN MIC":     ["#E0EEFF", "#2060CC"],
  PERFORMANCE:    ["#F5E0FF", "#8820C0"],
  PRESENTAZIONE:  ["#FFF8E0", "#9A6000"],
  "IN ARRIVO":    ["#E8FFF3", "#2A7A5A"],
};

const EVENT_COVERS: Record<number, string> = {};

const TIMELINE: TEvent[] = [
  { id: 0,  label: "Primavera 2025", title: "Nasce Gelatina",         desc: "Aldo e Francesco portano la poesia slam a Latina. Un microfono, due voci, e tutto comincia.",              tag: "ORIGINE",       past: true,  founding: true },
  { id: 1,  label: "24 Mag 2025",    title: "Brò Poetry Slam",        desc: "Il battesimo del palco. Parole nuove in una città che non sapeva ancora di aspettarle.",                   tag: "SLAM",          past: true  },
  { id: 2,  label: "25 Mag 2025",    title: "Norma Festival Poetry",  desc: "Con OpenHub al Norma Festival. La poesia esce dal locale e incontra la comunità.",                         tag: "COLLAB",        past: true  },
  { id: 3,  label: "22 Giu 2025",    title: "Oliocentrica Slam",      desc: "Semifinali regionali LIPS. La competizione si fa seria, le parole più affilate.",                          tag: "LIPS",          past: true  },
  { id: 4,  label: "5 Lug 2025",     title: "Doolin Poetry Slam",     desc: "Seconda tappa delle semifinali LIPS. Il torneo si scalda, il ritmo sale.",                                 tag: "LIPS",          past: true  },
  { id: 5,  label: "7 Ago 2025",     title: "Primo Chiosco Slam",     desc: "Estate piena, microfono aperto. Il chiosco si trasforma in un palco sotto il sole.",                       tag: "SLAM",          past: true  },
  { id: 6,  label: "19 Ott 2025",    title: "Sosò Poetry Slam",       desc: "Una serata d'autunno tra versi e voci. Il Sosò diventa casa.",                                             tag: "SLAM",          past: true  },
  { id: 7,  label: "23 Nov 2025",    title: "Ariccia Poetry Slam",    desc: "Con Castelli in Versi. La poesia varca i confini di Latina e trova nuovi palchi.",                         tag: "COLLAB",        past: true  },
  { id: 8,  label: "14 Dic 2025",    title: "Sosò Poetry Slam",       desc: "Dicembre. Parole calde in una notte fredda. L'anno si chiude con i versi.",                                tag: "SLAM",          past: true  },
  { id: 9,  label: "15 Gen 2026",    title: "Geena Pub Slam",         desc: "Con il Collettivo Graziani al Geena Pub. Due collettivi, una sola lingua.",                                tag: "COLLAB",        past: true  },
  { id: 10, label: "22 Feb 2026",    title: "Sosò Open Mic",          desc: "Slam e microfono aperto. Chiunque abbia una voce è il benvenuto sul palco.",                               tag: "OPEN MIC",      past: true  },
  { id: 11, label: "3 Apr 2026",     title: "Teatro D'Annunzio",      desc: "Performance poetica con Botteghe Invisibili. La parola entra in scena e cambia forma.",                    tag: "PERFORMANCE",   past: true  },
  { id: 12, label: "11 Apr 2026",    title: "SpazioZero",             desc: "Presentazione della raccolta di Flavio Riccardi. La parola scritta incontra quella detta.",                tag: "PRESENTAZIONE", past: true  },
  { id: 13, label: "14 Mag 2026",    title: "Caffè Poeta Slam",       desc: "Semifinali regionali LIPS 2026. Ogni verso vale un passo verso il campionato.",                           tag: "LIPS",          past: true  },
  { id: 14, label: "18 Giu 2026",    title: "Bacco e Venere Slam",    desc: "Ultima tappa LIPS. Le parole si giocano tutto. Chi va avanti lo decide la voce.",                          tag: "LIPS",          past: true  },
  { id: 15, label: "11 Lug 2026",    title: "Estrella Pop Slam",      desc: "Poetry slam locale all'Estrella Pop. Le voci del territorio si sfidano a colpi di versi.",               tag: "SLAM",          past: true  },
  { id: 16, label: "16 Lug 2026",    title: "Sottoscala9",            desc: "Presentazione del libro ed open mic. Uno spazio aperto alle parole e alle nuove pubblicazioni.",           tag: "PRESENTAZIONE", past: true  },
  { id: 17, label: "3 Set",          title: "Slam all'Hotel Tirreno", desc: "Il prossimo Poetry Slam, ore 19:30 all'Hotel Tirreno. Il palco è pronto, aspettiamo solo la tua voce.", tag: "SLAM",     past: false },
];

function CoverFloat({ src }: { src: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: 56,
        height: 76,
        flexShrink: 0,
        marginLeft: 6,
        alignSelf: "center",
      }}
    >
      {/* soft ground shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 44,
          height: 8,
          borderRadius: "50%",
          background: "rgba(100,80,0,0.18)",
          filter: "blur(4px)",
        }}
      />
      {/* floating zine cover */}
      <img
        src={src}
        alt="Gelatino copertina"
        style={{
          position: "relative",
          width: 54,
          height: 72,
          objectFit: "cover",
          borderRadius: 8,
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10)",
          transform: "rotate(-3deg) translateY(-4px)",
          animation: "gelatinFloat 3.2s ease-in-out infinite",
          border: "1.5px solid rgba(255,230,60,0.5)",
        }}
      />
      <style>{`
        @keyframes gelatinFloat {
          0%,100% { transform: rotate(-3deg) translateY(-4px); }
          50%      { transform: rotate(-3deg) translateY(-9px); }
        }
      `}</style>
    </div>
  );
}

function Card({ ev, hovered, isFirst, onRegister }: { ev: TEvent; hovered: boolean; isFirst: boolean; onRegister?: (title: string) => void }) {
  const [tagBg, tagColor] = TAG_COLORS[ev.tag] ?? [LAVENDER, BLUE];
  const compact = ev.past && !hovered && !ev.founding;
  const coverSrc = EVENT_COVERS[ev.id];
  const showCover = coverSrc && (hovered || !compact);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      <div
        style={{
          background: compact ? "rgba(255,255,255,0.65)" : "white",
          borderRadius: 14,
          padding: compact ? "6px 10px" : "9px 11px",
          width: showCover ? 130 : 156,
          textAlign: "center",
          boxShadow: isFirst
            ? `0 4px 24px rgba(75,68,223,0.2)`
            : hovered
            ? "0 3px 14px rgba(75,68,223,0.14)"
            : "none",
          border: isFirst
            ? `1.5px solid ${BLUE_LIGHT}`
            : compact
            ? "1px solid rgba(75,68,223,0.06)"
            : "1px solid rgba(75,68,223,0.09)",
          opacity: compact && !ev.founding ? 0.72 : 1,
          transition: "all 0.22s ease",
          backdropFilter: compact ? "none" : undefined,
        }}
      >
        <p
          style={{
            fontSize: 9, fontWeight: 900,
            color: ev.past ? "#9896CC" : BLUE,
            letterSpacing: "0.13em",
            fontFamily: "'Space Mono', monospace",
            marginBottom: 3,
          }}
        >
          {ev.label}
        </p>
        <p style={{ fontSize: compact ? 10 : 12, fontWeight: 900, color: DARK, marginBottom: (hovered || isFirst) ? 4 : 0 }}>
          {ev.title}
        </p>
        {(hovered || isFirst) && !ev.past && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', marginTop: 6 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRegister) {
                  onRegister(ev.title);
                } else {
                  window.location.href = `mailto:collettivogelatina@gmail.com?subject=Iscrizione%20${encodeURIComponent(ev.title)}`;
                }
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                background: "#E63946",
                color: "white",
                fontSize: 10,
                fontWeight: 900,
                cursor: "pointer",
                pointerEvents: "auto",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 2px 10px rgba(230,57,70,0.5)",
                animation: "pulse 2s infinite"
              }}
            >
              🔥 Iscriviti
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const text = `🔥 Iscriviti allo Slam del 3 Settembre come poeta o pubblico!`;
                const url = `https://www.collettivogelatina.it/?iscriviti=3-settembre`;
                if (navigator.share) {
                  navigator.share({ title: "Iscriviti allo slam del 3 settembre come poeta (slam o openmic) e pubblico", text, url });
                } else {
                  navigator.clipboard.writeText(`${text}\n${url}`);
                  alert("Link copiato!");
                }
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 99,
                border: "1.5px solid #4B44DF",
                background: "transparent",
                color: "#4B44DF",
                fontSize: 9,
                fontWeight: 900,
                cursor: "pointer",
                pointerEvents: "auto",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.08em",
              }}
            >
              ↗ Condividi
            </button>
          </div>
        )}
        <span
          style={{
            display: "inline-block", fontSize: 8, fontWeight: 900,
            padding: "2px 7px", borderRadius: 99,
            background: tagBg, color: tagColor,
            letterSpacing: "0.1em",
            fontFamily: "'Space Mono', monospace",
            marginTop: 2,
          }}
        >
          {ev.tag}
        </span>
      </div>

      {showCover && <CoverFloat src={coverSrc} />}
    </div>
  );
}

export default function SlamTimeline({ onRegister }: { onRegister?: (title: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const firstUpcoming = TIMELINE.findIndex(e => !e.past);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = setTimeout(() => {
      const targetX = PAD + firstUpcoming * ITEM_W + ITEM_W / 2 - el.offsetWidth / 2;
      el.scrollLeft = Math.max(0, targetX);
    }, 60);
    return () => clearTimeout(id);
  }, [firstUpcoming]);

  const nav = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -ITEM_W * 2 : ITEM_W * 2, behavior: "smooth" });

  return (
    <div className="relative" style={{ height: CONTAINER_H }}>
      {/* ← arrow */}
      <button
        onClick={() => nav("left")}
        aria-label="Scorri indietro"
        className="absolute top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 font-bold"
        style={{ left: 0, background: "white", boxShadow: "0 2px 14px rgba(75,68,223,0.18)", color: BLUE, fontSize: 20 }}
      >
        ‹
      </button>

      {/* → arrow */}
      <button
        onClick={() => nav("right")}
        aria-label="Scorri avanti"
        className="absolute top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 font-bold"
        style={{ right: 0, background: "white", boxShadow: "0 2px 14px rgba(75,68,223,0.18)", color: BLUE, fontSize: 20 }}
      >
        ›
      </button>

      {/* Scrollable viewport */}
      <div
        ref={scrollRef}
        className="absolute inset-0"
        style={{
          overflowX: "scroll",
          overflowY: "hidden",
          scrollbarWidth: "none",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        {/* Track */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            position: "relative",
            height: "100%",
            paddingLeft: PAD,
            paddingRight: PAD,
          }}
        >
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              transform: "translateY(-50%)",
              background: `linear-gradient(to right, transparent, ${BLUE_LIGHT} 15%, ${BLUE_MID} 50%, ${BLUE_LIGHT} 85%, transparent)`,
              zIndex: 0,
            }}
          />

          {/* Nodes */}
          {TIMELINE.map((ev, i) => {
            const isAbove  = i % 2 === 0;
            const isFirst  = i === firstUpcoming;
            const isHov    = hovered === ev.id;

            const pearlSize = ev.founding ? 52 : isFirst ? 60 : ev.past ? 28 : 44;
            const pearlBg   = ev.founding
              ? "linear-gradient(135deg,#5030E0,#8A80FF)"
              : ev.past
              ? "linear-gradient(135deg,#C0BDD8,#A4A1C4)"
              : isFirst
              ? `linear-gradient(135deg,${BLUE},${BLUE_MID})`
              : `linear-gradient(135deg,${BLUE_MID},${BLUE_LIGHT})`;

            // distance from pearl edge to card
            const cardOffset = `calc(50% + ${pearlSize / 2}px + 16px)`;

            return (
              <div
                key={ev.id}
                style={{
                  flexShrink: 0,
                  width: ITEM_W,
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  zIndex: isHov || isFirst ? 10 : 1,
                }}
                onMouseEnter={() => setHovered(ev.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Pearl */}
                <div
                  style={{
                    width: pearlSize,
                    height: pearlSize,
                    borderRadius: "50%",
                    background: pearlBg,
                    position: "relative",
                    flexShrink: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isFirst
                      ? `0 0 22px rgba(75,68,223,0.6),0 0 44px rgba(75,68,223,0.22)`
                      : ev.past
                      ? "none"
                      : "0 4px 14px rgba(75,68,223,0.35)",
                    transition: "transform 0.2s ease",
                    transform: isHov ? "scale(1.18)" : "scale(1)",
                  }}
                >
                  {ev.founding && (
                    <span style={{ fontSize: 22, lineHeight: 1, userSelect: "none" }}>✦</span>
                  )}
                  {isFirst && !ev.founding && (
                    <span style={{ fontSize: 18, lineHeight: 1, userSelect: "none" }}>🎤</span>
                  )}
                  {isFirst && (
                    <div
                      className="pulse-ring"
                      style={{
                        position: "absolute",
                        inset: -10,
                        borderRadius: "50%",
                        border: `2px solid ${BLUE_LIGHT}`,
                      }}
                    />
                  )}
                </div>

                {/* Card above (even) */}
                {isAbove && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: cardOffset,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Card ev={ev} hovered={isHov} isFirst={isFirst} onRegister={onRegister} />
                    <div
                      style={{
                        width: 1,
                        height: 16,
                        background:
                          "linear-gradient(to bottom,rgba(75,68,223,0),rgba(75,68,223,0.28))",
                      }}
                    />
                  </div>
                )}

                {/* Card below (odd) */}
                {!isAbove && (
                  <div
                    style={{
                      position: "absolute",
                      top: cardOffset,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 1,
                        height: 16,
                        background:
                          "linear-gradient(to bottom,rgba(75,68,223,0.28),rgba(75,68,223,0))",
                      }}
                    />
                    <Card ev={ev} hovered={isHov} isFirst={isFirst} onRegister={onRegister} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
