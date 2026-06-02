import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNTS, getDemoCredentialsByRole } from "../lib/demoAuth";
import { COMPANY_NAME_SHORT } from "../lib/branding";
import { getPortalFlavor, staffPortalBaseUrl } from "../lib/portalFlavor";
import { ThemeToggle } from "../components/ThemeToggle";

const trustSignals = [
  "AES-256 Encryption at rest and in transit",
  "GDPR & Data Protection Act Compliant",
  "Multi-Factor Authentication (2FA)",
  "Role-Based Access Control",
];

const LAST_LOGIN_EMAIL_KEY = "sb_last_login_email";

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, demoAuthAvailable } = useAuth();
  const navigate = useNavigate();
  const staffBase = staffPortalBaseUrl();
  const adminHref = getPortalFlavor() === "client" && staffBase ? `${staffBase}/admin` : "/admin";

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(LAST_LOGIN_EMAIL_KEY);
      if (remembered) setEmail(remembered);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const normalizedEmail = email.trim();
    const result = isSignUp ? await signUp(normalizedEmail, password, fullName.trim()) : await signIn(normalizedEmail, password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem(LAST_LOGIN_EMAIL_KEY, normalizedEmail);
    } catch {
      /* ignore */
    }
    navigate("/dashboard");
  };

  const signInDemoRole = async (role: "client" | "broker") => {
    const acc = getDemoCredentialsByRole(role);
    if (!acc) return;
    setError("");
    setLoading(true);
    const result = await signIn(acc.email, acc.password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — Aurora animated Trust & Authority ── */}
      <div className="hidden w-1/2 relative overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16">
        {/* Animated mesh base */}
        <div className="absolute inset-0 animated-mesh" />

        {/* VISIBLE Aurora orbs */}
        <div className="aurora-bg">
          <div className="aurora-orb-1 aurora-login-1" />
          <div className="aurora-orb-2 aurora-login-2" />
          <div className="aurora-orb-3 aurora-login-3" />
          <div className="aurora-orb-4 aurora-login-4" />
        </div>

        {/* Decorative motion intentionally reduced for readability */}

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-20" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="rounded-xl bg-white/10 border border-white/20 p-2.5 backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-accent-400" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">{COMPANY_NAME_SHORT}</span>
              <p className="text-xs text-primary-300 font-medium">Insurance Portal</p>
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-semibold text-accent-300">
            <Sparkles className="h-3.5 w-3.5" />
            FSC Licensed · Mauritius
          </div>

          <h1 className="ui-title mb-4 text-4xl font-bold text-white">
            Your Trusted<br />
            <span className="text-gradient-warm">Insurance Portal</span>
          </h1>
          <p className="ui-body max-w-sm text-primary-200">
            Sign in to your secure area for renewals, messages, and uploads—backed by licensed advisors when you need a person on the line.
          </p>

          <div className="mt-8 space-y-3">
            {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3">
                <div className="rounded-full bg-accent-500/20 border border-accent-500/30 p-1 shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-accent-400" />
                </div>
                <span className="text-sm text-primary-100 font-medium">{signal}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "15+", label: "Years of local advisory experience" },
              { value: "12+", label: "Insurer partnerships" },
              { value: "1:1", label: "Human support when you need it" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl glass p-4 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="ui-caption mt-1 font-medium text-primary-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — Auth form ── */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-primary-50 via-white to-accent-50/35 dark:from-[#0a1018] dark:via-background dark:to-primary-950/40 px-6 py-10 lg:px-16">
        <div className="absolute top-5 right-5 z-20 lg:top-8 lg:right-8">
          <ThemeToggle />
        </div>
        {/* Subtle background dots */}
        <div className="absolute inset-0 dot-grid-light opacity-60" />

        {/* Soft background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent-100/30 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="inline-flex rounded-2xl bg-primary-100 dark:bg-primary-900/35 p-4 mb-4">
              <ShieldCheck className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="ui-title text-2xl font-bold text-primary-900 dark:text-primary-50">{COMPANY_NAME_SHORT}</h1>
            <p className="ui-caption mt-1 text-muted-foreground">Insurance Portal</p>
          </div>

          {!isSignUp && demoAuthAvailable && (
            <div
              className="mb-4 rounded-2xl border-2 border-primary-500/40 bg-white/95 p-4 shadow-lg ring-1 ring-primary-600/10 backdrop-blur-sm dark:border-primary-500/35 dark:bg-surface/95 dark:ring-primary-400/15"
              role="region"
              aria-label="Demo sign-in"
            >
              <p className="text-center text-xs font-bold uppercase tracking-wider text-primary-800 dark:text-primary-200">
                Try the portal (demo)
              </p>
              <p className="mt-1 text-center text-[11px] leading-snug text-muted-foreground">
                One tap for client or broker — no Supabase account required in this mode. Administrator demo uses the separate staff sign-in below.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void signInDemoRole("client")}
                  className="rounded-xl border border-emerald-300/90 bg-emerald-100/90 px-3 py-3 text-center text-sm font-bold text-emerald-950 shadow-sm transition hover:bg-emerald-200/90 disabled:opacity-50 dark:border-emerald-600/50 dark:bg-emerald-950/50 dark:text-emerald-50 dark:hover:bg-emerald-900/60"
                >
                  Client demo
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void signInDemoRole("broker")}
                  className="rounded-xl border border-primary-300/90 bg-primary-100/90 px-3 py-3 text-center text-sm font-bold text-primary-950 shadow-sm transition hover:bg-primary-200/90 disabled:opacity-50 dark:border-primary-600/50 dark:bg-primary-950/50 dark:text-primary-50 dark:hover:bg-primary-900/60"
                >
                  Broker demo
                </button>
              </div>
            </div>
          )}

          {!isSignUp && !demoAuthAvailable && import.meta.env.PROD && (
            <p className="mb-4 rounded-xl border border-amber-300/80 bg-amber-50/95 px-4 py-3 text-center text-xs leading-snug text-amber-950 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
              Demo quick sign-in is off for this build. Set{" "}
              <span className="font-mono text-[11px]">VITE_ALLOW_DEMO_LOGIN=true</span> when building to enable Client / Broker demo buttons.
            </p>
          )}

          {/* Card */}
          <div className="glass-card relative overflow-x-hidden overflow-y-visible rounded-2xl p-8 ring-1 ring-primary-900/[0.04] dark:ring-white/[0.06]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/70 to-accent-500/0 dark:via-primary-400/80"
              aria-hidden
            />
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 p-2.5 shadow-inner ring-1 ring-primary-200/60 dark:from-primary-900/50 dark:to-primary-950/30 dark:ring-primary-700/40">
                <Lock className="h-5 w-5 text-primary-600 dark:text-primary-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-primary-900 dark:text-primary-50">
                  {isSignUp ? "Create Account" : "Secure Sign In"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isSignUp ? "Get started with your portal" : "Access your insurance portal"}
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger-500/25 bg-danger-50/95 p-3.5 text-sm text-danger-700 shadow-sm dark:bg-danger-950/35 dark:text-danger-400"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600 dark:text-danger-400" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-surface-foreground">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    placeholder="Jean Dupont"
                    className="w-full rounded-xl border border-border/90 bg-white/90 px-4 py-3 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none dark:border-border dark:bg-surface/90 dark:shadow-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-surface-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border/90 bg-white/90 px-4 py-3 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none dark:border-border dark:bg-surface/90 dark:shadow-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-surface-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border/90 bg-white/90 px-4 py-3 pr-11 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none dark:border-border dark:bg-surface/90 dark:shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-primary-50 hover:text-surface-foreground dark:hover:bg-muted cursor-pointer transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-600 via-primary-600 to-primary-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 hover:from-primary-700 hover:via-primary-600 hover:to-primary-600 focus:ring-2 focus:ring-primary-500/35 focus:outline-none disabled:opacity-50 cursor-pointer transition-[box-shadow,filter] duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : isSignUp ? "Create Account" : "Sign In Securely"}
              </button>
              {loading && (
                <p className="text-center text-xs text-muted-foreground" aria-live="polite">
                  Validating credentials and preparing your dashboard...
                </p>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer transition-colors duration-200 underline-offset-2 hover:underline"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>

            {!isSignUp && import.meta.env.VITE_SHOW_STAFF_LOGIN_LINK !== "false" && (
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {adminHref.startsWith("http") ? (
                  <a
                    href={adminHref}
                    className="font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
                    rel="noopener noreferrer"
                  >
                    Administrator sign-in
                  </a>
                ) : (
                  <Link
                    to={adminHref}
                    className="font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
                  >
                    Administrator sign-in
                  </Link>
                )}
              </p>
            )}

            {demoAuthAvailable && !isSignUp && (
              <details className="mt-5 rounded-xl border border-border/80 bg-gradient-to-b from-muted/60 to-muted/30 p-4 text-left text-xs text-muted-foreground shadow-inner dark:from-muted/25 dark:to-transparent">
                <summary className="cursor-pointer font-semibold text-surface-foreground">All demo credentials (copy/paste)</summary>
                <ul className="mt-2 space-y-2 font-mono text-[11px] leading-relaxed">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <li key={acc.profile.id}>
                      <span className="text-surface-foreground">{acc.profile.role}:</span> {acc.email}{" "}
                      <span className="text-muted-foreground">/ {acc.password}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-accent-600 dark:text-accent-500" aria-hidden />
            <span>Protected by 256-bit SSL · FSC Mauritius Licensed</span>
          </p>
        </div>
      </div>
    </div>
  );
}
