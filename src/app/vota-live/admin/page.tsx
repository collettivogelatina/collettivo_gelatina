"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://agymwlchcofmrsyuegli.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW13bGNoY29mbXJzeXVlZ2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MzUsImV4cCI6MjA5ODA1MTczNX0.sGPrYL_kdVgOGpaNKTa_xAHYbkeH7mt0cfR9ruVOq48"
);

const PASSWORD    = "gelat1na!";
const BLUE        = "#4B44DF";
const BLUE_MID    = "#7A74FF";
const BLUE_LIGHT  = "#B8B3FF";
const DARK        = "#1C1A4A";
const GREEN       = "#2A8A5A";
const RED         = "#E63946";
const STORAGE_KEY = "gelatina_admin_event_v2";

type Tab = "serata" | "poeti" | "live";

interface Poet { name: string; poem: string; }

interface LocalEvent {
  name: string;
  date: string;
  poetQueue: Poet[];
  sessionIds: string[];  // IDs delle slam_sessions di questa serata
}

interface SlamSession {
  id: string;
  poet_name: string;
  poem_title: string;
  voting_open: boolean;
  created_at: string;
}

interface HistoryEntry {
  id: string;
  poet: string;
  poem: string;
  avg: number;
  count: number;
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadLocalEvent(): LocalEvent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocalEvent(evt: LocalEvent | null) {
  if (typeof window === "undefined") return;
  if (!evt) { localStorage.removeItem(STORAGE_KEY); return; }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evt));
}

