import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Upload, FileAudio, Loader2, CheckCircle, Globe, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { hasAiApiKeys } from "../lib/aiConfig";
import toast from "react-hot-toast";

interface VoiceNote {
  id: string;
  duration_seconds: number | null;
  transcript: string | null;
  language: string;
  processing_status: string;
  created_at: string;
}

const languageLabels: Record<string, string> = {
  mfe: "Kreol Morisien",
  en: "English",
  fr: "Français",
};

export function VoiceUploadPage() {
  const { user, profile } = useAuth();
  const [assistantLane, setAssistantLane] = useState<"staff" | "client">("staff");
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState("mfe");
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (profile?.role === "client") setAssistantLane("client");
    else setAssistantLane("staff");
  }, [profile?.role]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const uploadNote = async () => {
    if (!audioBlob || !user) return;
    setUploading(true);
    try {
      const path = `voice/${user.id}/${Date.now()}.webm`;
      const { error: storageError } = await supabase.storage.from("documents").upload(path, audioBlob, { contentType: "audio/webm" });
      if (storageError) throw storageError;

      const { error: dbError } = await db.voiceNotes().insert({
        client_id: user.id,
        file_path: path,
        duration_seconds: duration,
        language,
        processing_status: "pending",
      });

      if (dbError) throw dbError;

      toast.success(
        aiReady
          ? "Voice note uploaded. Transcription will be ready shortly."
          : "Voice note uploaded. Add an AI key later to enable transcription.",
      );
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      loadNotes();
    } catch {
      toast.error("Failed to upload voice note.");
    } finally {
      setUploading(false);
    }
  };

  const loadNotes = useCallback(async () => {
    if (!user) return;
    setLoadingNotes(true);
    const { data } = await db.voiceNotes().select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10);
    setNotes((data as VoiceNote[]) ?? []);
    setLoadingNotes(false);
  }, [user]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const aiReady = hasAiApiKeys();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Voice Note Upload</h2>
        <p className="text-muted-foreground">
          {aiReady
            ? "Record in Kreol Morisien, English, or French — transcription runs when your backend is wired to the AI provider."
            : "Record voice notes for your files. Transcription and assistant replies stay in placeholder mode until you add API keys (see below)."}
        </p>
      </div>

      {!aiReady && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/95 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="font-semibold text-surface-foreground dark:text-amber-50">AI transcription &amp; assistants — not configured</p>
          <p className="mt-1 text-muted-foreground dark:text-amber-100/90">
            Add one of these to <code className="rounded bg-white/70 px-1 py-0.5 text-xs dark:bg-black/30">frontend/.env</code> (then restart the dev server or rebuild). Keys are read at build time in Vite; use Edge Functions or a backend proxy in production.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs sm:text-sm">
            <li>
              <code className="font-mono">VITE_OPENROUTER_API_KEY</code> — recommended low-cost default for this project (OpenRouter)
            </li>
            <li>
              <code className="font-mono">VITE_GEMINI_API_KEY</code> — Gemini fallback / alternative provider
            </li>
            <li>
              <code className="font-mono">VITE_OPENAI_API_KEY</code> or <code className="font-mono">VITE_AI_API_KEY</code> — optional compatibility hooks
            </li>
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/25 p-4">
        <p className="text-sm font-semibold text-surface-foreground">AI assistant lanes (preview)</p>
        {aiReady ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Separate broker-desk and client-care assistants are planned. This toggle only adjusts on-screen guidance for now.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAssistantLane("staff")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${assistantLane === "staff" ? "bg-primary-600 text-white" : "border border-border bg-surface text-muted-foreground"}`}
              >
                Broker desk
              </button>
              <button
                type="button"
                onClick={() => setAssistantLane("client")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${assistantLane === "client" ? "bg-primary-600 text-white" : "border border-border bg-surface text-muted-foreground"}`}
              >
                Client care
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {assistantLane === "staff"
                ? "Tip: mention policy numbers, diary dates, and underwriting questions clearly for the desk transcript."
                : "Tip: speak in short sentences when explaining premiums or payment steps so the client summary stays easy to read."}
            </p>
          </>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-dashed border-border bg-surface/80 p-3 dark:bg-surface/40">
              <p className="text-xs font-semibold text-surface-foreground">Broker desk (placeholder)</p>
              <p className="mt-2 text-xs italic text-muted-foreground">
                [Assistant summary will appear here after <code className="not-italic">VITE_OPENROUTER_API_KEY</code> (or another supported key) is set and the Edge pipeline is connected.]
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-surface/80 p-3 dark:bg-surface/40">
              <p className="text-xs font-semibold text-surface-foreground">Client care (placeholder)</p>
              <p className="mt-2 text-xs italic text-muted-foreground">
                [Plain-language client tips will render here once the client-care model endpoint is configured.]
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recorder */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <select
              aria-label="Select transcription language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none cursor-pointer"
            >
              <option value="mfe">Kreol Morisien</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="flex flex-col items-center gap-4 py-4">
            {recording ? (
              <>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-danger-50 border-4 border-danger-200">
                  <div className="absolute inset-0 rounded-full bg-danger-200 animate-ping opacity-30" />
                  <Mic className="h-10 w-10 text-danger-600" />
                </div>
                <p className="text-2xl font-mono font-bold text-surface-foreground">{formatDuration(duration)}</p>
                <p className="text-sm text-danger-600 font-medium animate-pulse">Recording in {languageLabels[language]}…</p>
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-full bg-danger-600 px-6 py-3 text-sm font-semibold text-white hover:bg-danger-700 cursor-pointer transition-colors duration-200"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </button>
              </>
            ) : (
              <>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 border-4 border-primary-200">
                  <Mic className="h-10 w-10 text-primary-600" />
                </div>
                <p className="text-sm text-muted-foreground text-center">Click to start recording your voice note in {languageLabels[language]}</p>
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </button>
              </>
            )}
          </div>

          {audioUrl && !recording && (
            <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
              <p className="text-sm font-medium text-surface-foreground">Recording ready ({formatDuration(duration)})</p>
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex gap-3">
                <button
                  onClick={() => { setAudioBlob(null); setAudioUrl(null); setDuration(0); }}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={uploadNote}
                  disabled={uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : aiReady ? "Upload & Transcribe" : "Upload Note"}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4 text-sm dark:text-primary-100/95 bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-950/55 dark:border-primary-700/50">
            {aiReady ? (
              <>
                <strong>Powered by Speech-to-Text AI</strong> — Supports Kreol Morisien (Mauritian Creole), English, and French transcription via your configured provider.
              </>
            ) : (
              <>
                <strong>Upload API is active.</strong> Voice notes save to Supabase now; add an AI key later to enable automatic transcription.
              </>
            )}
          </div>
        </div>

        {/* Past notes */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-surface-foreground">Past Voice Notes</h3>
            <button onClick={loadNotes} className="text-xs text-primary-600 hover:underline cursor-pointer">
              Load Notes
            </button>
          </div>

          {loadingNotes ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground gap-2">
              <FileAudio className="h-10 w-10 opacity-30" />
              <p className="text-sm">No voice notes yet. Click "Load Notes" to fetch.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-surface-foreground">{languageLabels[note.language]}</span>
                      {note.duration_seconds && (
                        <span className="text-xs text-muted-foreground">{formatDuration(note.duration_seconds)}</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      note.processing_status === "done" ? "bg-accent-50 text-accent-600" :
                      note.processing_status === "failed" ? "bg-danger-50 text-danger-600" :
                      "bg-warning-50 text-warning-600"
                    }`}>
                      {note.processing_status === "done" ? <CheckCircle className="h-3 w-3" /> :
                       note.processing_status === "failed" ? <AlertCircle className="h-3 w-3" /> :
                       <Loader2 className="h-3 w-3 animate-spin" />}
                      {note.processing_status}
                    </span>
                  </div>
                  {note.transcript && (
                    <p className="text-sm text-muted-foreground italic">"{note.transcript}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
