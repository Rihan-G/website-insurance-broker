import { useState, useRef } from "react";
import { Mic, Square, Upload, FileAudio, Loader2, CheckCircle, Globe, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
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

      toast.success("Voice note uploaded. Transcription will be ready shortly.");
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

  const loadNotes = async () => {
    if (!user) return;
    setLoadingNotes(true);
    const { data } = await db.voiceNotes().select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10);
    setNotes((data as VoiceNote[]) ?? []);
    setLoadingNotes(false);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Voice Note Upload</h2>
        <p className="text-muted-foreground">Record in Kreol Morisien, English, or French — auto-transcribed</p>
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
                  {uploading ? "Uploading…" : "Upload & Transcribe"}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 text-sm text-primary-800">
            <strong>Powered by Speech-to-Text AI</strong> — Supports Kreol Morisien (Mauritian Creole), English, and French transcription via Gemini Flash Lite.
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
