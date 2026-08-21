"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://ydbbfseqpzzrtxjveher.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYmJmc2VxcHp6cnR4anZlaGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MzY4ODEsImV4cCI6MjEwMjExMjg4MX0.vPfChCcKXttPNoO0gcZAjiPF_XqO0VnWS1BPruMhw7A"
);

const PASSWORD    = "gelat1na!";
const BLUE        = "#4B44DF";
const BLUE_MID    = "#7A74FF";
const BLUE_LIGHT  = "#B8B3FF";
const DARK        = "#1C1A4A";
const GREEN       = "#2A8A5A";
const RED         = "#E63946";
const STORAGE_KEY = "gelatina_admin_event_v2";

type Tab = "serata" | "poeti" | "live" | "prova";

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
  audio_url: string | null;
  manche?: number;
  created_at: string;
}

type RecPhase = "idle" | "preparing" | "recording" | "preview" | "uploading";

interface HistoryEntry {
  id: string;
  poet: string;
  poem: string;
  voting_open: boolean;
  audio_url: string | null;
  manche: number;
  scores: number[];
  trimmed: number | null;
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

/** Trimmed mean: rimuove il valore più alto e il più basso, fa la media del resto */
function trimmedMean(scores: number[]): number | null {
  if (scores.length === 0) return null;
  if (scores.length <= 2) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 10) / 10;
  }
  const sorted = [...scores].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, sorted.length - 1);
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  return Math.round(avg * 10) / 10;
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
  const [currentManche, setCurrentManche] = useState<1 | 2>(1);

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
  const [liveScores, setLiveScores]   = useState<number[]>([]);
  const [liveTrimmed, setLiveTrimmed] = useState<number | null>(null);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);

  // ── Registrazione audio ──
  const [recPhase, setRecPhase]     = useState<RecPhase>("idle");
  const [audioBlob, setAudioBlob]   = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recError, setRecError]     = useState<string | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  // ── Prova ──
  const [provaSession, setProvaSession]   = useState<SlamSession | null>(null);
  const [provaScores, setProvaScores]     = useState<number[]>([]);
  const [provaBusy, setProvaBusy]         = useState(false);
  const [provaTrimmed, setProvaTrimmed]   = useState<number | null>(null);
  const [provaError, setProvaError]       = useState<string | null>(null);
  const provaSessionRef = useRef<SlamSession | null>(null);

  const channelRef       = useRef<RealtimeChannel | null>(null);
  const sessionRef       = useRef<SlamSession | null>(null);
  const localEventRef    = useRef<LocalEvent | null>(null); // sempre aggiornato, evita stale closure


  // ── Aggiorna localStorage e stato insieme ──
  const setLocalEvent = (evt: LocalEvent | null) => {
    localEventRef.current = evt;   // aggiorna il ref subito, sincrono
    setLocalEventState(evt);
    saveLocalEvent(evt);
  };

  // ── Loaders ──────────────────────────────────────────────────────────────

  // loadSession: NON dipende da localEvent (usa solo gli IDs passati esplicitamente)
  const loadSession = useCallback(async (sessionIds: string[]) => {
    if (!sessionIds || sessionIds.length === 0) { setSession(null); sessionRef.current = null; return; }
    const { data } = await supabase
      .from("slam_sessions")
      .select("*")
      .in("id", sessionIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSession(data ?? null);
    sessionRef.current = data ?? null;
  }, []); // stabile: nessuna dipendenza esterna

  const loadVoteStats = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from("slam_votes").select("score").eq("session_id", sessionId);
    if (data && data.length > 0) {
      const scores = data.map((r: { score: number }) => Number(r.score));
      setLiveScores(scores);
      const tm = trimmedMean(scores);
      setLiveTrimmed(tm);
      setAvgScore(tm);
      setVoteCount(scores.length);
    } else {
      setLiveScores([]);
      setLiveTrimmed(null);
      setAvgScore(null);
      setVoteCount(0);
    }
  }, []);

  const loadHistory = useCallback(async (sessionIds: string[]) => {
    if (sessionIds.length === 0) { setHistory([]); return; }
    const { data: sessions } = await supabase
      .from("slam_sessions")
      .select("id, poet_name, poem_title, voting_open, audio_url, manche")
      .in("id", sessionIds)
      .order("created_at", { ascending: true });
    if (!sessions) return;
    const results: HistoryEntry[] = await Promise.all(
      sessions.map(async (s) => {
        const { data: votes } = await supabase
          .from("slam_votes").select("score").eq("session_id", s.id);
        const scores = (votes ?? []).map((v: { score: number }) => Number(v.score));
        return {
          id: s.id, poet: s.poet_name, poem: s.poem_title,
          voting_open: s.voting_open, audio_url: s.audio_url, manche: s.manche ?? 1,
          scores, trimmed: trimmedMean(scores),
        };
      })
    );
    setHistory(results); // mostra tutte, anche senza voti
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
    if (session?.id) { setLiveScores([]); setLiveTrimmed(null); loadVoteStats(session.id); }
  }, [session?.id, loadVoteStats]);

  // Carica i voti prova quando cambia la sessione prova
  useEffect(() => {
    if (provaSession?.id) loadProvaScores(provaSession.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provaSession?.id]);

  // Realtime — canale stabile, aggiornamenti in-place (no null flash)
  useEffect(() => {
    if (locked) return;
    const ch = supabase
      .channel("admin_v5")
      // INSERT: callAndRecord già setta il session, qui aggiorno solo la history
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "slam_sessions" }, () => {
        const ids = localEventRef.current?.sessionIds;
        if (ids?.length) loadHistory(ids);
      })
      // UPDATE: patch in-place session + history entry
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "slam_sessions" }, (payload) => {
        const upd = payload.new as { id: string; voting_open: boolean; audio_url: string | null };
        if (sessionRef.current?.id === upd.id) {
          const merged: SlamSession = { ...sessionRef.current, voting_open: upd.voting_open, audio_url: upd.audio_url };
          sessionRef.current = merged;
          setSession(merged);
        }
        // Aggiorna anche l'entry nel palco
        setHistory(prev => prev.map(h =>
          h.id === upd.id ? { ...h, voting_open: upd.voting_open, audio_url: upd.audio_url } : h
        ));
      })
      // VOTES: aggiorna stats live, prova e palco
      .on("postgres_changes", { event: "*", schema: "public", table: "slam_votes" }, async (payload) => {
        const sid = (payload.new as { session_id?: string })?.session_id;
        if (!sid) return;
        if (sid === sessionRef.current?.id) loadVoteStats(sid);
        if (sid === provaSessionRef.current?.id) {
          const { data } = await supabase
            .from("slam_votes").select("score").eq("session_id", sid);
          const scores = (data ?? []).map((r: { score: number }) => Number(r.score));
          setProvaScores(scores); setProvaTrimmed(trimmedMean(scores));
        }
        // Aggiorna entry nel palco (anche per sessioni precedenti)
        const { data: allVotes } = await supabase
          .from("slam_votes").select("score").eq("session_id", sid);
        const updScores = (allVotes ?? []).map((r: { score: number }) => Number(r.score));
        setHistory(prev => prev.map(h =>
          h.id === sid ? { ...h, scores: updScores, trimmed: trimmedMean(updScores) } : h
        ));
      })
      .subscribe();
    channelRef.current = ch;
    return () => { supabase.removeChannel(ch); };
  }, [locked, loadHistory, loadVoteStats]); // stabile: nessuna dipendenza su sessionIds o loadSession


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
      .insert({ poet_name: poet.name, poem_title: poet.poem, voting_open: false, manche: currentManche })
      .select()
      .single();

    if (error || !data) { setSessionBusy(false); return; }

    // Rimuovi dalla coda e salva l'ID della sessione
    const updated: LocalEvent = {
      ...localEvent,
      poetQueue: localEvent.poetQueue,
      sessionIds: [...localEvent.sessionIds, data.id],
    };
    setLocalEvent(updated);
    setSession(data);
    sessionRef.current = data;
    setVoteCount(0); setAvgScore(null); setLiveScores([]); setLiveTrimmed(null);
    setRecPhase("idle"); setAudioBlob(null); setPreviewUrl(null); setRecError(null);
    await loadHistory(updated.sessionIds);
    setSessionBusy(false);
  };

  // Chiama il poeta E avvia subito la registrazione
  const callAndRecord = async (poet: Poet) => {
    if (!localEvent) return;

    // Ferma il recorder precedente: annulla onstop per evitare flash asincrono
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      mediaRecRef.current.onstop = null;  // ← disabilita il vecchio callback
      mediaRecRef.current.ondataavailable = null;
      mediaRecRef.current.stop();
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAudioBlob(null); setPreviewUrl(null); setRecError(null);
    setRecPhase("preparing"); // spinner mentre creiamo la sessione

    setSessionBusy(true);
    const { data, error } = await supabase
      .from("slam_sessions")
      .insert({ poet_name: poet.name, poem_title: poet.poem, voting_open: false, manche: currentManche })
      .select().single();
    if (error || !data) {
      setSessionBusy(false);
      setRecPhase("idle");
      alert(`Errore creazione sessione: ${error?.message}`);
      return;
    }
    const updated: LocalEvent = {
      ...localEvent,
      poetQueue: localEvent.poetQueue,
      sessionIds: [...localEvent.sessionIds, data.id],
    };
    setLocalEvent(updated);
    setSession(data);
    sessionRef.current = data;
    setVoteCount(0); setAvgScore(null); setLiveScores([]); setLiveTrimmed(null);
    await loadHistory(updated.sessionIds);
    setSessionBusy(false);
    // Avvia subito la registrazione
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setRecPhase("preview");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      mediaRecRef.current = mr;
      setRecPhase("recording");
    } catch (err) {
      setRecError(`Microfono non disponibile: ${(err as Error).message}`);
      setRecPhase("idle");
    }
  };

  const toggleVoting = async (open: boolean) => {
    if (!session) return;
    setSessionBusy(true);
    await supabase.from("slam_sessions").update({ voting_open: open }).eq("id", session.id);
    // Aggiorna ottimisticamente anche il palco
    setHistory(prev => prev.map(h => h.id === session.id ? { ...h, voting_open: open } : h));
    setSessionBusy(false);
  };

  const toggleAnySession = async (sessionId: string, open: boolean) => {
    await supabase.from("slam_sessions").update({ voting_open: open }).eq("id", sessionId);
    // Patch ottimistico (il realtime lo confermerà)
    setHistory(prev => prev.map(h => h.id === sessionId ? { ...h, voting_open: open } : h));
    if (sessionRef.current?.id === sessionId) {
      const merged = { ...sessionRef.current, voting_open: open };
      sessionRef.current = merged;
      setSession(merged);
    }
  };

  // ── Registrazione audio ─────────────────────────────────────────────────────

  const startRec = async () => {
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setRecPhase("preview");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      mediaRecRef.current = mr;
      setRecPhase("recording");
    } catch {
      setRecError("Permesso microfono negato. Controlla le impostazioni del browser.");
    }
  };

  const stopRec = () => mediaRecRef.current?.stop();

  const cancelRec = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecPhase("idle");
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecError(null);
  };

  const publishAudio = async () => {
    if (!audioBlob || !session) return;
    setRecPhase("uploading");
    setRecError(null);
    const ext  = audioBlob.type.includes("mp4") ? "m4a" : "webm";
    const path = `slam/${session.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("slam-recordings")
      .upload(path, audioBlob, { contentType: audioBlob.type });
    if (upErr) {
      setRecError(`Errore upload: ${upErr.message}`);
      setRecPhase("preview");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("slam-recordings").getPublicUrl(path);
    const { error: dbErr } = await supabase
      .from("slam_sessions")
      .update({ audio_url: publicUrl })
      .eq("id", session.id);
    if (dbErr) {
      setRecError(`Errore salvataggio: ${dbErr.message}`);
      setRecPhase("preview");
      return;
    }
    // Aggiorna lo stato locale
    setSession((s) => s ? { ...s, audio_url: publicUrl } : s);
    sessionRef.current = sessionRef.current ? { ...sessionRef.current, audio_url: publicUrl } : null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecPhase("idle");
    setAudioBlob(null);
    setPreviewUrl(null);
  };

  // ── Prova handlers ────────────────────────────────────────────────────────

  const loadProvaScores = async (sessionId: string) => {
    const { data } = await supabase
      .from("slam_votes").select("score").eq("session_id", sessionId);
    const scores = (data ?? []).map((r: { score: number }) => Number(r.score));
    setProvaScores(scores);
    setProvaTrimmed(trimmedMean(scores));
  };

  const createProvaSession = async () => {
    setProvaBusy(true);
    setProvaError(null);
    // Chiudi e disattiva eventuale sessione prova precedente
    if (provaSession) {
      await supabase.from("slam_sessions")
        .update({ voting_open: false })
        .eq("id", provaSession.id);
    }
    const { data, error } = await supabase
      .from("slam_sessions")
      .insert({ poet_name: "🧪 Poeta di Prova", poem_title: "Sessione test — non conteggiata", voting_open: false })
      .select().single();
    if (error) {
      setProvaError(`Errore: ${error.message}`);
      setProvaBusy(false);
      return;
    }
    if (data) {
      setProvaSession(data);
      provaSessionRef.current = data;
      setProvaScores([]);
      setProvaTrimmed(null);
    }
    setProvaBusy(false);
  };

  const toggleProvaVoting = async (open: boolean) => {
    if (!provaSession) return;
    setProvaBusy(true);
    await supabase.from("slam_sessions").update({ voting_open: open }).eq("id", provaSession.id);
    setProvaSession(s => s ? { ...s, voting_open: open } : s);
    setProvaBusy(false);
  };

  const resetProvaVotes = async () => {
    if (!provaSession) return;
    setProvaBusy(true);
    await supabase.from("slam_votes").delete().eq("session_id", provaSession.id);
    setProvaScores([]);
    setProvaTrimmed(null);
    setProvaBusy(false);
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
            { id: "prova"  as Tab, label: "🧪 Prova"  },
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
                    {/* Avviso se c'è una registrazione in corso */}
                    {(recPhase !== "idle" || (session && !session.audio_url)) && (
                      <p style={{
                        fontSize: "0.68rem", color: "rgba(255,100,80,0.85)",
                        fontFamily: "'Space Mono', monospace",
                        padding: "6px 10px", marginBottom: 8,
                        background: "rgba(255,80,60,0.1)", borderRadius: 8,
                        border: "1px solid rgba(255,80,60,0.2)",
                      }}>
                        ⏸️ Completa la registrazione in corso prima di passare al prossimo poeta
                      </p>
                    )}
                    
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      <button
                        onClick={() => setCurrentManche(1)}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                          fontWeight: 800, fontSize: "0.9rem",
                          background: currentManche === 1 ? BLUE : "rgba(255,255,255,0.05)",
                          color: currentManche === 1 ? "white" : "rgba(255,255,255,0.4)"
                        }}
                      >Manche 1</button>
                      <button
                        onClick={() => setCurrentManche(2)}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                          fontWeight: 800, fontSize: "0.9rem",
                          background: currentManche === 2 ? BLUE : "rgba(255,255,255,0.05)",
                          color: currentManche === 2 ? "white" : "rgba(255,255,255,0.4)"
                        }}
                      >Manche 2</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {localEvent.poetQueue.map((poet, i) => {
                        const isRecording = recPhase !== "idle" || (session !== null && !session.audio_url);
                        const historyEntry = history.find(h => 
                          h.poet === poet.name && 
                          h.poem === poet.poem && 
                          (h.manche ?? 1) === currentManche
                        );
                        const isLiveSession = session?.poet_name === poet.name && 
                          session?.poem_title === poet.poem &&
                          (session?.manche ?? 1) === currentManche;
                        
                        let statusBadge = "⏳ In attesa";
                        let statusColor = "rgba(255,255,255,0.3)";
                        let isDoneOrLive = false;
                        if (historyEntry && historyEntry.audio_url) {
                          statusBadge = "✅ Sul palco";
                          statusColor = "#3DC878";
                          isDoneOrLive = true;
                        } else if (isLiveSession) {
                          statusBadge = "🔴 In registrazione";
                          statusColor = "#FF5555";
                          isDoneOrLive = true;
                        }

                        return (
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
                              <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                                {poet.name}
                                <span style={{ marginLeft: 8, fontSize: "0.65rem", padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: statusColor, border: `1px solid ${statusColor}44` }}>
                                  {statusBadge}
                                </span>
                              </p>
                              {poet.poem && (
                                <p style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                                  &ldquo;{poet.poem}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => callAndRecord(poet)}
                            disabled={sessionBusy || isRecording || isDoneOrLive}
                            style={{
                              padding: "8px 15px", borderRadius: 9, border: "none",
                              cursor: (sessionBusy || isRecording || isDoneOrLive) ? "not-allowed" : "pointer",
                              background: (isRecording || isDoneOrLive)
                                ? "rgba(255,255,255,0.07)"
                                : `linear-gradient(135deg, #C0392B, #E74C3C)`,
                              color: (isRecording || isDoneOrLive) ? "rgba(255,255,255,0.3)" : "white",
                              fontWeight: 800, fontSize: "0.78rem",
                              boxShadow: (isRecording || isDoneOrLive) ? "none" : "0 3px 10px rgba(192,57,43,0.5)",
                              opacity: sessionBusy ? 0.5 : 1,
                              display: "flex", alignItems: "center", gap: 5,
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                              <line x1="12" y1="19" x2="12" y2="23" />
                            </svg>
                            {isDoneOrLive ? "Registrato" : isRecording ? "In attesa..." : "Registra"}
                          </button>
                        </div>
                      )})}
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

                    {/* ── REGISTRAZIONE AUDIO ────────────────────────── */}
                    <div style={{ marginBottom: 18 }}>
                      {recError && (
                        <div style={{
                          padding: "10px 14px", marginBottom: 12,
                          background: "rgba(230,57,70,0.15)", border: "1px solid rgba(230,57,70,0.4)",
                          borderRadius: 10, fontSize: "0.78rem", color: "#FF9999",
                          fontFamily: "'Space Mono', monospace",
                        }}>⚠️ {recError}</div>
                      )}

                      {/* Mostra il player se già pubblicata */}
                      {session.audio_url && recPhase === "idle" && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{
                            fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.28)", fontFamily: "'Space Mono', monospace", marginBottom: 8,
                          }}>🎙️ Registrazione inviata al palco</p>
                          <audio src={session.audio_url} controls style={{ width: "100%", borderRadius: 8 }} />
                          <button onClick={cancelRec} style={{
                            marginTop: 8, fontSize: "0.75rem", padding: "6px 12px", borderRadius: 8,
                            border: "none", background: "rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.5)", cursor: "pointer",
                          }}>↺ Riregistra</button>
                        </div>
                      )}

                      {/* Fase preparing — sessione in creazione, attendi */}
                      {recPhase === "preparing" && (
                        <div style={{ textAlign: "center", padding: "14px 0" }}>
                          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                            ⏳ Inizializzazione...
                          </p>
                        </div>
                      )}

                      {/* Fase idle senza audio */}
                      {!session.audio_url && recPhase === "idle" && (
                        <button onClick={startRec} style={{
                          width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                          background: `linear-gradient(135deg, #C0392B, #E74C3C)`,
                          color: "white", fontWeight: 900, fontSize: "0.95rem",
                          cursor: "pointer", boxShadow: "0 4px 16px rgba(192,57,43,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                          </svg>
                          Registra la poesia
                        </button>
                      )}

                      {/* Fase recording */}
                      {recPhase === "recording" && (
                        <div style={{ textAlign: "center", padding: "10px 0" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12, height: 28 }}>
                            {[...Array(9)].map((_, i) => (
                              <div key={i} style={{
                                width: 3, height: `${10 + (i % 4) * 7}px`, background: "#FF5555",
                                borderRadius: 2, animation: `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                              }} />
                            ))}
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                            <span style={{ color: "#FF5555" }}>●</span> Registrazione in corso...
                          </p>
                          <button onClick={stopRec} style={{
                            padding: "10px 24px", borderRadius: 10, border: "none",
                            background: "rgba(255,255,255,0.1)", color: "white",
                            fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                          }}>■ Stop</button>
                        </div>
                      )}

                      {/* Fase preview */}
                      {recPhase === "preview" && previewUrl && (
                        <div>
                          <p style={{
                            fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginBottom: 8,
                            fontFamily: "'Space Mono', monospace",
                          }}>Ascolta prima di inviare:</p>
                          <audio src={previewUrl} controls style={{ width: "100%", borderRadius: 8, marginBottom: 10 }} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                            <button onClick={publishAudio} style={{
                              padding: "12px 0", borderRadius: 10, border: "none",
                              background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
                              color: "white", fontWeight: 900, fontSize: "0.9rem", cursor: "pointer",
                              boxShadow: `0 4px 14px ${BLUE}55`,
                            }}>📤 Invia al palco</button>
                            <button onClick={cancelRec} style={{
                              padding: "12px 14px", borderRadius: 10, border: "none",
                              background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)",
                              fontWeight: 800, fontSize: "0.82rem", cursor: "pointer",
                            }}>↩ Riregistra</button>
                          </div>
                        </div>
                      )}

                      {/* Fase uploading */}
                      {recPhase === "uploading" && (
                        <div style={{ textAlign: "center", padding: "14px 0" }}>
                          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                            🎙️ Invio in corso...
                          </p>
                        </div>
                      )}
                    </div>

                    {voteCount > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        {/* Trimmed mean */}
                        <div style={{
                          padding: "14px 16px", background: "rgba(255,255,255,0.04)",
                          borderRadius: 12, display: "flex", alignItems: "center",
                          justifyContent: "space-between", marginBottom: 10,
                        }}>
                          <div>
                            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.32)",
                              fontFamily: "'Space Mono', monospace", marginBottom: 3 }}>
                              Media Trimmed · {voteCount} vot{voteCount === 1 ? "o" : "i"}
                              {voteCount >= 3 && " (–max –min)"}
                            </p>
                          </div>
                          {liveTrimmed !== null && (
                            <span style={{
                              fontSize: "2.2rem", fontWeight: 900,
                              fontFamily: "'Space Mono', monospace", color: scoreColor(liveTrimmed),
                            }}>
                              {liveTrimmed.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {/* Voti individuali */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {[...liveScores].sort((a, b) => b - a).map((s, i) => {
                            const sorted = [...liveScores].sort((a, b) => a - b);
                            const isMin = liveScores.length >= 3 && s === sorted[0];
                            const isMax = liveScores.length >= 3 && s === sorted[sorted.length - 1];
                            return (
                              <span key={i} style={{
                                padding: "4px 10px", borderRadius: 7,
                                fontFamily: "'Space Mono', monospace",
                                fontSize: "0.85rem", fontWeight: 700,
                                background: (isMin || isMax) ? "rgba(255,255,255,0.04)" : "rgba(75,68,223,0.2)",
                                color: (isMin || isMax) ? "rgba(255,255,255,0.22)" : scoreColor(s),
                                textDecoration: (isMin || isMax) ? "line-through" : "none",
                              }}>
                                {s.toFixed(1)}
                              </span>
                            );
                          })}
                        </div>
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

                {/* ── PALCO — tutte le sessioni con audio ── */}
                {history.filter(h => h.audio_url).length > 0 && (
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 20, padding: "18px 20px",
                  }}>
                    <p style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                      textTransform: "uppercase", color: "rgba(255,255,255,0.26)",
                      fontFamily: "'Space Mono', monospace", marginBottom: 14,
                    }}>🎭 Palco · {history.filter(h => h.audio_url).length} registrazion{history.filter(h => h.audio_url).length === 1 ? "e" : "i"}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {history.filter(h => h.audio_url).map((h) => {
                        const isLive = h.id === session?.id;
                        const sorted = [...h.scores].sort((a,b)=>a-b);
                        return (
                          <div key={h.id} style={{
                            background: isLive ? "rgba(75,68,223,0.1)" : "rgba(255,255,255,0.04)",
                            border: isLive ? `1px solid ${BLUE_MID}55` : "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 14, padding: "14px 16px",
                          }}>
                            {/* Header poeta */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                              <div>
                                <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{h.poet}</p>
                                {h.poem && <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", fontStyle: "italic" }}>&ldquo;{h.poem}&rdquo;</p>}
                              </div>
                              {isLive && (
                                <span style={{
                                  fontSize: "0.62rem", fontWeight: 800, color: BLUE_LIGHT,
                                  background: `${BLUE}33`, borderRadius: 100,
                                  padding: "3px 10px", fontFamily: "'Space Mono', monospace",
                                }}>LIVE</span>
                              )}
                            </div>
                            {/* Player */}
                            <audio src={h.audio_url!} controls style={{ width: "100%", borderRadius: 8, marginBottom: 10 }} />
                            {/* Vote stats */}
                            {h.scores.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
                                    {h.scores.length} vot{h.scores.length === 1 ? "o" : "i"}{h.scores.length >= 3 ? " · trimmed" : ""}
                                  </span>
                                  {h.trimmed !== null && (
                                    <span style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Space Mono', monospace", color: scoreColor(h.trimmed) }}>
                                      {h.trimmed.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {[...h.scores].sort((a,b)=>b-a).map((s,i) => {
                                    const isMin = h.scores.length>=3 && s===sorted[0];
                                    const isMax = h.scores.length>=3 && s===sorted[sorted.length-1];
                                    return (
                                      <span key={i} style={{
                                        padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700,
                                        fontFamily: "'Space Mono', monospace",
                                        background: (isMin||isMax) ? "rgba(255,255,255,0.04)" : "rgba(75,68,223,0.2)",
                                        color: (isMin||isMax) ? "rgba(255,255,255,0.2)" : scoreColor(s),
                                        textDecoration: (isMin||isMax) ? "line-through" : "none",
                                      }}>{s.toFixed(1)}</span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Toggle voto */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                              <button onClick={() => toggleAnySession(h.id, true)} disabled={h.voting_open}
                                style={{
                                  padding: "9px 0", borderRadius: 10, border: "none", cursor: h.voting_open ? "not-allowed" : "pointer",
                                  background: h.voting_open ? "rgba(42,138,90,0.15)" : GREEN,
                                  color: "white", fontWeight: 800, fontSize: "0.8rem",
                                  opacity: h.voting_open ? 0.45 : 1,
                                }}>🟢 Apri Voto</button>
                              <button onClick={() => toggleAnySession(h.id, false)} disabled={!h.voting_open}
                                style={{
                                  padding: "9px 0", borderRadius: 10, border: "none", cursor: !h.voting_open ? "not-allowed" : "pointer",
                                  background: !h.voting_open ? "rgba(230,57,70,0.15)" : RED,
                                  color: "white", fontWeight: 800, fontSize: "0.8rem",
                                  opacity: !h.voting_open ? 0.45 : 1,
                                }}>🔴 Chiudi Voto</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: PROVA
        ══════════════════════════════════════════ */}
        {tab === "prova" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>

            {/* Intestazione */}
            <div style={{
              marginBottom: 20, padding: "14px 18px",
              background: "rgba(255,200,0,0.08)", border: "1.5px solid rgba(255,200,0,0.2)",
              borderRadius: 14, fontSize: "0.82rem", color: "rgba(255,220,80,0.85)",
              fontFamily: "'Space Mono', monospace", lineHeight: 1.7,
            }}>
              🧪 <strong>Modalità Prova</strong> — visibile solo a te.<br />
              <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                Usa questa sessione per testare il voto dal tuo telefono o da un&apos;altra scheda.
              </span>
            </div>

            {/* Errore */}
            {provaError && (
              <div style={{
                marginBottom: 14, padding: "12px 16px",
                background: "rgba(230,57,70,0.18)", border: "1.5px solid rgba(230,57,70,0.45)",
                borderRadius: 12, fontSize: "0.82rem", color: "#FF9999",
                fontFamily: "'Space Mono', monospace", lineHeight: 1.6,
              }}>
                ⚠️ {provaError}
              </div>
            )}

            {/* Crea sessione prova */}
            {!provaSession ? (
              <button
                onClick={createProvaSession}
                disabled={provaBusy}
                style={{
                  width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
                  background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
                  color: "white", fontWeight: 900, fontSize: "1rem", cursor: "pointer",
                  boxShadow: `0 6px 20px ${BLUE}44`,
                  opacity: provaBusy ? 0.6 : 1,
                  marginBottom: 20,
                }}
              >
                {provaBusy ? "..." : "✚ Crea sessione di prova"}
              </button>
            ) : (
              <>
                {/* Stato sessione */}
                <div style={{
                  ...cardStyle,
                  border: provaSession.voting_open
                    ? "1.5px solid rgba(42,138,90,0.45)"
                    : "1.5px solid rgba(255,255,255,0.09)",
                  transition: "border-color 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                    <div>
                      <p style={{
                        fontSize: "0.58rem", letterSpacing: "0.42em", textTransform: "uppercase",
                        color: "rgba(255,255,255,0.28)", fontFamily: "'Space Mono', monospace", marginBottom: 7,
                      }}>Sessione attiva</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: 900 }}>🧪 Poeta di Prova</p>
                      <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                        Sessione test — non conteggiata
                      </p>
                    </div>
                    {provaSession.voting_open ? (
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
                      <div style={{ flexShrink: 0, background: "rgba(255,255,255,0.07)", borderRadius: 100, padding: "5px 12px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.35)" }}>IN PAUSA</span>
                      </div>
                    )}
                  </div>

                  {/* Controlli voto */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <button
                      onClick={() => toggleProvaVoting(true)}
                      disabled={provaBusy || provaSession.voting_open}
                      style={{
                        padding: "14px 0", borderRadius: 12, fontWeight: 900, fontSize: "0.95rem",
                        cursor: provaSession.voting_open ? "not-allowed" : "pointer",
                        border: "none", transition: "all 0.2s",
                        background: provaSession.voting_open ? "rgba(42,138,90,0.15)" : GREEN,
                        color: "white", opacity: provaSession.voting_open ? 0.4 : 1,
                        boxShadow: provaSession.voting_open ? "none" : "0 4px 14px rgba(42,138,90,0.4)",
                      }}
                    >🟢 Apri Voto</button>
                    <button
                      onClick={() => toggleProvaVoting(false)}
                      disabled={provaBusy || !provaSession.voting_open}
                      style={{
                        padding: "14px 0", borderRadius: 12, fontWeight: 900, fontSize: "0.95rem",
                        cursor: !provaSession.voting_open ? "not-allowed" : "pointer",
                        border: "none", transition: "all 0.2s",
                        background: !provaSession.voting_open ? "rgba(230,57,70,0.15)" : RED,
                        color: "white", opacity: !provaSession.voting_open ? 0.4 : 1,
                        boxShadow: !provaSession.voting_open ? "none" : "0 4px 14px rgba(230,57,70,0.4)",
                      }}
                    >🔴 Chiudi Voto</button>
                  </div>

                  {/* Link per testare come utente */}
                  <a
                    href="/vota-live"
                    target="_blank"
                    style={{
                      display: "block", textAlign: "center", padding: "11px 0",
                      background: "rgba(255,255,255,0.07)", borderRadius: 10,
                      color: "rgba(255,255,255,0.6)", textDecoration: "none",
                      fontSize: "0.82rem", fontWeight: 700,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    → Apri /vota-live in nuova scheda per testare
                  </a>
                </div>

                {/* Risultati live */}
                <div style={cardStyle}>
                  <p style={{
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                    fontFamily: "'Space Mono', monospace", marginBottom: 16,
                  }}>Risultati in tempo reale</p>

                  {provaScores.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
                      Nessun voto ancora ricevuto.
                    </p>
                  ) : (
                    <>
                      {/* Trimmed mean */}
                      <div style={{
                        textAlign: "center", marginBottom: 20,
                        padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: 14,
                      }}>
                        <p style={{
                          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.38em",
                          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                          fontFamily: "'Space Mono', monospace", marginBottom: 8,
                        }}>
                          Media Trimmed · {provaScores.length} vot{provaScores.length === 1 ? "o" : "i"}
                          {provaScores.length >= 3 && " (–max –min)"}
                        </p>
                        <span style={{
                          fontSize: "3.2rem", fontWeight: 900,
                          fontFamily: "'Space Mono', monospace",
                          color: provaTrimmed !== null ? scoreColor(provaTrimmed) : "white",
                        }}>
                          {provaTrimmed !== null ? provaTrimmed.toFixed(1) : "—"}
                        </span>
                      </div>

                      {/* Lista voti individuali */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[...provaScores]
                          .sort((a, b) => b - a)
                          .map((s, i) => {
                            const sorted = [...provaScores].sort((a, b) => a - b);
                            const isMin = provaScores.length >= 3 && s === sorted[0];
                            const isMax = provaScores.length >= 3 && s === sorted[sorted.length - 1];
                            return (
                              <span
                                key={i}
                                style={{
                                  padding: "5px 12px", borderRadius: 8,
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: "0.9rem", fontWeight: 700,
                                  background: (isMin || isMax)
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(75,68,223,0.2)",
                                  color: (isMin || isMax)
                                    ? "rgba(255,255,255,0.25)"
                                    : scoreColor(s),
                                  textDecoration: (isMin || isMax) ? "line-through" : "none",
                                }}
                              >
                                {s.toFixed(1)}
                              </span>
                            );
                          })}
                      </div>
                      {provaScores.length >= 3 && (
                        <p style={{
                          fontSize: "0.68rem", color: "rgba(255,255,255,0.2)",
                          fontFamily: "'Space Mono', monospace", marginTop: 10,
                        }}>
                          I valori barrati sono esclusi dalla media
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Azioni */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={resetProvaVotes}
                    disabled={provaBusy || provaScores.length === 0}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "rgba(230,57,70,0.14)", color: RED,
                      fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                      opacity: provaScores.length === 0 ? 0.4 : 1,
                    }}
                  >
                    🗑 Azzera voti
                  </button>
                  <button
                    onClick={createProvaSession}
                    disabled={provaBusy}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                      background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
                      fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                    }}
                  >
                    ↺ Nuova sessione
                  </button>
                </div>
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
