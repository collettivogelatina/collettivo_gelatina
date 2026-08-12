"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://agymwlchcofmrsyuegli.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW13bGNoY29mbXJzeXVlZ2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MzUsImV4cCI6MjA5ODA1MTczNX0.sGPrYL_kdVgOGpaNKTa_xAHYbkeH7mt0cfR9ruVOq48"
);

const PASSWORD   = "gelat1na!";
const BLUE       = "#4B44DF";
const BLUE_MID   = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const DARK       = "#1C1A4A";
const GREEN      = "#2A8A5A";
const RED        = "#E63946";

type Tab = "serata" | "poeti" | "live";

interface Poet {
  name: string;
  poem: string;
}

interface SlamEvent {
  id: string;
  name: string;
  event_date: string | null;
  active: boolean;
  poets: Poet[];
  created_at: string;
}

interface SlamSession {
  id: string;
  poet_name: string;
  poem_title: string;
  voting_open: boolean;
  event_id: string | null;
  created_at: string;
}

interface HistoryEntry {
  poet: string;
  poem: string;
  avg: number;
  count: number;
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
  borderRadius: 10,
  padding: "11px 14px",
  color: "white",
  fontSize: "0.92rem",
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  width: "100%",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1.5px solid rgba(255,255,255,0.09)",
  borderRadius: 20,
  padding: "20px 22px",
  marginBottom: 18,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // ── Auth ──
  const [locked, setLocked]     = useState(true);
  const [pwd, setPwd]           = useState("");
  const [pwdError, setPwdError] = useState(false);

  // ── UI ──
  const [tab, setTab] = useState<Tab>("serata");
  const [dbError, setDbError] = useState<string | null>(null);

  // ── Events ──
  const [events, setEvents]         = useState<SlamEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<SlamEvent | null>(null);
  const [evtName, setEvtName]       = useState("");
  const [evtDate, setEvtDate]       = useState("");
  const [evtBusy, setEvtBusy]       = useState(false);

  // ── Poets form ──
  const [poetName, setPoetName]   = useState("");
  const [poemTitle, setPoemTitle] = useState("");
  const [poetBusy, setPoetBusy]   = useState(false);

