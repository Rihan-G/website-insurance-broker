import { useState } from "react";
import { ChevronRight, FileWarning, ShieldCheck, Upload } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Incident", "Parties", "Details", "Review"] as const;

export function ClaimsIntakePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    policyNumber: "",
    when: "",
    where: "",
    description: "",
    contactPhone: "",
    thirdParties: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    toast.success("Claim intake saved — your broker will follow up (demo).");
    setStep(0);
    setForm({
      policyNumber: "",
      when: "",
      where: "",
      description: "",
      contactPhone: "",
      thirdParties: "",
    });
  };

  const field =
    "w-full rounded-xl border border-border/90 bg-surface px-4 py-2.5 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">First notice of loss</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Claims intake</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Guided FNOL wizard for clients and staff. Attachments and insurer routing would connect to your claims workflow in production.
        </p>
      </div>

      <div className="dashboard-panel rounded-2xl p-6 sm:p-8">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-full text-xs font-bold ${
                  i === step
                    ? "bg-primary-600 text-white shadow-md"
                    : i < step
                      ? "bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-300"
                      : "bg-muted text-muted-foreground"
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
              <p>If anyone is injured, call emergency services first. You can save a draft here and complete details later.</p>
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
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              <Upload className="mx-auto mb-2 h-8 w-8 opacity-60" aria-hidden />
              Photo / PDF upload would plug into storage here.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-accent-600" aria-hidden />
              <span className="text-surface-foreground">Review and submit — you can edit earlier steps before sending.</span>
            </div>
            <ul className="space-y-2 rounded-xl border border-border/80 p-4 text-muted-foreground">
              <li>
                <span className="font-medium text-surface-foreground">Policy:</span> {form.policyNumber || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">When / where:</span> {form.when || "—"} · {form.where || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">Contact:</span> {form.contactPhone || "—"}
              </li>
              <li>
                <span className="font-medium text-surface-foreground">Narrative:</span> {form.description ? `${form.description.slice(0, 160)}…` : "—"}
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
            <button type="button" onClick={submit} className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700">
              Submit intake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
