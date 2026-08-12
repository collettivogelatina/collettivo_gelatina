"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://agymwlchcofmrsyuegli.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW13bGNoY29mbXJzeXVlZ2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MzUsImV4cCI6MjA5ODA1MTczNX0.sGPrYL_kdVgOGpaNKTa_xAHYbkeH7mt0cfR9ruVOq48"
);

const BLUE     = "#4B44DF";
const BLUE_MID = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const DARK     = "#1C1A4A";

interface SlamSession {
  id: string;
  poet_name: string;
  poem_title: string;
  voting_open: boolean;
  created_at: string;
}

function scoreColor(s: number): string {
  if (s <= 4) return "#E05555";
  if (s <= 6) return "#C49200";
  if (s <= 8) return "#2A8A5A";
  return BLUE;
}

export default function AdminPage() {
  const [locked, setLocked]         = useState(true);
  const [pin, setPin]               = useState("");
  const [pinError, setPinError]     = useState(false);

  const [session, setSession]       = useState<SlamSession | null>(null);
  const [loading, setLoading]       = useState(true);
  const [poetName, setPoetName]     = useState("");
  const [poemTitle, setPoemTitle]   = useState("");
  const [busy, setBusy]             = useState(false);
  const [voteCount, setVoteCount]   = useState(0);
  const [avgScore, setAvgScore]     = useState<number | null>(null);
  const [history, setHistory]       = useState<{ poet: string; poem: string; avg: number; count: number }[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionRef = useRef<SlamSession | null>(null);

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

  const loadSession = useCallback(async () => {
    const { data } = await supabase
      .from("slam_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data ?? null);
    sessionRef.current = data ?? null;
    setLoading(false);
  }, []);

  useEffect(() => {
    if (locked) return;
    loadSession();

    const ch = supabase
      .channel("admin_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_sessions" }, () => loadSession())
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, (payload) => {
        const sid = (payload.new as { session_id?: string })?.session_id ?? sessionRef.current?.id;
        if (sid) loadVoteStats(sid);
      })
      .subscribe();

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [locked, loadSession, loadVoteStats]);

  useEffect(() => {
    if (session?.id) loadVoteStats(session.id);
  }, [session?.id, loadVoteStats]);

  const handlePin = () => {
    if (pin === "gelatina2025") {
      setLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const newSession = async () => {
    if (!poetName.trim()) return;
    setBusy(true);
    // Salva storico della sessione precedente
    if (session && avgScore !== null) {
      setHistory(h => [{ poet: session.poet_name, poem: session.poem_title, avg: avgScore, count: voteCount }, ...h]);
    }
    await supabase.from("slam_sessions").insert({
      poet_name: poetName.trim(),
      poem_title: poemTitle.trim(),
      voting_open: false,
    });
    setPoetName("");
    setPoemTitle("");
    setBusy(false);
  };

  const toggleVoting = async (open: boolean) => {
    if (!session) return;
    setBusy(true);
    await supabase.from("slam_sessions").update({ voting_open: open }).eq("id", session.id);
    setBusy(false);
  };

  // ── PIN SCREEN ──────────────────────────────────────────────────────────────
  if (locked) return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARK} 0%, #2A2666 40%, #1a1850 100%)`,
      fontFamily: "'Nunito', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } body{margin:0}`}</style>
      <div style={{ textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔐</div>
        <h1 style={{ color: "white", fontWeight: 900, fontSize: "1.4rem", marginBottom: 8 }}>
          Pannello Organizzatore
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginBottom: 28 }}>
          Inserisci la chiave per accedere
        </p>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePin()}
          placeholder="Chiave segreta"
          style={{
            width: "100%", padding: "14px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            border: pinError ? "1.5px solid #E63946" : "1.5px solid rgba(255,255,255,0.15)",
            color: "white", fontSize: "1rem", fontFamily: "'Nunito', sans-serif",
            outline: "none", marginBottom: 12, textAlign: "center", letterSpacing: "0.2em",
          }}
        />
        {pinError && <p style={{ color: "#FF9999", fontSize: "0.82rem", marginBottom: 12 }}>Chiave errata</p>}
        <button onClick={handlePin} style={{
          width: "100%", padding: "14px 0", borderRadius: 12,
          background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
          color: "white", fontWeight: 900, fontSize: "1rem",
          border: "none", cursor: "pointer",
          boxShadow: `0 8px 24px ${BLUE}55`,
        }}>
          Entra →
        </button>
        <Link href="/vota-live" style={{
          display: "block", marginTop: 20,
          color: "rgba(255,255,255,0.3)", fontSize: "0.75rem",
          textDecoration: "none", fontFamily: "'Space Mono', monospace",
        }}>
          ← Pagina voto pubblico
        </Link>
      </div>
    </div>
  );

  // ── ADMIN PANEL ─────────────────────────────────────────────────────────────
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
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.4em",
              textTransform: "uppercase", color: BLUE_LIGHT,
              fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>🎛️ Organizzatore</p>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "white" }}>Pannello Admin</h1>
          </div>
          <Link href="/vota-live" target="_blank" style={{
            fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", textDecoration: "none",
            fontFamily: "'Space Mono', monospace", border: "1px solid rgba(255,255,255,0.15)",
            padding: "6px 12px", borderRadius: 8,
          }}>
            Vista pubblico ↗
          </Link>
        </div>

        {/* Nuova sessione */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid rgba(255,255,255,0.09)`,
          borderRadius: 20, padding: "20px 22px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.35em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
            fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>Nuova poesia</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={poetName} onChange={e => setPoetName(e.target.value)}
              placeholder="Nome del poeta *"
              onKeyDown={e => e.key === "Enter" && newSession()}
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "11px 14px", color: "white",
                fontSize: "0.92rem", fontFamily: "'Nunito', sans-serif", outline: "none" }} />
            <input value={poemTitle} onChange={e => setPoemTitle(e.target.value)}
              placeholder="Titolo (opzionale)"
              onKeyDown={e => e.key === "Enter" && newSession()}
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "11px 14px", color: "white",
                fontSize: "0.92rem", fontFamily: "'Nunito', sans-serif", outline: "none" }} />
            <button onClick={newSession} disabled={busy || !poetName.trim()}
              style={{ padding: "12px 18px", borderRadius: 10, fontWeight: 900,
                fontSize: "0.9rem", cursor: "pointer", border: "none",
                background: poetName.trim() ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})` : "rgba(255,255,255,0.08)",
                color: "white", opacity: busy || !poetName.trim() ? 0.5 : 1,
                boxShadow: poetName.trim() ? `0 4px 16px ${BLUE}44` : "none" }}>
              {busy ? "..." : "✚ Crea sessione"}
            </button>
          </div>
        </div>

        {/* Sessione corrente */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>Caricamento...</div>
        ) : !session ? (
          <div style={{ textAlign: "center", padding: "40px 20px",
            background: "rgba(255,255,255,0.03)", borderRadius: 20,
            color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
            Nessuna sessione attiva.<br />Crea la prima qui sopra.
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Info poeta corrente */}
            <div style={{ background: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${session.voting_open ? "#2A8A5A55" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: "0.62rem", letterSpacing: "0.4em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
                    Sessione corrente
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: session.poem_title ? 3 : 0 }}>
                    {session.poet_name}
                  </p>
                  {session.poem_title && (
                    <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                      &ldquo;{session.poem_title}&rdquo;
                    </p>
                  )}
                </div>
                {/* Stato badge */}
                {session.voting_open ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                    background: "rgba(42,138,90,0.2)", border: "1px solid rgba(42,138,90,0.5)",
                    borderRadius: 100, padding: "5px 12px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3DC878",
                      boxShadow: "0 0 8px #3DC878", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#3DC878" }}>LIVE</span>
                  </div>
                ) : (
                  <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.07)",
                    borderRadius: 100, padding: "5px 12px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.35)" }}>IN PAUSA</span>
                  </div>
                )}
              </div>

              {/* Stats live */}
              {voteCount > 0 && (
                <div style={{ marginTop: 16, padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                    {voteCount} {voteCount === 1 ? "voto" : "voti"} ricevuti
                  </span>
                  {avgScore !== null && (
                    <span style={{ fontSize: "1.8rem", fontWeight: 900,
                      fontFamily: "'Space Mono', monospace", color: scoreColor(avgScore) }}>
                      {avgScore.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottoni apri/chiudi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <button onClick={() => toggleVoting(true)} disabled={busy || session.voting_open}
                style={{ padding: "16px 0", borderRadius: 14, fontWeight: 900,
                  fontSize: "1rem", cursor: session.voting_open ? "not-allowed" : "pointer",
                  border: "none", transition: "all 0.2s",
                  background: session.voting_open ? "rgba(42,138,90,0.15)" : "#2A8A5A",
                  color: "white", opacity: session.voting_open ? 0.45 : 1,
                  boxShadow: session.voting_open ? "none" : "0 4px 16px rgba(42,138,90,0.4)" }}>
                🟢 Apri Voto
              </button>
              <button onClick={() => toggleVoting(false)} disabled={busy || !session.voting_open}
                style={{ padding: "16px 0", borderRadius: 14, fontWeight: 900,
                  fontSize: "1rem", cursor: !session.voting_open ? "not-allowed" : "pointer",
                  border: "none", transition: "all 0.2s",
                  background: !session.voting_open ? "rgba(230,57,70,0.15)" : "#E63946",
                  color: "white", opacity: !session.voting_open ? 0.45 : 1,
                  boxShadow: !session.voting_open ? "none" : "0 4px 16px rgba(230,57,70,0.4)" }}>
                🔴 Chiudi Voto
              </button>
            </div>
          </div>
        )}

        {/* Storico serata */}
        {history.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "18px 22px" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.35em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
              fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>Risultati serata</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{h.poet}</p>
                    {h.poem && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>&ldquo;{h.poem}&rdquo;</p>}
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{h.count} voti</p>
                  </div>
                  <span style={{ fontSize: "1.6rem", fontWeight: 900,
                    fontFamily: "'Space Mono', monospace", color: scoreColor(h.avg) }}>
                    {h.avg.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 40,
          fontSize: "0.62rem", color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.14em", textTransform: "uppercase",
          fontFamily: "'Space Mono', monospace" }}>
          Gelatina · Admin
        </p>
      </div>
    </div>
  );
}