  // ── Live ──
  const [session, setSession]         = useState<SlamSession | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [voteCount, setVoteCount]     = useState(0);
  const [avgScore, setAvgScore]       = useState<number | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);

  const channelRef      = useRef<RealtimeChannel | null>(null);
  const sessionRef      = useRef<SlamSession | null>(null);
  const activeEventRef  = useRef<SlamEvent | null>(null);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("slam_events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setDbError(`Errore caricamento serate: ${error.message}`);
      return;
    }
    setDbError(null);
    const evts = (data ?? []) as SlamEvent[];
    setEvents(evts);
    const active = evts.find((e) => e.active) ?? null;
    setActiveEvent(active);
    activeEventRef.current = active;
  }, []);

  const loadSession = useCallback(async (eventId?: string) => {
    const eid = eventId ?? activeEventRef.current?.id;
    if (!eid) { setSession(null); sessionRef.current = null; return; }
    const { data } = await supabase
      .from("slam_sessions")
      .select("*")
      .eq("event_id", eid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data ?? null);
    sessionRef.current = data ?? null;
  }, []);

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

  const loadHistory = useCallback(async (eventId: string) => {
    const { data: sessions } = await supabase
      .from("slam_sessions")
      .select("id, poet_name, poem_title")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    if (!sessions) return;

    const results: HistoryEntry[] = await Promise.all(
      sessions.map(async (s) => {
        const { data: votes } = await supabase
          .from("slam_votes")
          .select("score")
          .eq("session_id", s.id);
        const count = votes?.length ?? 0;
        const avg = count > 0
          ? votes!.reduce((acc: number, v: { score: number }) => acc + Number(v.score), 0) / count
          : 0;
        return { poet: s.poet_name, poem: s.poem_title, avg: Math.round(avg * 10) / 10, count };
      })
    );
    setHistory(results.filter((r) => r.count > 0));
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (locked) return;
    loadEvents();
  }, [locked, loadEvents]);

  useEffect(() => {
    if (locked || !activeEvent) return;
    loadSession(activeEvent.id);
    loadHistory(activeEvent.id);
  }, [locked, activeEvent?.id, loadSession, loadHistory]);

  useEffect(() => {
    if (session?.id) loadVoteStats(session.id);
  }, [session?.id, loadVoteStats]);

  useEffect(() => {
    if (locked) return;
    const ch = supabase
      .channel("admin_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_events" }, () => {
        loadEvents();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_sessions" }, () => {
        loadSession();
        if (activeEventRef.current) loadHistory(activeEventRef.current.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, (payload) => {
        const sid =
          (payload.new as { session_id?: string })?.session_id ?? sessionRef.current?.id;
        if (sid) loadVoteStats(sid);
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [locked, loadEvents, loadSession, loadHistory, loadVoteStats]);

  // ── Auth handlers ─────────────────────────────────────────────────────────

  const handleLogin = () => {
    if (pwd === PASSWORD) { setLocked(false); setPwdError(false); }
    else setPwdError(true);
  };

  // ── Event handlers ────────────────────────────────────────────────────────

  const createEvent = async () => {
    if (!evtName.trim()) return;
    setEvtBusy(true);
    setDbError(null);
    const { error } = await supabase.from("slam_events").insert({
      name: evtName.trim(),
      event_date: evtDate || null,
      active: false,
      poets: [],
    });
    if (error) {
      setDbError(`Errore creazione serata: ${error.message}`);
      setEvtBusy(false);
      return;
    }
    setEvtName(""); setEvtDate("");
    await loadEvents();
    setEvtBusy(false);
  };

  const activateEvent = async (evt: SlamEvent) => {
    setEvtBusy(true);
    await supabase.from("slam_events").update({ active: false }).neq("id", evt.id);
    await supabase.from("slam_events").update({ active: true }).eq("id", evt.id);
    await loadEvents();
    setEvtBusy(false);
  };

  const deactivateEvent = async (evt: SlamEvent) => {
    setEvtBusy(true);
    await supabase.from("slam_events").update({ active: false }).eq("id", evt.id);
    await loadEvents();
    setEvtBusy(false);
  };

  // ── Poet handlers ─────────────────────────────────────────────────────────

  const addPoet = async () => {
    if (!poetName.trim() || !activeEvent) return;
    setPoetBusy(true);
    setDbError(null);
    const newPoets = [...(activeEvent.poets ?? []), { name: poetName.trim(), poem: poemTitle.trim() }];
    const { error } = await supabase.from("slam_events").update({ poets: newPoets }).eq("id", activeEvent.id);
    if (error) {
      setDbError(`Errore aggiunta poeta: ${error.message}`);
      setPoetBusy(false);
      return;
    }
    setPoetName(""); setPoemTitle("");
    await loadEvents();
    setPoetBusy(false);
  };

  const removePoet = async (index: number) => {
    if (!activeEvent) return;
    const newPoets = activeEvent.poets.filter((_, i) => i !== index);
    await supabase.from("slam_events").update({ poets: newPoets }).eq("id", activeEvent.id);
    await loadEvents();
  };

  const callPoet = async (poet: Poet) => {
    if (!activeEvent) return;
    setSessionBusy(true);
    // Remove from queue first
    const newPoets = activeEvent.poets.filter((p) => !(p.name === poet.name && p.poem === poet.poem));
    await supabase.from("slam_events").update({ poets: newPoets }).eq("id", activeEvent.id);
    // Create session
    await supabase.from("slam_sessions").insert({
      poet_name: poet.name,
      poem_title: poet.poem,
      voting_open: false,
      event_id: activeEvent.id,
    });
    await loadEvents();
    await loadSession(activeEvent.id);
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
        <Link
          href="/vota-live"
          style={{
            display: "block", marginTop: 22,
            color: "rgba(255,255,255,0.28)", fontSize: "0.75rem",
            textDecoration: "none", fontFamily: "'Space Mono', monospace",
          }}
        >
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
            }}>
              🎛️ Organizzatore
            </p>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900 }}>Pannello Admin</h1>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
            {activeEvent && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(42,138,90,0.18)", border: "1px solid rgba(42,138,90,0.38)",
                borderRadius: 8, padding: "5px 10px",
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#3DC878",
                  boxShadow: "0 0 6px #3DC878", display: "inline-block",
                  animation: "pulse 1.5s infinite",
                }} />
                <span style={{ fontSize: "0.72rem", color: "#3DC878", fontWeight: 700 }}>
                  {activeEvent.name}
                </span>
              </div>
            )}
            <Link
              href="/vota-live"
              target="_blank"
              style={{
                fontSize: "0.7rem", color: "rgba(255,255,255,0.38)", textDecoration: "none",
                fontFamily: "'Space Mono', monospace",
                border: "1px solid rgba(255,255,255,0.14)",
                padding: "6px 12px", borderRadius: 8,
              }}
            >
              Vista pubblico ↗
            </Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 5, marginBottom: 26,
          background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 5,
        }}>
          {(
            [
              { id: "serata" as Tab, label: "🎪 Serata" },
              { id: "poeti"  as Tab, label: "🎤 Poeti"  },
              { id: "live"   as Tab, label: "🔴 Live"   },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
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

        {/* Error banner */}
        {dbError && (
          <div style={{
            marginBottom: 18, padding: "12px 16px",
            background: "rgba(230,57,70,0.18)", border: "1.5px solid rgba(230,57,70,0.45)",
            borderRadius: 12, fontSize: "0.82rem", color: "#FF9999",
            fontFamily: "'Space Mono', monospace", lineHeight: 1.6,
          }}>
            ⚠️ {dbError}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: SERATA
        ══════════════════════════════════════════ */}
        {tab === "serata" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Create */}
            <div style={cardStyle}>
              <p style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                fontFamily: "'Space Mono', monospace", marginBottom: 16,
              }}>
                Nuova Serata
              </p>
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
                  disabled={evtBusy || !evtName.trim()}
                  style={{
                    padding: "12px 18px", borderRadius: 10, fontWeight: 900,
                    fontSize: "0.9rem", cursor: "pointer", border: "none",
                    background: evtName.trim()
                      ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`
                      : "rgba(255,255,255,0.07)",
                    color: "white",
                    boxShadow: evtName.trim() ? `0 4px 16px ${BLUE}44` : "none",
                    opacity: evtBusy || !evtName.trim() ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {evtBusy ? "..." : "✚ Crea Serata"}
                </button>
              </div>
            </div>

            {/* List */}
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              fontFamily: "'Space Mono', monospace", marginBottom: 12,
            }}>
              Serate
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "36px 20px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 16,
                  color: "rgba(255,255,255,0.28)", fontSize: "0.88rem",
                }}>
                  Nessuna serata. Creane una qui sopra.
                </div>
              )}
              {events.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: evt.active ? "rgba(42,138,90,0.1)" : "rgba(255,255,255,0.04)",
                    border: evt.active
                      ? "1.5px solid rgba(42,138,90,0.32)"
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16, padding: "16px 18px",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 12,
                    transition: "all 0.2s",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      {evt.active && (
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%", background: "#3DC878",
                          boxShadow: "0 0 6px #3DC878", display: "inline-block",
                          animation: "pulse 1.5s infinite",
                        }} />
                      )}
                      <p style={{ fontWeight: 800, fontSize: "0.95rem" }}>{evt.name}</p>
                    </div>
                    {evt.event_date && (
                      <p style={{
                        fontSize: "0.7rem", color: "rgba(255,255,255,0.32)",
                        fontFamily: "'Space Mono', monospace", marginBottom: 3,
                      }}>
                        {new Date(evt.event_date).toLocaleDateString("it-IT", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)" }}>
                      {(evt.poets ?? []).length} poet
                      {(evt.poets ?? []).length === 1 ? "a" : "i"} in lista
                    </p>
                  </div>
                  {evt.active ? (
                    <button
                      onClick={() => deactivateEvent(evt)}
                      disabled={evtBusy}
                      style={{
                        padding: "8px 14px", borderRadius: 9, border: "none",
                        cursor: "pointer", background: "rgba(230,57,70,0.18)",
                        color: RED, fontWeight: 800, fontSize: "0.78rem",
                        opacity: evtBusy ? 0.5 : 1,
                      }}
                    >
                      Disattiva
                    </button>
                  ) : (
                    <button
                      onClick={() => activateEvent(evt)}
                      disabled={evtBusy}
                      style={{
                        padding: "8px 14px", borderRadius: 9, border: "none",
                        cursor: "pointer", background: "rgba(42,138,90,0.18)",
                        color: "#3DC878", fontWeight: 800, fontSize: "0.78rem",
                        opacity: evtBusy ? 0.5 : 1,
                      }}
                    >
                      Attiva
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: POETI
        ══════════════════════════════════════════ */}
        {tab === "poeti" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {!activeEvent ? (
              <div style={{
                textAlign: "center", padding: "52px 20px",
                background: "rgba(255,255,255,0.03)", borderRadius: 20,
                color: "rgba(255,255,255,0.32)", fontSize: "0.9rem", lineHeight: 1.9,
              }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🎪</div>
                Nessuna serata attiva.<br />
                <span style={{ fontSize: "0.8rem" }}>Vai nella tab Serata e attivane una.</span>
              </div>
            ) : (
              <>
                <div style={{
                  marginBottom: 18, padding: "10px 14px",
                  background: "rgba(42,138,90,0.12)", border: "1px solid rgba(42,138,90,0.3)",
                  borderRadius: 12, fontSize: "0.82rem", color: "#3DC878", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#3DC878",
                    display: "inline-block", animation: "pulse 1.5s infinite",
                  }} />
                  Serata attiva: {activeEvent.name}
                </div>

                {/* Add poet */}
                <div style={cardStyle}>
                  <p style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                    fontFamily: "'Space Mono', monospace", marginBottom: 16,
                  }}>
                    Aggiungi Poeta
                  </p>
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
                      disabled={poetBusy || !poetName.trim()}
                      style={{
                        padding: "12px 18px", borderRadius: 10, fontWeight: 900,
                        fontSize: "0.9rem", cursor: "pointer", border: "none",
                        background: poetName.trim()
                          ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`
                          : "rgba(255,255,255,0.07)",
                        color: "white",
                        boxShadow: poetName.trim() ? `0 4px 16px ${BLUE}44` : "none",
                        opacity: poetBusy || !poetName.trim() ? 0.5 : 1,
                      }}
                    >
                      {poetBusy ? "..." : "✚ Aggiungi"}
                    </button>
                  </div>
                </div>

                {/* Poet list */}
                <p style={{
                  fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                  fontFamily: "'Space Mono', monospace", marginBottom: 12,
                }}>
                  In lista — {(activeEvent.poets ?? []).length} poet
                  {(activeEvent.poets ?? []).length === 1 ? "a" : "i"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(activeEvent.poets ?? []).length === 0 ? (
                    <div style={{
                      textAlign: "center", padding: "28px 20px",
                      background: "rgba(255,255,255,0.03)", borderRadius: 16,
                      color: "rgba(255,255,255,0.28)", fontSize: "0.85rem",
                    }}>
                      Nessun poeta. Aggiungili qui sopra.
                    </div>
                  ) : (
                    (activeEvent.poets ?? []).map((poet, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14, padding: "14px 16px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", minWidth: 20,
                          }}>
                            {i + 1}.
                          </span>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "0.92rem" }}>{poet.name}</p>
                            {poet.poem && (
                              <p style={{
                                fontSize: "0.75rem", color: "rgba(255,255,255,0.35)",
                                fontStyle: "italic",
                              }}>
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
                            fontWeight: 800, borderRadius: 8,
                            padding: "6px 11px", fontSize: "0.85rem",
                          }}
                          title="Rimuovi dalla lista"
                        >
                          🗑
                        </button>
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
            {!activeEvent ? (
              <div style={{
                textAlign: "center", padding: "52px 20px",
                background: "rgba(255,255,255,0.03)", borderRadius: 20,
                color: "rgba(255,255,255,0.32)", fontSize: "0.9rem", lineHeight: 1.9,
              }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🎪</div>
                Nessuna serata attiva.<br />
                <span style={{ fontSize: "0.8rem" }}>Vai nella tab Serata e attivane una.</span>
              </div>
            ) : (
              <>
                {/* Queue */}
                {(activeEvent.poets ?? []).length > 0 && (
                  <div style={{ ...cardStyle, marginBottom: 18 }}>
                    <p style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.32)",
                      fontFamily: "'Space Mono', monospace", marginBottom: 16,
                    }}>
                      Prossimi in scena
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(activeEvent.poets ?? []).map((poet, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 12, padding: "12px 14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              fontSize: "0.68rem", color: "rgba(255,255,255,0.22)",
                              fontFamily: "'Space Mono', monospace",
                            }}>
                              {i + 1}.
                            </span>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{poet.name}</p>
                              {poet.poem && (
                                <p style={{
                                  fontSize: "0.73rem", color: "rgba(255,255,255,0.35)",
                                  fontStyle: "italic",
                                }}>
                                  &ldquo;{poet.poem}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => callPoet(poet)}
                            disabled={sessionBusy}
                            style={{
                              padding: "8px 15px", borderRadius: 9, border: "none",
                              cursor: "pointer",
                              background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
                              color: "white", fontWeight: 800, fontSize: "0.78rem",
                              boxShadow: `0 3px 10px ${BLUE}44`,
                              opacity: sessionBusy ? 0.5 : 1,
                              transition: "all 0.2s",
                            }}
                          >
                            🎤 Chiama
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current session */}
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
                          fontSize: "0.58rem", letterSpacing: "0.42em",
                          textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                          fontFamily: "'Space Mono', monospace", marginBottom: 7,
                        }}>
                          In scena adesso
                        </p>
                        <p style={{ fontSize: "1.2rem", fontWeight: 900 }}>
                          {session.poet_name}
                        </p>
                        {session.poem_title && (
                          <p style={{
                            fontSize: "0.85rem", color: "rgba(255,255,255,0.4)",
                            fontStyle: "italic",
                          }}>
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
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#3DC878" }}>
                            LIVE
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          flexShrink: 0, background: "rgba(255,255,255,0.07)",
                          borderRadius: 100, padding: "5px 12px",
                        }}>
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 800,
                            color: "rgba(255,255,255,0.35)",
                          }}>
                            IN PAUSA
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live stats */}
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
                            fontFamily: "'Space Mono', monospace",
                            color: scoreColor(avgScore),
                          }}>
                            {avgScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Open / Close voting */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <button
                        id="open-vote-btn"
                        onClick={() => toggleVoting(true)}
                        disabled={sessionBusy || session.voting_open}
                        style={{
                          padding: "16px 0", borderRadius: 14, fontWeight: 900,
                          fontSize: "1rem",
                          cursor: session.voting_open ? "not-allowed" : "pointer",
                          border: "none", transition: "all 0.2s",
                          background: session.voting_open ? "rgba(42,138,90,0.15)" : GREEN,
                          color: "white",
                          opacity: session.voting_open ? 0.45 : 1,
                          boxShadow: session.voting_open ? "none" : "0 4px 16px rgba(42,138,90,0.4)",
                        }}
                      >
                        🟢 Apri Voto
                      </button>
                      <button
                        id="close-vote-btn"
                        onClick={() => toggleVoting(false)}
                        disabled={sessionBusy || !session.voting_open}
                        style={{
                          padding: "16px 0", borderRadius: 14, fontWeight: 900,
                          fontSize: "1rem",
                          cursor: !session.voting_open ? "not-allowed" : "pointer",
                          border: "none", transition: "all 0.2s",
                          background: !session.voting_open ? "rgba(230,57,70,0.15)" : RED,
                          color: "white",
                          opacity: !session.voting_open ? 0.45 : 1,
                          boxShadow: !session.voting_open ? "none" : "0 4px 16px rgba(230,57,70,0.4)",
                        }}
                      >
                        🔴 Chiudi Voto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "32px 20px",
                    background: "rgba(255,255,255,0.03)", borderRadius: 16,
                    color: "rgba(255,255,255,0.28)", fontSize: "0.85rem", marginBottom: 18,
                  }}>
                    {(activeEvent.poets ?? []).length > 0
                      ? "Premi 🎤 Chiama per iniziare."
                      : "Nessun poeta in lista. Aggiungili dalla tab Poeti."
                    }
                  </div>
                )}

                {/* Serata history */}
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
                    }}>
                      Risultati serata
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {history.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.04)", borderRadius: 10,
                          }}
                        >
                          <div>
                            <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{h.poet}</p>
                            {h.poem && (
                              <p style={{
                                fontSize: "0.75rem", color: "rgba(255,255,255,0.32)",
                                fontStyle: "italic",
                              }}>
                                &ldquo;{h.poem}&rdquo;
                              </p>
                            )}
                            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", marginTop: 2 }}>
                              {h.count} {h.count === 1 ? "voto" : "voti"}
                            </p>
                          </div>
                          <span style={{
                            fontSize: "1.6rem", fontWeight: 900,
                            fontFamily: "'Space Mono', monospace",
                            color: scoreColor(h.avg),
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