function scoreColor(s: number): string {
  if (s <= 4) return "#E05555";
  if (s <= 6) return "#C49200";
  if (s <= 8) return GREEN;
  return BLUE;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 10, padding: "11px 14px", color: "white",
  fontSize: "0.92rem", fontFamily: "'Nunito', sans-serif",
  outline: "none", width: "100%",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1.5px solid rgba(255,255,255,0.09)",
  borderRadius: 20, padding: "20px 22px", marginBottom: 18,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // ── Auth ──
  const [locked, setLocked]     = useState(true);
  const [pwd, setPwd]           = useState("");
  const [pwdError, setPwdError] = useState(false);

  // ── UI ──
  const [tab, setTab] = useState<Tab>("serata");

  // ── Serata locale ──
  const [localEvent, setLocalEventState] = useState<LocalEvent | null>(null);
  const [evtName, setEvtName] = useState("");
  const [evtDate, setEvtDate] = useState("");

  // ── Poets form ──
  const [poetName, setPoetName]   = useState("");
  const [poemTitle, setPoemTitle] = useState("");

  // ── Live ──
  const [session, setSession]         = useState<SlamSession | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [voteCount, setVoteCount]     = useState(0);
  const [avgScore, setAvgScore]       = useState<number | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);

  const channelRef  = useRef<RealtimeChannel | null>(null);
  const sessionRef  = useRef<SlamSession | null>(null);

  // ── Aggiorna localStorage e stato insieme ──
  const setLocalEvent = (evt: LocalEvent | null) => {
    setLocalEventState(evt);
    saveLocalEvent(evt);
  };

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadSession = useCallback(async (sessionIds?: string[]) => {
    const ids = sessionIds ?? localEvent?.sessionIds;
    if (!ids || ids.length === 0) { setSession(null); sessionRef.current = null; return; }
    // Prende l'ultima sessione della serata
    const { data } = await supabase
      .from("slam_sessions")
      .select("*")
      .in("id", ids)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data ?? null);
    sessionRef.current = data ?? null;
  }, [localEvent?.sessionIds]);

  const loadVoteStats = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from("slam_votes")
      .select("score")
      .eq("session_id", sessionId);
    if (data && data.length > 0) {
      const avg = data.reduce((s: number, r: { score: number }) => s + Number(r.score), 0) / data.length;
      setAvgScore(Math.round(avg * 10) / 10);
      setVoteCount(data.length);
    } else {
      setAvgScore(null);
      setVoteCount(0);
    }
  }, []);

  const loadHistory = useCallback(async (sessionIds: string[]) => {
    if (sessionIds.length === 0) { setHistory([]); return; }
    const { data: sessions } = await supabase
      .from("slam_sessions")
      .select("id, poet_name, poem_title")
      .in("id", sessionIds)
      .order("created_at", { ascending: true });
    if (!sessions) return;

    const results: HistoryEntry[] = await Promise.all(
      sessions.map(async (s) => {
        const { data: votes } = await supabase
          .from("slam_votes").select("score").eq("session_id", s.id);
        const count = votes?.length ?? 0;
        const avg = count > 0
          ? votes!.reduce((acc: number, v: { score: number }) => acc + Number(v.score), 0) / count
          : 0;
        return { id: s.id, poet: s.poet_name, poem: s.poem_title, avg: Math.round(avg * 10) / 10, count };
      })
    );
    setHistory(results.filter((r) => r.count > 0));
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────

  // Carica da localStorage al login
  useEffect(() => {
    if (locked) return;
    const saved = loadLocalEvent();
    setLocalEventState(saved);
    if (saved?.sessionIds?.length) {
      loadSession(saved.sessionIds);
      loadHistory(saved.sessionIds);
    }
  }, [locked, loadSession, loadHistory]);

  useEffect(() => {
    if (session?.id) loadVoteStats(session.id);
  }, [session?.id, loadVoteStats]);

  // Realtime
  useEffect(() => {
    if (locked) return;
    const ch = supabase
      .channel("admin_v3")
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_sessions" }, () => {
        const ids = localEvent?.sessionIds;
        if (ids?.length) { loadSession(ids); loadHistory(ids); }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, (payload) => {
        const sid = (payload.new as { session_id?: string })?.session_id ?? sessionRef.current?.id;
        if (sid) loadVoteStats(sid);
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [locked, localEvent?.sessionIds, loadSession, loadHistory, loadVoteStats]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = () => {
    if (pwd === PASSWORD) { setLocked(false); setPwdError(false); }
    else setPwdError(true);
  };

  // ── Serata ────────────────────────────────────────────────────────────────

  const createEvent = () => {
    if (!evtName.trim()) return;
    setLocalEvent({ name: evtName.trim(), date: evtDate, poetQueue: [], sessionIds: [] });
    setEvtName(""); setEvtDate("");
    setSession(null); sessionRef.current = null;
    setHistory([]); setVoteCount(0); setAvgScore(null);
  };

  const clearEvent = () => {
    if (!confirm("Sei sicuro di voler terminare questa serata? I dati locali verranno cancellati.")) return;
    setLocalEvent(null);
    setSession(null); sessionRef.current = null;
    setHistory([]); setVoteCount(0); setAvgScore(null);
  };

  // ── Poeti ─────────────────────────────────────────────────────────────────

  const addPoet = () => {
    if (!poetName.trim() || !localEvent) return;
    const updated: LocalEvent = {
      ...localEvent,
      poetQueue: [...localEvent.poetQueue, { name: poetName.trim(), poem: poemTitle.trim() }],
    };
    setLocalEvent(updated);
    setPoetName(""); setPoemTitle("");
  };

  const removePoet = (index: number) => {
    if (!localEvent) return;
    const updated: LocalEvent = {
      ...localEvent,
      poetQueue: localEvent.poetQueue.filter((_, i) => i !== index),
    };
    setLocalEvent(updated);
  };

  // ── Live ──────────────────────────────────────────────────────────────────

  const callPoet = async (poet: Poet) => {
    if (!localEvent) return;
    setSessionBusy(true);
    // Crea la sessione in Supabase
    const { data, error } = await supabase
      .from("slam_sessions")
      .insert({ poet_name: poet.name, poem_title: poet.poem, voting_open: false })
      .select()
      .single();

    if (error || !data) { setSessionBusy(false); return; }

    // Rimuovi dalla coda e salva l'ID della sessione
    const updated: LocalEvent = {
      ...localEvent,
      poetQueue: localEvent.poetQueue.filter((p) => !(p.name === poet.name && p.poem === poet.poem)),
      sessionIds: [...localEvent.sessionIds, data.id],
    };
    setLocalEvent(updated);
    setSession(data);
    sessionRef.current = data;
    setVoteCount(0); setAvgScore(null);
    await loadHistory(updated.sessionIds);
    setSessionBusy(false);
  };

  const toggleVoting = async (open: boolean) => {
    if (!session) return;
    setSessionBusy(true);
    await supabase.from("slam_sessions").update({ voting_open: open }).eq("id", session.id);
    setSessionBusy(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (locked) return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARK} 0%, #2A2666 40%, #1a1850 100%)`,
      fontFamily: "'Nunito', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } body{margin:0}`}</style>
      <div style={{ textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: "2.8rem", marginBottom: 18 }}>🔐</div>
        <h1 style={{ color: "white", fontWeight: 900, fontSize: "1.5rem", marginBottom: 8 }}>
          Pannello Organizzatore
        </h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.85rem", marginBottom: 32 }}>
          Inserisci la chiave per accedere
        </p>
        <input
          id="admin-password-input"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Chiave segreta"
          style={{
            width: "100%", padding: "14px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            border: pwdError ? `1.5px solid ${RED}` : "1.5px solid rgba(255,255,255,0.15)",
            color: "white", fontSize: "1rem", fontFamily: "'Nunito', sans-serif",
            outline: "none", marginBottom: 12, textAlign: "center", letterSpacing: "0.18em",
            transition: "border-color 0.2s",
          }}
        />
        {pwdError && (
          <p style={{ color: "#FF9999", fontSize: "0.82rem", marginBottom: 14 }}>
            Chiave errata — riprova
          </p>
        )}
        <button
          id="admin-login-btn"
          onClick={handleLogin}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12,
            background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
            color: "white", fontWeight: 900, fontSize: "1rem",
            border: "none", cursor: "pointer",
            boxShadow: `0 8px 24px ${BLUE}55`,
          }}
        >
          Entra →
        </button>
        <Link href="/vota-live" style={{
          display: "block", marginTop: 22,
          color: "rgba(255,255,255,0.28)", fontSize: "0.75rem",
          textDecoration: "none", fontFamily: "'Space Mono', monospace",
        }}>
          ← Pagina voto pubblico
        </Link>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN PANEL
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARK} 0%, #2A2666 40%, #1a1850 100%)`,
      fontFamily: "'Nunito', sans-serif",
      color: "white",
    }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { margin:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: rgba(255,255,255,0.28); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(1); opacity:0.4; cursor:pointer; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: 28,
        }}>
          <div>
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.42em",
              textTransform: "uppercase", color: BLUE_LIGHT,
              fontFamily: "'Space Mono', monospace", marginBottom: 5,
            }}>🎛️ Organizzatore</p>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900 }}>Pannello Admin</h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
            {localEvent && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(42,138,90,0.18)", border: "1px solid rgba(42,138,90,0.38)",
                borderRadius: 8, padding: "5px 10px",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#3DC878",
                  display: "inline-block", animation: "pulse 1.5s infinite",
                }} />
                <span style={{ fontSize: "0.72rem", color: "#3DC878", fontWeight: 700 }}>
                  {localEvent.name}
                </span>
              </div>
            )}
            <Link href="/vota-live" target="_blank" style={{
              fontSize: "0.7rem", color: "rgba(255,255,255,0.38)", textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "6px 12px", borderRadius: 8,
            }}>
              Vista pubblico ↗
            </Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 5, marginBottom: 26,
          background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 5,
        }}>
          {([
            { id: "serata" as Tab, label: "🎪 Serata" },
            { id: "poeti"  as Tab, label: "🎤 Poeti"  },
            { id: "live"   as Tab, label: "🔴 Live"   },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                fontWeight: 800, fontSize: "0.88rem", cursor: "pointer",
                transition: "all 0.2s",
                background: tab === t.id ? "rgba(255,255,255,0.13)" : "transparent",
                color: tab === t.id ? "white" : "rgba(255,255,255,0.38)",
                boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TAB: SERATA
        ══════════════════════════════════════════ */}
        {tab === "serata" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>

            {!localEvent ? (
              /* Crea nuova serata */
              <div style={cardStyle}>
                <p style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                  fontFamily: "'Space Mono', monospace", marginBottom: 16,
                }}>Nuova Serata</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    id="evt-name-input"
                    value={evtName}
                    onChange={(e) => setEvtName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createEvent()}
                    placeholder="Nome della serata *"
                    style={inputStyle}
                  />
                  <input
                    id="evt-date-input"
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    id="evt-create-btn"
                    onClick={createEvent}
                    disabled={!evtName.trim()}
                    style={{
                      padding: "13px 18px", borderRadius: 10, fontWeight: 900,
                      fontSize: "0.9rem", cursor: "pointer", border: "none",
                      background: evtName.trim()
                        ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`
                        : "rgba(255,255,255,0.07)",
                      color: "white",
                      boxShadow: evtName.trim() ? `0 4px 16px ${BLUE}44` : "none",
                      opacity: !evtName.trim() ? 0.5 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    ✚ Crea Serata
                  </button>
                </div>
              </div>
            ) : (
              /* Serata attiva */
              <>
                <div style={{
                  background: "rgba(42,138,90,0.1)", border: "1.5px solid rgba(42,138,90,0.32)",
                  borderRadius: 20, padding: "20px 22px", marginBottom: 18,
                }}>
                  <p style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                    fontFamily: "'Space Mono', monospace", marginBottom: 10,
                  }}>Serata attiva</p>
                  <p style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: 4 }}>
                    {localEvent.name}
                  </p>
                  {localEvent.date && (
                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)",
                      fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
                      {new Date(localEvent.date).toLocaleDateString("it-IT", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                    <div style={{
                      background: "rgba(255,255,255,0.07)", borderRadius: 10,
                      padding: "8px 14px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)",
                    }}>
                      🎤 {localEvent.poetQueue.length} in coda
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.07)", borderRadius: 10,
                      padding: "8px 14px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)",
                    }}>
                      🎙️ {localEvent.sessionIds.length} esib.
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearEvent}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                    background: "rgba(230,57,70,0.14)", color: RED,
                    fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                  }}
                >
                  🗑 Termina e cancella serata
                </button>

                <p style={{
                  textAlign: "center", marginTop: 12,
                  fontSize: "0.68rem", color: "rgba(255,255,255,0.22)",
                  fontFamily: "'Space Mono', monospace",
                }}>
                  I voti su Supabase restano salvati
                </p>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: POETI
        ══════════════════════════════════════════ */}
        {tab === "poeti" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {!localEvent ? (
              <div style={{
                textAlign: "center", padding: "52px 20px",
                background: "rgba(255,255,255,0.03)", borderRadius: 20,
                color: "rgba(255,255,255,0.32)", fontSize: "0.9rem", lineHeight: 1.9,
              }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🎪</div>
                Nessuna serata attiva.<br />
                <span style={{ fontSize: "0.8rem" }}>Creane una dalla tab Serata.</span>
              </div>
            ) : (
              <>
                <div style={{
                  marginBottom: 18, padding: "10px 14px",
                  background: "rgba(42,138,90,0.12)", border: "1px solid rgba(42,138,90,0.3)",
                  borderRadius: 12, fontSize: "0.82rem", color: "#3DC878", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3DC878",
                    display: "inline-block", animation: "pulse 1.5s infinite" }} />
                  Serata: {localEvent.name}
                </div>

                {/* Form aggiungi */}
                <div style={cardStyle}>
                  <p style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                    fontFamily: "'Space Mono', monospace", marginBottom: 16,
                  }}>Aggiungi Poeta</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      id="poet-name-input"
                      value={poetName}
                      onChange={(e) => setPoetName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPoet()}
                      placeholder="Nome del poeta *"
                      style={inputStyle}
                    />
                    <input
                      id="poem-title-input"
                      value={poemTitle}
                      onChange={(e) => setPoemTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPoet()}
                      placeholder="Titolo della poesia (opzionale)"
                      style={inputStyle}
                    />
                    <button
                      id="add-poet-btn"
                      onClick={addPoet}
                      disabled={!poetName.trim()}
                      style={{
                        padding: "13px 18px", borderRadius: 10, fontWeight: 900,
                        fontSize: "0.9rem", cursor: "pointer", border: "none",
                        background: poetName.trim()
                          ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`
                          : "rgba(255,255,255,0.07)",
                        color: "white",
                        boxShadow: poetName.trim() ? `0 4px 16px ${BLUE}44` : "none",
                        opacity: !poetName.trim() ? 0.5 : 1,
                      }}
                    >
                      ✚ Aggiungi
                    </button>
                  </div>
                </div>

                {/* Lista */}
                <p style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                  fontFamily: "'Space Mono', monospace", marginBottom: 12,
                }}>
                  In coda — {localEvent.poetQueue.length} poet
                  {localEvent.poetQueue.length === 1 ? "a" : "i"}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {localEvent.poetQueue.length === 0 ? (
                    <div style={{
                      textAlign: "center", padding: "28px 20px",
                      background: "rgba(255,255,255,0.03)", borderRadius: 16,
                      color: "rgba(255,255,255,0.28)", fontSize: "0.85rem",
                    }}>
                      Nessun poeta. Aggiungili qui sopra.
                    </div>
                  ) : (
                    localEvent.poetQueue.map((poet, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 14, padding: "14px 16px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", minWidth: 20,
                          }}>{i + 1}.</span>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "0.92rem" }}>{poet.name}</p>
                            {poet.poem && (
                              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                                &ldquo;{poet.poem}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removePoet(i)}
                          style={{
                            background: "rgba(230,57,70,0.14)", border: "none",
                            cursor: "pointer", color: RED,
                            fontWeight: 800, borderRadius: 8, padding: "6px 11px",
                          }}
                        >🗑</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: LIVE
        ══════════════════════════════════════════ */}
        {tab === "live" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {!localEvent ? (
              <div style={{
                textAlign: "center", padding: "52px 20px",
                background: "rgba(255,255,255,0.03)", borderRadius: 20,
                color: "rgba(255,255,255,0.32)", fontSize: "0.9rem", lineHeight: 1.9,
              }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🎪</div>
                Nessuna serata attiva.<br />
                <span style={{ fontSize: "0.8rem" }}>Creane una dalla tab Serata.</span>
              </div>
            ) : (
              <>
                {/* Coda prossimi */}
                {localEvent.poetQueue.length > 0 && (
                  <div style={{ ...cardStyle, marginBottom: 18 }}>
                    <p style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                      fontFamily: "'Space Mono', monospace", marginBottom: 16,
                    }}>Prossimi in scena</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {localEvent.poetQueue.map((poet, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: "0.68rem", color: "rgba(255,255,255,0.22)",
                              fontFamily: "'Space Mono', monospace",
                            }}>{i + 1}.</span>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{poet.name}</p>
                              {poet.poem && (
                                <p style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                                  &ldquo;{poet.poem}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => callPoet(poet)}
                            disabled={sessionBusy}
                            style={{
                              padding: "8px 15px", borderRadius: 9, border: "none", cursor: "pointer",
                              background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
                              color: "white", fontWeight: 800, fontSize: "0.78rem",
                              boxShadow: `0 3px 10px ${BLUE}44`,
                              opacity: sessionBusy ? 0.5 : 1,
                            }}
                          >
                            🎤 Chiama
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sessione corrente */}
                {session ? (
                  <div style={{
                    background: "rgba(255,255,255,0.05)",
                    border: session.voting_open
                      ? "1.5px solid rgba(42,138,90,0.4)"
                      : "1.5px solid rgba(255,255,255,0.09)",
                    borderRadius: 20, padding: "20px 22px", marginBottom: 18,
                    transition: "border-color 0.3s",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", gap: 12, marginBottom: 16,
                    }}>
                      <div>
                        <p style={{
                          fontSize: "0.58rem", letterSpacing: "0.42em", textTransform: "uppercase",
                          color: "rgba(255,255,255,0.28)", fontFamily: "'Space Mono', monospace", marginBottom: 7,
                        }}>In scena adesso</p>
                        <p style={{ fontSize: "1.2rem", fontWeight: 900 }}>{session.poet_name}</p>
                        {session.poem_title && (
                          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                            &ldquo;{session.poem_title}&rdquo;
                          </p>
                        )}
                      </div>
                      {session.voting_open ? (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                          background: "rgba(42,138,90,0.2)", border: "1px solid rgba(42,138,90,0.5)",
                          borderRadius: 100, padding: "5px 12px",
                        }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%", background: "#3DC878",
                            boxShadow: "0 0 8px #3DC878", display: "inline-block",
                            animation: "pulse 1.5s infinite",
                          }} />
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#3DC878" }}>LIVE</span>
                        </div>
                      ) : (
                        <div style={{
                          flexShrink: 0, background: "rgba(255,255,255,0.07)",
                          borderRadius: 100, padding: "5px 12px",
                        }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.35)" }}>
                            IN PAUSA
                          </span>
                        </div>
                      )}
                    </div>

                    {voteCount > 0 && (
                      <div style={{
                        marginBottom: 16, padding: "12px 16px",
                        background: "rgba(255,255,255,0.04)", borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                          {voteCount} {voteCount === 1 ? "voto" : "voti"} ricevuti
                        </span>
                        {avgScore !== null && (
                          <span style={{
                            fontSize: "1.9rem", fontWeight: 900,
                            fontFamily: "'Space Mono', monospace", color: scoreColor(avgScore),
                          }}>
                            {avgScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <button
                        id="open-vote-btn"
                        onClick={() => toggleVoting(true)}
                        disabled={sessionBusy || session.voting_open}
                        style={{
                          padding: "16px 0", borderRadius: 14, fontWeight: 900, fontSize: "1rem",
                          cursor: session.voting_open ? "not-allowed" : "pointer",
                          border: "none", transition: "all 0.2s",
                          background: session.voting_open ? "rgba(42,138,90,0.15)" : GREEN,
                          color: "white", opacity: session.voting_open ? 0.45 : 1,
                          boxShadow: session.voting_open ? "none" : "0 4px 16px rgba(42,138,90,0.4)",
                        }}
                      >🟢 Apri Voto</button>
                      <button
                        id="close-vote-btn"
                        onClick={() => toggleVoting(false)}
                        disabled={sessionBusy || !session.voting_open}
                        style={{
                          padding: "16px 0", borderRadius: 14, fontWeight: 900, fontSize: "1rem",
                          cursor: !session.voting_open ? "not-allowed" : "pointer",
                          border: "none", transition: "all 0.2s",
                          background: !session.voting_open ? "rgba(230,57,70,0.15)" : RED,
                          color: "white", opacity: !session.voting_open ? 0.45 : 1,
                          boxShadow: !session.voting_open ? "none" : "0 4px 16px rgba(230,57,70,0.4)",
                        }}
                      >🔴 Chiudi Voto</button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "32px 20px",
                    background: "rgba(255,255,255,0.03)", borderRadius: 16,
                    color: "rgba(255,255,255,0.28)", fontSize: "0.85rem", marginBottom: 18,
                  }}>
                    {localEvent.poetQueue.length > 0
                      ? "Premi 🎤 Chiama per iniziare."
                      : "Aggiungi poeti dalla tab Poeti."}
                  </div>
                )}

                {/* Storico serata */}
                {history.length > 0 && (
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: "18px 22px",
                  }}>
                    <p style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.26)",
                      fontFamily: "'Space Mono', monospace", marginBottom: 14,
                    }}>Risultati serata</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {history.map((h, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.04)", borderRadius: 10,
                        }}>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{h.poet}</p>
                            {h.poem && (
                              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.32)", fontStyle: "italic" }}>
                                &ldquo;{h.poem}&rdquo;
                              </p>
                            )}
                            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", marginTop: 2 }}>
                              {h.count} {h.count === 1 ? "voto" : "voti"}
                            </p>
                          </div>
                          <span style={{
                            fontSize: "1.6rem", fontWeight: 900,
                            fontFamily: "'Space Mono', monospace", color: scoreColor(h.avg),
                          }}>
                            {h.avg.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <p style={{
          textAlign: "center", marginTop: 48,
          fontSize: "0.6rem", color: "rgba(255,255,255,0.14)",
          letterSpacing: "0.15em", textTransform: "uppercase",
          fontFamily: "'Space Mono', monospace",
        }}>
          Gelatina · Admin
        </p>
      </div>
    </div>
  );
}
