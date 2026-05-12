import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEMO_ACCOUNTS } from "../lib/demoAuth";
import { COMPANY_NAME_SHORT } from "../lib/branding";
import { ParticleField } from "../components/ParticleField";
import { ThemeToggle } from "../components/ThemeToggle";

const trustSignals = [
  "AES-256 Encryption at rest and in transit",
  "GDPR & Data Protection Act Compliant",
  "Multi-Factor Authentication (2FA)",
  "Role-Based Access Control",
];


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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = isSignUp ? await signUp(email, password, fullName) : await signIn(email, password);
    if (result.error) { setError(result.error.message); setLoading(false); }
    else navigate("/dashboard");
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

        {/* Scan line */}
        <div className="scan-line" />

        {/* Rising particles */}
        <ParticleField count={22} variant="rise" />

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

          <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
            Your Trusted<br />
            <span className="text-gradient-warm">Insurance Portal</span>
          </h1>
          <p className="text-base text-primary-200 max-w-sm leading-relaxed">
            Manage policies, upload documents with OCR intelligence, and serve your
            clients — all in one compliance-ready platform.
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

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "700+", label: "Active Clients" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "24/7", label: "Support" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl glass p-4 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-primary-300 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — Auth form ── */}
      <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-950 dark:via-background dark:to-gray-950 px-6 lg:px-16 overflow-hidden">
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
            <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-50">{COMPANY_NAME_SHORT}</h1>
            <p className="text-sm text-muted-foreground mt-1">Insurance Portal</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 dark:bg-primary-900/40 p-2">
                <Lock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-900 dark:text-primary-50">
                  {isSignUp ? "Create Account" : "Secure Sign In"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isSignUp ? "Get started with your portal" : "Access your insurance portal"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-danger-50 dark:bg-danger-50/25 border border-danger-500/20 p-3 text-sm text-danger-600 dark:text-danger-500 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                {error}
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
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-surface/80 px-4 py-3 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
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
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-border bg-white/80 dark:bg-surface/80 px-4 py-3 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-white/80 dark:bg-surface/80 px-4 py-3 pr-11 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-surface-foreground cursor-pointer transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-semibold text-white hover:from-primary-700 hover:to-primary-600 focus:ring-2 focus:ring-primary-500/30 focus:outline-none disabled:opacity-50 cursor-pointer shadow-md shadow-primary-500/25 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : isSignUp ? "Create Account" : "Sign In Securely"}
              </button>
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

            {!isSignUp && (
              <p className="mt-5 text-center text-sm text-muted-foreground">
                <Link
                  to="/admin/login"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
                >
                  Administrator sign-in
                </Link>
              </p>
            )}

            {demoAuthAvailable && !isSignUp && (
              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-left text-xs text-muted-foreground">
                <p className="font-semibold text-surface-foreground">Local demo accounts</p>
                <ul className="mt-2 space-y-2 font-mono text-[11px] leading-relaxed">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <li key={acc.profile.id}>
                      <span className="text-surface-foreground">{acc.profile.role}:</span> {acc.email}{" "}
                      <span className="text-muted-foreground">/ {acc.password}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            🔒 Protected by 256-bit SSL · FSC Mauritius Licensed
          </p>
        </div>
      </div>
    </div>
  );
}
