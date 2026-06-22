import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { isOnboardingDone, markOnboardingDone } from "../lib/localPrefs";
import { useFocusTrap } from "../hooks/useFocusTrap";

const steps = [
  {
    title: "Welcome to your portal",
    body: "Track policies, documents, and renewals from one dashboard.",
    cta: "Next",
  },
  {
    title: "Upload documents securely",
    body: "Use Upload to send policies, IDs, and claim evidence — no email attachments needed.",
    cta: "Next",
    link: "/dashboard/upload",
  },
  {
    title: "Get a quote anytime",
    body: "Create Quote saves estimates. Brokers follow up with firm terms.",
    cta: "Next",
    link: "/dashboard/quotes",
  },
  {
    title: "You're all set",
    body: "Explore the sidebar or press ⌘K / Ctrl+K to jump to any page quickly.",
    cta: "Done",
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShow(!isOnboardingDone());
  }, []);

  const dismiss = () => {
    markOnboardingDone();
    setShow(false);
  };

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  useFocusTrap(dialogRef, show);

  if (!show) return null;

  const current = steps[step] ?? steps[0]!;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-label="Portal onboarding">
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div ref={dialogRef} className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted"
          aria-label="Skip tour"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="mt-2 text-xl font-bold text-surface-foreground">{current.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {current.link && (
            <Link
              to={current.link}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-surface-foreground hover:bg-muted"
            >
              Open page
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                markOnboardingDone();
                setShow(false);
              } else {
                setStep((s) => s + 1);
              }
            }}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {current.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
