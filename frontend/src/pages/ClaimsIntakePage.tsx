import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronRight, Crosshair, FileWarning, MapPin, ShieldCheck, Upload, Database, Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { uploadDocument, validateFile } from "../lib/uploadService";
import type { IncidentPin } from "../types/incidentMap";

const IncidentLocationMap = lazy(async () => {
  const m = await import("../components/IncidentLocationMap");
  return { default: m.IncidentLocationMap };
});

function buildStoredLocation(address: string, pin: IncidentPin | null): string | null {
  const a = address.trim();
  if (!a && !pin) return null;
  if (pin && a) return `${a} — Pin: ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;
  if (pin) return `Pin: ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`;
  return a;
}

const STEPS = ["Incident", "Parties", "Details", "Review"] as const;

export function ClaimsIntakePage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [step, setStep] = useState(0);
  const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [targetClientId, setTargetClientId] = useState("");
  const [form, setForm] = useState({
    policyNumber: "",
    when: "",
    where: "",
    description: "",
    contactPhone: "",
    thirdParties: "",
  });
  const [incidentPin, setIncidentPin] = useState<IncidentPin | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user || demoAuthActive || !session || profile?.role === "client") {
      if (profile?.role === "client") setTargetClientId(user?.id ?? "");
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error } = await db
        .profiles()
        .select("id, full_name")
        .eq("role", "client")
        .order("full_name");
      if (cancelled) return;
      if (!error && data) {
        setClients(data as Array<{ id: string; full_name: string }>);
        if (data[0]) setTargetClientId((data[0] as { id: string }).id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role, session, demoAuthActive]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const cid = profile?.role === "client" ? user?.id : targetClientId;
    if (!cid || !user) {
      toast.error("Select a client.");
      return;
    }
    if (demoAuthActive || !session) {
      toast.success(
        evidenceFiles.length
          ? `Claim intake recorded locally (demo). ${evidenceFiles.length} attachment(s) not uploaded until you use Supabase.`
          : "Claim intake saved — your broker will follow up (demo).",
      );
      setStep(0);
      setForm({ policyNumber: "", when: "", where: "", description: "", contactPhone: "", thirdParties: "" });
      setIncidentPin(null);
      setEvidenceFiles([]);
      return;
    }

    for (const file of evidenceFiles) {
      const bad = validateFile(file);
      if (bad) {
        toast.error(bad);
        return;
      }
    }

    const { data: row, error } = await db
      .claimIntakes()
      .insert({
        client_id: cid,
        created_by: user.id,
        policy_number: form.policyNumber || null,
        incident_at: form.when ? new Date(form.when).toISOString() : null,
        location: buildStoredLocation(form.where, incidentPin),
        description: form.description || null,
        third_parties: form.thirdParties || null,
        status: "submitted",
      })
      .select("id")
      .single();

    if (error || !row) {
      toast.error((error as { message?: string } | null)?.message ?? "Could not create claim intake.");
      return;
    }

    const claimId = (row as { id: string }).id;

    try {
      for (const file of evidenceFiles) {
        const uploadResult = await uploadDocument(file, cid);
        const { error: attErr } = await db.claimIntakeAttachments().insert({
          claim_intake_id: claimId,
          storage_object_path: uploadResult.path,
          file_name: file.name,
          file_size: uploadResult.size,
          mime_type: uploadResult.mimeType,
          uploaded_by: user.id,
        });
        if (attErr) {
          toast.error((attErr as { message?: string }).message ?? "Uploaded intake but failed to register an attachment.");
          return;
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload evidence files.");
      return;
    }

    const policyRef = form.policyNumber;

    toast.success(
      evidenceFiles.length
        ? `Claim intake submitted with ${evidenceFiles.length} file(s).`
        : "Claim intake submitted.",
    );

    await db.portalNotifications().insert({
      user_id: cid,
      kind: "system",
      title: "Claim intake received",
      body: `A claim intake was submitted for policy ref ${policyRef || "(none)"}.`,
    });

    setStep(0);
    setForm({ policyNumber: "", when: "", where: "", description: "", contactPhone: "", thirdParties: "" });
    setIncidentPin(null);
    setEvidenceFiles([]);
  };

  const field =
    "w-full rounded-xl border border-border/90 bg-surface px-4 py-2.5 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">First notice of loss</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Claims intake</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Submits to <code className="text-xs">claim_intakes</code> with optional files in Storage, registered in{" "}
            <code className="text-xs">claim_intake_attachments</code>, when signed in with Supabase. Demo mode keeps everything local.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            !demoAuthActive && session ? "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200" : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" aria-hidden />
          {demoAuthActive || !session ? "Demo / offline" : "Writes to Supabase"}
        </span>
      </div>

      {profile && profile.role !== "client" && session && !demoAuthActive && (
        <label className="block max-w-md">
          <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">Client</span>
          <select className={field} value={targetClientId} onChange={(e) => setTargetClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="dashboard-panel rounded-2xl p-6 sm:p-8">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-xs font-bold ${
                  i === step ? "bg-primary-600 text-white shadow-md" : i < step ? "bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-300" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
              <span className={`text-sm font-medium ${i === step ? "text-surface-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-warning-200/80 bg-warning-50/80 p-4 text-sm text-warning-900 dark:border-warning-700/40 dark:bg-warning-950/30 dark:text-warning-200">
              <FileWarning className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>If anyone is injured, call emergency services first.</p>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">Policy number</span>
              <input className={field} value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} placeholder="e.g. MOT-2024-8841" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">When did it happen?</span>
              <input className={field} type="datetime-local" value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">Where?</span>
              <input className={field} value={form.where} onChange={(e) => setForm({ ...form, where: e.target.value })} placeholder="City, street, landmark" />
            </label>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-surface-foreground">
                  <MapPin className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
                  Pin on map
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-surface-foreground hover:bg-muted/80 dark:border-border"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error("Location is not available in this browser.");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setIncidentPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          toast.success("Pin placed from your location.");
                        },
                        () => toast.error("Could not read your location — try clicking the map instead."),
                        { enableHighAccuracy: true, timeout: 12_000 },
                      );
                    }}
                  >
                    <Crosshair className="h-3.5 w-3.5" aria-hidden />
                    Use my location
                  </button>
                  {incidentPin && (
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 dark:border-border"
                      onClick={() => setIncidentPin(null)}
                    >
                      Clear pin
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the map to drop a pin, drag it to adjust, or use your device location. OpenStreetMap tiles — no API key required.
              </p>
              <Suspense
                fallback={
                  <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
                    Loading map…
                  </div>
                }
              >
                <IncidentLocationMap value={incidentPin} onChange={setIncidentPin} />
              </Suspense>
              {incidentPin && (
                <p className="text-xs font-mono text-muted-foreground">
                  Coordinates: {incidentPin.lat.toFixed(5)}, {incidentPin.lng.toFixed(5)}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">Best contact number</span>
              <input className={field} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+230 …" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">Other parties / witnesses</span>
              <textarea className={`${field} min-h-[100px]`} value={form.thirdParties} onChange={(e) => setForm({ ...form, thirdParties: e.target.value })} placeholder="Names, vehicles, insurers if known" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-surface-foreground">What happened?</span>
              <textarea className={`${field} min-h-[140px]`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the sequence of events clearly." />
            </label>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-surface-foreground">
                  <Paperclip className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
                  Supporting photos / PDF
                </span>
                <span className="text-xs text-muted-foreground">Optional · PDF, JPG, PNG, TIFF · max 25MB each</span>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground hover:bg-muted/50">
                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>Add files</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,application/pdf,image/png,image/jpeg,image/tiff"
                  multiple
                  onChange={(e) => {
                    const list = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = "";
                    if (list.length === 0) return;
                    setEvidenceFiles((prev) => [...prev, ...list]);
                  }}
                />
              </label>
              {evidenceFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {evidenceFiles.map((f, idx) => (
                    <li key={`${f.name}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface px-3 py-2 text-sm">
                      <span className="truncate text-surface-foreground">{f.name}</span>
                      <button
                        type="button"
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-surface-foreground"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-accent-600" aria-hidden />
              <span className="text-surface-foreground">Review and submit.</span>
            </div>
            <ul className="space-y-2 rounded-xl border border-border/80 p-4 text-muted-foreground">
              <li>
                <span className="font-medium text-surface-foreground">Policy:</span> {form.policyNumber || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">When / where:</span> {form.when || "—"} ·{" "}
                {buildStoredLocation(form.where, incidentPin) || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">Contact:</span> {form.contactPhone || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">Narrative:</span> {form.description ? `${form.description.slice(0, 160)}…` : "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">Attachments:</span>{" "}
                {evidenceFiles.length === 0 ? "None" : `${evidenceFiles.length} file(s) — ${evidenceFiles.map((f) => f.name).join(", ")}`}
              </li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          {step > 0 && (
            <button type="button" onClick={back} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted/80">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
              Continue
            </button>
          ) : (
            <button type="button" onClick={() => void submit()} className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700">
              Submit intake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
