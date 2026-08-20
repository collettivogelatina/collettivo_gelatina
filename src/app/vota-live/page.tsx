"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://ydbbfseqpzzrtxjveher.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYmJmc2VxcHp6cnR4anZlaGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzY4ODEsImV4cCI6MjEwMjExMjg4MX0.vPfChCcKXttPNoO0gcZAjiPF_XqO0VnWS1BPruMhw7A"
);

const BLUE      = "#4B44DF";
const BLUE_MID  = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";
const DARK      = "#1C1A4A";

interface SlamSession {
  id: string;
  poet_name: string;
  poem_title: string;
  voting_open: boolean;
  audio_url: string | null;
  manche?: number;
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

function scoreColor(s: number): string {
  if (s < 5) return "#E05555";
  if (s < 7) return "#C49200";
  if (s < 9) return "#2A8A5A";
  return BLUE;
}

function SessionCard({
  session,
  userScore,
  isVoted,
  voteCount,
  avgScore,
  onVote
}: {
  session: SlamSession;
  userScore: number;
  isVoted: boolean;
  voteCount: number;
  avgScore: number | null;
  onVote: (sessionId: string, score: number) => Promise<void>;
}) {
  const [localScore, setLocalScore] = useState(userScore);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalScore(userScore);
  }, [userScore]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onVote(session.id, localScore);
    } catch (err: any) {
      setError(err.message || "Errore nell'invio del voto.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1.5px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center",
      animation: "fadeIn 0.5s ease"
    }}>
      <p style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: session.poem_title ? 4 : 12 }}>
        {session.poet_name}
      </p>
      {session.poem_title && (
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: 16 }}>
          &ldquo;{session.poem_title}&rdquo;
        </p>
      )}

      {!session.audio_url ? (
        <div style={{ padding: "24px 0", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            ⏳ In attesa di registrazione
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <audio src={session.audio_url} controls style={{ width: "100%", borderRadius: 10, height: 44 }} />
          </div>

          {session.voting_open ? (
            !isVoted ? (
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                <div style={{ fontSize: "4.5rem", fontWeight: 900, lineHeight: 1, color: scoreColor(localScore), marginBottom: 16, transition: "color 0.2s" }}>
                  {localScore.toFixed(1)}
                </div>
                <input 
                  type="range" min={1} max={10} step={0.1} value={localScore}
                  onChange={e => setLocalScore(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: scoreColor(localScore), marginBottom: 24, cursor: "pointer" }} 
                />
                <button 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 12,
                    background: scoreColor(localScore),
                    color: "white", fontWeight: 800, fontSize: "1.1rem",
                    border: "none", cursor: "pointer",
                    opacity: submitting ? 0.65 : 1
                  }}
                >
                  {submitting ? "Invio in corso..." : `Vota ${localScore.toFixed(1)}`}
                </button>
                {error && <p style={{ color: "#FF9999", fontSize: "0.85rem", marginTop: 10 }}>{error}</p>}
              </div>
            ) : (
              <div style={{ padding: "24px", background: "rgba(42,138,90,0.1)", border: "1px solid rgba(42,138,90,0.3)", borderRadius: 12 }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#3DC878", marginBottom: 8 }}>✅ Hai votato {userScore.toFixed(1)}</p>
                {avgScore !== null && (
                  <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Media live: <strong style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(1)}</strong> ({voteCount} voti)</p>
                )}
              </div>
            )
          ) : (
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>🔒 Votazione chiusa</p>
              {avgScore !== null && voteCount > 0 && (
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Risultato: <strong style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(1)}</strong> ({voteCount} voti)</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function VotaLive() {
  const [sessions, setSessions] = useState<SlamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState<Map<string, { score: number, voted: boolean }>>(new Map());
  const [stats, setStats] = useState<Map<string, { count: number, avg: number | null }>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadVoteStats = useCallback(async (sessionIds: string[]) => {
    if (sessionIds.length === 0) return;
    const { data } = await supabase.from("slam_votes").select("session_id, score").in("session_id", sessionIds);

    const newStats = new Map<string, { count: number, avg: number | null }>();
    if (data) {
      sessionIds.forEach(id => {
        const sessionVotes = data.filter(v => v.session_id === id).map(v => Number(v.score));
        if (sessionVotes.length > 0) {
          let trimmed = sessionVotes;
          if (sessionVotes.length >= 3) {
            const sorted = [...sessionVotes].sort((a,b) => a-b);
            trimmed = sorted.slice(1, sorted.length - 1);
          }
          const avg = trimmed.reduce((a,b) => a+b, 0) / trimmed.length;
          newStats.set(id, { count: sessionVotes.length, avg: Math.round(avg * 10) / 10 });
        } else {
          newStats.set(id, { count: 0, avg: null });
        }
      });
    }
    setStats(prev => {
      const copy = new Map(prev);
      newStats.forEach((val, key) => copy.set(key, val));
      return copy;
    });
  }, []);

  const loadMyVotes = useCallback(async (sessionIds: string[]) => {
    if (sessionIds.length === 0) return;
    const fp = getFingerprint();
    const { data } = await supabase.from("slam_votes").select("session_id, score").in("session_id", sessionIds).eq("fingerprint", fp);

    setMyVotes(prev => {
      const copy = new Map(prev);
      if (data) {
        data.forEach(v => {
          copy.set(v.session_id, { score: Number(v.score), voted: true });
        });
      }
      return copy;
    });
  }, []);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase.from("slam_sessions").select("*").order("created_at", { ascending: true });
    if (data) {
      setSessions(data);
      const allIds = data.map(s => s.id);
      loadVoteStats(allIds);
      loadMyVotes(allIds);
    }
    setLoading(false);
  }, [loadVoteStats, loadMyVotes]);

  useEffect(() => {
    loadSessions();
    const ch = supabase
      .channel("slam_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_sessions" }, () => {
        loadSessions();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, (payload) => {
        const sid = (payload.new as { session_id?: string })?.session_id;
        if (sid) loadVoteStats([sid]);
      })
      .subscribe();

    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [loadSessions, loadVoteStats]);

  const handleVote = async (sessionId: string, score: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.voting_open) return;

    const fp = getFingerprint();
    const { error } = await supabase.from("slam_votes").upsert(
      { session_id: sessionId, fingerprint: fp, score },
      { onConflict: "session_id,fingerprint" }
    );

    if (error) {
      throw new Error("Errore nell'invio del voto. Riprova.");
    } else {
      setMyVotes(prev => {
        const copy = new Map(prev);
        copy.set(sessionId, { score, voted: true });
        return copy;
      });
      await loadVoteStats([sessionId]);
    }
  };

  const manche1 = sessions.filter(s => (s.manche || 1) === 1);
  const manche2 = sessions.filter(s => s.manche === 2);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARK} 0%, #2A2666 40%, #1a1850 100%)`,
      fontFamily: "'Nunito', sans-serif",
      color: "white",
      padding: "20px",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        input[type=range] { -webkit-appearance: none; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; border-radius: 50%; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
        <Link href="/" style={{
          display: "inline-block", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem",
          textDecoration: "none", marginBottom: 32, fontWeight: 700
        }}>
          ← Torna al sito
        </Link>

        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeIn 0.6s ease" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🎤</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 4 }}>VOTA LIVE</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>Gelatina · Poetry Slam</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.5)" }}>Caricamento...</div>
        ) : (
          <>
            {manche1.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>MANCHE 1</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>
                {manche1.map(s => (
                  <SessionCard 
                    key={s.id} session={s}
                    userScore={myVotes.get(s.id)?.score ?? 7.0}
                    isVoted={myVotes.get(s.id)?.voted ?? false}
                    voteCount={stats.get(s.id)?.count ?? 0}
                    avgScore={stats.get(s.id)?.avg ?? null}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}

            {manche2.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>MANCHE 2</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>
                {manche2.map(s => (
                  <SessionCard 
                    key={s.id} session={s}
                    userScore={myVotes.get(s.id)?.score ?? 7.0}
                    isVoted={myVotes.get(s.id)?.voted ?? false}
                    voteCount={stats.get(s.id)?.count ?? 0}
                    avgScore={stats.get(s.id)?.avg ?? null}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}

            {sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 16 }}>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>Nessuna poesia al momento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
