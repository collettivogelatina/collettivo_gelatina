"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://agymwlchcofmrsyuegli.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW13bGNoY29mbXJzeXVlZ2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MzUsImV4cCI6MjA5ODA1MTczNX0.sGPrYL_kdVgOGpaNKTa_xAHYbkeH7mt0cfR9ruVOq48"
);

const ADMIN_KEY = "gelatina2025";
const BLUE      = "#4B44DF";
const BLUE_MID  = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const DARK      = "#1C1A4A";

interface SlamSession {
  id: string;
  poet_name: string;
  poem_title: string;
  voting_open: boolean;
  created_at: string;
}

function getFingerprint(): string {
  const key = "slam_voter_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, fp);
  }
  return fp;
}

function scoreLabel(s: number): string {
  if (s <= 3)  return "Hmm...";
  if (s <= 5)  return "Non male";
  if (s <= 7)  return "Bello!";
  if (s <= 9)  return "Ottimo!";
  return "Perfetto! 🔥";
}

function scoreColor(s: number): string {
  if (s <= 4)  return "#E05555";
  if (s <= 6)  return "#C49200";
  if (s <= 8)  return "#2A8A5A";
  return BLUE;
}

export default function VotaLive() {
  const [isAdmin, setIsAdmin]         = useState(false);
  const [session, setSession]         = useState<SlamSession | null>(null);
  const [loading, setLoading]         = useState(true);
  const [score, setScore]             = useState(7.0);
  const [voted, setVoted]             = useState(false);
  const [voteCount, setVoteCount]     = useState(0);
  const [avgScore, setAvgScore]       = useState<number | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [voteError, setVoteError]     = useState("");
  const [poetName, setPoetName]       = useState("");
  const [poemTitle, setPoemTitle]     = useState("");
  const [adminBusy, setAdminBusy]     = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionRef = useRef<SlamSession | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get("admin") === ADMIN_KEY);
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

  const checkAlreadyVoted = useCallback(async (sessionId: string) => {
    const fp = getFingerprint();
    const { data } = await supabase
      .from("slam_votes")
      .select("id, score")
      .eq("session_id", sessionId)
      .eq("fingerprint", fp)
      .maybeSingle();
    if (data) {
      setVoted(true);
      setScore(Number(data.score));
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
    loadSession();

    const ch = supabase
      .channel("slam_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_sessions" }, () => {
        loadSession();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, (payload) => {
        const sid = (payload.new as { session_id?: string })?.session_id ?? sessionRef.current?.id;
        if (sid) loadVoteStats(sid);
      })
      .subscribe();

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [loadSession, loadVoteStats]);

  useEffect(() => {
    if (session?.id) {
      loadVoteStats(session.id);
      checkAlreadyVoted(session.id);
    }
    if (!session?.voting_open) {
      setVoted(false);
    }
  }, [session?.id, session?.voting_open, loadVoteStats, checkAlreadyVoted]);

  const submitVote = async () => {
    if (!session || !session.voting_open || voted) return;
    setSubmitting(true);
    setVoteError("");
    const fp = getFingerprint();
    const { error } = await supabase.from("slam_votes").upsert(
      { session_id: session.id, fingerprint: fp, score },
      { onConflict: "session_id,fingerprint" }
    );
    if (error) {
      setVoteError("Errore nell'invio del voto. Riprova.");
    } else {
      setVoted(true);
      await loadVoteStats(session.id);
    }
    setSubmitting(false);
  };

  const adminNewSession = async () => {
    if (!poetName.trim()) return;
    setAdminBusy(true);
    await supabase.from("slam_sessions").insert({
      poet_name: poetName.trim(),
      poem_title: poemTitle.trim(),
      voting_open: false,
    });
    setPoetName("");
    setPoemTitle("");
    setAdminBusy(false);
  };

  const adminToggleVoting = async (open: boolean) => {
    if (!session) return;
    setAdminBusy(true);
    await supabase
      .from("slam_sessions")
      .update({ voting_open: open })
      .eq("id", session.id);
    setAdminBusy(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARK} 0%, #2A2666 40%, #1a1850 100%)`,
      fontFamily: "'Nunito', sans-serif",
      color: "white",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 4px; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position:"absolute", top:-120, right:-80, width:400, height:400,
        borderRadius:"63% 37% 54% 46% / 55% 48% 52% 45%",
        background:`radial-gradient(circle, ${BLUE_MID}30 0%, transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-100, left:-60, width:350, height:350,
        borderRadius:"40% 60% 70% 30% / 60% 40% 60% 40%",
        background:`radial-gradient(circle, ${BLUE_LIGHT}20 0%, transparent 70%)`, pointerEvents:"none" }} />

      <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px 60px", position:"relative", zIndex:1 }}>

        {/* Back */}
        <Link href="/" style={{
          display:"inline-flex", alignItems:"center", gap:6,
          color:"rgba(255,255,255,0.4)", fontSize:"0.72rem",
          fontWeight:700, textDecoration:"none", marginBottom:32,
          letterSpacing:"0.12em", textTransform:"uppercase",
          fontFamily:"'Space Mono', monospace",
        }}>
          ← Torna al sito
        </Link>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:40, animation:"fadeIn 0.6s ease" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:72, height:72, borderRadius:20, marginBottom:20,
            background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
            fontSize:"2rem", boxShadow:`0 8px 32px ${BLUE}66`,
          }}>🤚</div>
          <h1 style={{
            fontSize:"clamp(1.8rem, 5vw, 2.8rem)", fontWeight:900, marginBottom:8,
            background:`linear-gradient(135deg, white 0%, ${BLUE_LIGHT} 100%)`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>
            Vota in Livestream
          </h1>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.92rem" }}>
            Assegna il tuo voto al poeta — da 1.0 a 10.0
          </p>
        </div>

        {/* ── ADMIN PANEL ── */}
        {isAdmin && (
          <div style={{
            background:"rgba(255,255,255,0.06)", border:`1.5px solid ${BLUE_MID}55`,
            borderRadius:20, padding:"20px 24px", marginBottom:28,
          }}>
            <p style={{
              fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.35em",
              textTransform:"uppercase", color:BLUE_LIGHT,
              fontFamily:"'Space Mono', monospace", marginBottom:14,
            }}>🎛️ Pannello Organizzatore</p>

            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
              <input value={poetName} onChange={e => setPoetName(e.target.value)}
                placeholder="Nome del poeta *"
                style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                  borderRadius:10, padding:"10px 14px", color:"white",
                  fontSize:"0.9rem", fontFamily:"'Nunito', sans-serif", outline:"none" }} />
              <input value={poemTitle} onChange={e => setPoemTitle(e.target.value)}
                placeholder="Titolo della poesia (opzionale)"
                style={{ background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.12)",
                  borderRadius:10, padding:"10px 14px", color:"white",
                  fontSize:"0.9rem", fontFamily:"'Nunito', sans-serif", outline:"none" }} />
              <button onClick={adminNewSession} disabled={adminBusy || !poetName.trim()}
                style={{ background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(255,255,255,0.18)",
                  borderRadius:10, padding:"10px 18px", color:"white",
                  fontSize:"0.85rem", fontWeight:700, cursor:"pointer",
                  opacity: adminBusy || !poetName.trim() ? 0.45 : 1 }}>
                ✚ Crea nuova sessione
              </button>
            </div>

            {session && (
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => adminToggleVoting(true)} disabled={adminBusy || session.voting_open}
                  style={{ flex:1, padding:"11px 0", borderRadius:10, fontWeight:900,
                    fontSize:"0.88rem", cursor:"pointer", border:"none",
                    background: session.voting_open ? "rgba(42,138,90,0.3)" : "#2A8A5A",
                    color:"white", opacity: session.voting_open ? 0.5 : 1 }}>
                  🟢 Apri Voto
                </button>
                <button onClick={() => adminToggleVoting(false)} disabled={adminBusy || !session.voting_open}
                  style={{ flex:1, padding:"11px 0", borderRadius:10, fontWeight:900,
                    fontSize:"0.88rem", cursor:"pointer", border:"none",
                    background: !session.voting_open ? "rgba(230,57,70,0.3)" : "#E63946",
                    color:"white", opacity: !session.voting_open ? 0.5 : 1 }}>
                  🔴 Chiudi Voto
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MAIN STATE ── */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", margin:"0 auto 16px",
              border:`3px solid ${BLUE_LIGHT}33`, borderTop:`3px solid ${BLUE_LIGHT}`,
              animation:"spin 1s linear infinite" }} />
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.9rem" }}>Connessione in corso...</p>
          </div>
        ) : !session ? (
          <div style={{ textAlign:"center", padding:"60px 20px", animation:"fadeIn 0.5s ease" }}>
            <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🎙️</div>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"1rem", lineHeight:1.7 }}>
              Nessuna serata in corso al momento.<br />Torna quando lo slam è live!
            </p>
          </div>
        ) : (
          <div style={{ animation:"fadeIn 0.5s ease" }}>
            {/* Carta poeta */}
            <div style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.08)",
              borderRadius:20, padding:"20px 24px", marginBottom:20, textAlign:"center" }}>
              <p style={{ fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.45em",
                textTransform:"uppercase", color:"rgba(255,255,255,0.3)",
                fontFamily:"'Space Mono', monospace", marginBottom:8 }}>In scena adesso</p>
              <p style={{ fontSize:"1.5rem", fontWeight:900, marginBottom: session.poem_title ? 4 : 0 }}>
                {session.poet_name}
              </p>
              {session.poem_title && (
                <p style={{ fontSize:"0.88rem", color:"rgba(255,255,255,0.42)", fontStyle:"italic" }}>
                  &ldquo;{session.poem_title}&rdquo;
                </p>
              )}
            </div>

            {/* VOTO APERTO — non ancora votato */}
            {session.voting_open && !voted && (
              <div style={{ background:`linear-gradient(135deg, rgba(75,68,223,0.18), rgba(122,116,255,0.10))`,
                border:`1.5px solid ${BLUE_MID}66`, borderRadius:24, padding:"32px 28px", textAlign:"center" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:7,
                  background:"rgba(42,138,90,0.18)", border:"1px solid rgba(42,138,90,0.45)",
                  borderRadius:100, padding:"5px 16px", marginBottom:28 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:"#3DC878",
                    boxShadow:"0 0 10px #3DC878", display:"inline-block", animation:"pulse 1.5s infinite" }} />
                  <span style={{ fontSize:"0.72rem", fontWeight:800, color:"#3DC878", letterSpacing:"0.06em" }}>
                    VOTO APERTO
                  </span>
                </div>

                <div style={{ fontSize:"5.5rem", fontWeight:900, lineHeight:1,
                  color: scoreColor(score), marginBottom:4,
                  fontFamily:"'Space Mono', monospace", transition:"color 0.2s" }}>
                  {score.toFixed(1)}
                </div>
                <p style={{ fontSize:"1rem", fontWeight:700, marginBottom:28,
                  color: scoreColor(score), transition:"color 0.2s" }}>
                  {scoreLabel(score)}
                </p>

                <div style={{ marginBottom:28 }}>
                  <input type="range" min={1} max={10} step={0.1} value={score}
                    onChange={e => setScore(parseFloat(e.target.value))}
                    style={{ accentColor: scoreColor(score) }} />
                  <div style={{ display:"flex", justifyContent:"space-between",
                    fontSize:"0.7rem", color:"rgba(255,255,255,0.28)",
                    fontFamily:"'Space Mono', monospace", marginTop:6 }}>
                    <span>1.0</span><span>5.0</span><span>10.0</span>
                  </div>
                </div>

                <button onClick={submitVote} disabled={submitting}
                  style={{ width:"100%", padding:"16px 0", borderRadius:14,
                    background:`linear-gradient(135deg, ${BLUE} 0%, ${BLUE_MID} 100%)`,
                    color:"white", fontWeight:900, fontSize:"1.05rem",
                    border:"none", cursor:"pointer",
                    boxShadow:`0 8px 24px ${BLUE}55`,
                    opacity: submitting ? 0.65 : 1,
                    transition:"opacity 0.2s, transform 0.15s",
                    transform: submitting ? "scale(0.98)" : "scale(1)" }}>
                  {submitting ? "Invio..." : `🤚  Vota  ${score.toFixed(1)}`}
                </button>
                {voteError && <p style={{ color:"#FF9999", fontSize:"0.82rem", marginTop:10 }}>{voteError}</p>}
              </div>
            )}

            {/* VOTO INVIATO */}
            {session.voting_open && voted && (
              <div style={{ background:"rgba(42,138,90,0.10)", border:"1.5px solid rgba(42,138,90,0.32)",
                borderRadius:24, padding:"36px 28px", textAlign:"center" }}>
                <div style={{ fontSize:"3rem", marginBottom:12 }}>✅</div>
                <p style={{ fontSize:"1.1rem", fontWeight:900, color:"#3DC878", marginBottom:4 }}>
                  Voto registrato!
                </p>
                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.9rem" }}>
                  Hai votato <strong style={{ color:"white" }}>{score.toFixed(1)}</strong> per {session.poet_name}
                </p>
                {avgScore !== null && (
                  <div style={{ marginTop:24, padding:"16px 20px",
                    background:"rgba(255,255,255,0.05)", borderRadius:14 }}>
                    <p style={{ fontSize:"0.62rem", letterSpacing:"0.38em", color:"rgba(255,255,255,0.32)",
                      fontFamily:"'Space Mono', monospace", marginBottom:6, textTransform:"uppercase" }}>
                      Media live — {voteCount} {voteCount === 1 ? "voto" : "voti"}
                    </p>
                    <p style={{ fontSize:"2.8rem", fontWeight:900, color:scoreColor(avgScore),
                      fontFamily:"'Space Mono', monospace" }}>
                      {avgScore.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VOTO CHIUSO */}
            {!session.voting_open && (
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.07)",
                borderRadius:24, padding:"44px 28px", textAlign:"center" }}>
                <div style={{ fontSize:"2.8rem", marginBottom:14 }}>⏳</div>
                <p style={{ fontSize:"1rem", fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>
                  In attesa del segnale...
                </p>
                <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.28)" }}>
                  Il voto si aprirà al termine della poesia
                </p>
                {avgScore !== null && voteCount > 0 && (
                  <div style={{ marginTop:28, padding:"16px 20px",
                    background:"rgba(255,255,255,0.04)", borderRadius:14,
                    border:"1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize:"0.62rem", letterSpacing:"0.38em", color:"rgba(255,255,255,0.28)",
                      fontFamily:"'Space Mono', monospace", marginBottom:6, textTransform:"uppercase" }}>
                      Ultimo risultato — {voteCount} {voteCount === 1 ? "voto" : "voti"}
                    </p>
                    <p style={{ fontSize:"2.4rem", fontWeight:900, color:scoreColor(avgScore),
                      fontFamily:"'Space Mono', monospace" }}>
                      {avgScore.toFixed(1)}
                    </p>
                    <p style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.3)", marginTop:4 }}>
                      {session.poet_name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {session.voting_open && (
              <p style={{ textAlign:"center", marginTop:14,
                fontSize:"0.72rem", color:"rgba(255,255,255,0.22)",
                fontFamily:"'Space Mono', monospace" }}>
                {voteCount} {voteCount === 1 ? "voto" : "voti"} ricevuti
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign:"center", marginTop:52,
          fontSize:"0.62rem", color:"rgba(255,255,255,0.18)",
          letterSpacing:"0.14em", textTransform:"uppercase",
          fontFamily:"'Space Mono', monospace" }}>
          Gelatina · LIPS
        </p>
      </div>
    </div>
  );
}
