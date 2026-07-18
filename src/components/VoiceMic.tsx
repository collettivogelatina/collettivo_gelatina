"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://agymwlchcofmrsyuegli.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW13bGNoY29mbXJzeXVlZ2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MzUsImV4cCI6MjA5ODA1MTczNX0.sGPrYL_kdVgOGpaNKTa_xAHYbkeH7mt0cfR9ruVOq48"
);

const BLUE = "#4B44DF";
const BLUE_MID = "#7A74FF";
const BLUE_LIGHT = "#B8B3FF";

interface Message {
  id: string;
  created_at: string;
  audio_url: string;
  nickname: string | null;
}

type Phase = "idle" | "recording" | "preview" | "uploading" | "done";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const WAVEFORM = [3, 5, 8, 6, 9, 5, 7, 4, 6, 8, 5, 3, 7, 6, 4];

export default function VoiceMic() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [nickname, setNickname] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from("voice_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as Message[]);
    setLoadingMessages(false);
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setPhase("preview");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setPhase("recording");
    } catch {
      alert("Permesso microfono negato. Controlla le impostazioni del browser.");
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  const handleUpload = async () => {
    if (!audioBlob) return;
    setPhase("uploading");
    const ext = audioBlob.type.includes("mp4") ? "m4a" : "webm";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { error } = await supabase.storage
      .from("voice-messages")
      .upload(path, audioBlob, { contentType: audioBlob.type });
    if (error) {
      setPhase("preview");
      alert("Errore nell'invio. Riprova.");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("voice-messages").getPublicUrl(path);
    await supabase.from("voice_messages").insert({
      audio_url: publicUrl,
      nickname: nickname.trim() || null,
    });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhase("done");
    loadMessages();
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhase("idle");
    setAudioBlob(null);
    setPreviewUrl(null);
    setNickname("");
  };

  const togglePlay = (msg: Message) => {
    const audio = audioRefs.current.get(msg.id);
    if (!audio) return;
    if (playingId === msg.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audioRefs.current.forEach((a, id) => { if (id !== msg.id) { a.pause(); a.currentTime = 0; } });
      setPlayingId(msg.id);
      audio.play();
      audio.onended = () => setPlayingId(null);
    }
  };

  return (
    <div>
      {/* ─── RECORDER ─── */}
      <div
        className="rounded-3xl p-8 mb-10"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {phase === "idle" && (
          <div className="text-center">
            <button
              onClick={startRecording}
              className="inline-flex items-center gap-3 font-black text-base px-10 py-4 rounded-full transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`,
                color: "white",
                boxShadow: `0 8px 32px rgba(75,68,223,0.45)`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Inizia a registrare
            </button>
            <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
              Il browser chiederà l&apos;accesso al microfono
            </p>
          </div>
        )}

        {phase === "recording" && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-5" style={{ height: 32 }}>
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bar-pulse rounded-full"
                  style={{
                    width: 3,
                    height: `${10 + (i % 4) * 7}px`,
                    background: "#FF5555",
                    animationDuration: `${0.5 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <p className="font-bold text-sm mb-5" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span style={{ color: "#FF5555" }}>● </span>
              Registrazione in corso — leggi la tua poesia
            </p>
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 font-black text-sm px-8 py-3 rounded-full transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              ■ Ferma la registrazione
            </button>
          </div>
        )}

        {phase === "preview" && previewUrl && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-center mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
              Ascolta prima di inviare
            </p>
            <audio src={previewUrl} controls className="w-full" />
            <input
              type="text"
              placeholder="Il tuo nome (facoltativo)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="px-4 py-3 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.09)", color: "white" }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 font-black text-sm py-3 rounded-2xl transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`, color: "white" }}
              >
                Invia al palco →
              </button>
              <button
                onClick={reset}
                className="px-5 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
              >
                Ricomincia
              </button>
            </div>
          </div>
        )}

        {phase === "uploading" && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🎙️</div>
            <p className="font-bold text-white text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              La tua voce sale sul palco...
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✨</div>
            <p className="font-black text-white text-lg mb-2">La tua voce è sul palco!</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              La tua poesia è ora parte di questo spazio.
            </p>
            <button
              onClick={reset}
              className="font-black text-sm px-8 py-3 rounded-full transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              Registra un altro
            </button>
          </div>
        )}
      </div>

      {/* ─── VOCI DAL PALCO ─── */}
      <div>
        <p
          className="text-xs font-bold tracking-[0.4em] uppercase mb-6"
          style={{ color: BLUE_LIGHT, fontFamily: "'Space Mono', monospace" }}
        >
          Voci dal palco{messages.length > 0 ? ` · ${messages.length}` : ""}
        </p>

        {loadingMessages && (
          <p className="text-center text-sm py-8" style={{ color: "rgba(255,255,255,0.25)" }}>
            Caricamento voci...
          </p>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div
            className="text-center py-12 rounded-3xl"
            style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <p className="text-3xl mb-3">🎙️</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              Il palco è silenzioso. Sii la prima voce.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: playingId === msg.id ? "rgba(75,68,223,0.12)" : "transparent",
              }}
            >
              {/* Hidden audio */}
              <audio
                ref={(el) => {
                  if (el) audioRefs.current.set(msg.id, el);
                  else audioRefs.current.delete(msg.id);
                }}
                src={msg.audio_url}
                preload="none"
              />

              {/* Play/pause */}
              <button
                onClick={() => togglePlay(msg)}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: playingId === msg.id
                    ? `linear-gradient(135deg, ${BLUE}, ${BLUE_MID})`
                    : "rgba(255,255,255,0.08)",
                  border: `1px solid ${playingId === msg.id ? "transparent" : "rgba(255,255,255,0.14)"}`,
                  boxShadow: playingId === msg.id ? `0 4px 20px rgba(75,68,223,0.4)` : "none",
                }}
              >
                {playingId === msg.id ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                    <rect x="1.5" y="1.5" width="3" height="9" rx="1" />
                    <rect x="7.5" y="1.5" width="3" height="9" rx="1" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                    <polygon points="2.5,1.5 10.5,6 2.5,10.5" />
                  </svg>
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">
                  {msg.nickname || "Voce anonima"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}
                >
                  {formatDate(msg.created_at)}
                </p>
              </div>

              {/* Decorative waveform */}
              <div className="hidden sm:flex items-center gap-px opacity-25">
                {WAVEFORM.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 2,
                      height: h * 2,
                      background: BLUE_LIGHT,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
