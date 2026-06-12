import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Calendar, Sparkles, CheckCircle, Home, ArrowRight, BarChart3 } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { DEMO_ACCOUNTS } from "../lib/demoAuth";
import { COMPANY_NAME_SHORT } from "../lib/branding";
import { formatHolidayDate, upcomingMauritiusHolidays, type MauritiusHoliday } from "../lib/mauritiusHolidays";

const adminDemo = DEMO_ACCOUNTS[0];
const LAST_ADMIN_EMAIL_KEY = "sb_last_admin_email";

const trustSignals = [
  "Role-based access for administrators",
  "256-bit TLS · audit-ready session trail",
  "Team calendar for tasks and renewals, with Mauritius public holidays as reference",
  "Multi-currency display (MUR, USD, GBP, EUR)",
];

function holidayBadgeClass(h: MauritiusHoliday): string {
  if (h.type === "public") return "border-primary-300/50 bg-primary-500/15 text-primary-100";
  if (h.type === "optional") return "border-amber-400/40 bg-amber-500/15 text-amber-100";
  return "border-purple-400/40 bg-purple-500/15 text-purple-100";
}

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, demoAuthAvailable } = useAuth();
  const { resolved } = useTheme();
  const navigate = useNavigate();
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(LAST_ADMIN_EMAIL_KEY);
      if (remembered) setEmail(remembered);
    } catch {
      /* ignore */
    }
  }, []);

  /** Mobile layout is always on the dark hero; at lg+ the form sits on surface (light in light theme). */
  const chromeOnDark = !isLg || resolved === "dark";

  const upcoming = useMemo(() => upcomingMauritiusHolidays(new Date(), 5), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim();
    const result = await signIn(normalizedEmail, password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    if (!result.profile || result.profile.role !== "admin") {
      await signOut();
      setError("This portal is for administrator accounts only. Use the standard sign-in for broker or client access.");
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem(LAST_ADMIN_EMAIL_KEY, normalizedEmail);
    } catch {
      /* ignore */
    }
    navigate("/dashboard");
  };

  const fillAdminDemo = () => {
    setEmail(adminDemo.email);
    setPassword(adminDemo.password);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Left — staff spotlight (matches client login richness; respects light/dark) */}
      <div className="relative hidden min-h-[320px] flex-1 overflow-hidden lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-12 xl:px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-gray-950 dark:animated-mesh" />
        <div className="aurora-bg opacity-80 dark:opacity-100">
          <div className="aurora-orb-1 aurora-login-1" />
          <div className="aurora-orb-2 aurora-login-2" />
          <div className="aurora-orb-3 aurora-login-3" />
        </div>
        <div className="scan-line opacity-35" />
        <div className="absolute inset-0 dot-grid opacity-25" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm">
              <BrandLogo className="h-8 w-8" imageClassName="h-8 w-8 w-auto object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">{COMPANY_NAME_SHORT}</p>
              <p className="text-xs font-medium text-primary-300">Administrator & operations</p>
            </div>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-accent-200">
            <Sparkles className="h-3.5 w-3.5" />
            Dark mode, currencies, and calendars, same as the main portal
          </div>

          <h1 className="ui-title mb-3 text-3xl font-bold text-white xl:text-4xl">
            Secure staff
            <br />
            <span className="text-accent-200">control centre</span>
          </h1>
          <p className="ui-body max-w-md text-primary-200">
            After sign-in you get the full dashboard: team calendar (your schedule plus Mauritius holiday reference), expiry monitor, analytics, audit log, and
            the same theme toggle and currency switcher you use here.
          </p>

          <ul className="mt-8 space-y-2.5">
            {trustSignals.map((signal) => (
              <li key={signal} className="flex items-start gap-3 text-sm text-primary-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent-500/40 bg-accent-500/15">
                  <CheckCircle className="h-3 w-3 text-accent-300" aria-hidden />
                </span>
                {signal}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-white/15 bg-black/25 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-300">
              <Calendar className="h-4 w-4 text-accent-400" aria-hidden />
              Upcoming Mauritius holidays
            </div>
            <ul className="mt-4 space-y-3">
              {upcoming.map((h) => (
                <li key={h.date + h.name} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{h.name}</p>
                    <p className="text-xs text-primary-300">{formatHolidayDate(h.date)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${holidayBadgeClass(h)}`}>
                    {h.type === "public" ? "Public" : "Optional"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard/calendar"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-300 hover:text-white"
            >
              Open calendar in dashboard
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <p className="mt-2 text-[11px] text-primary-400">You will be asked to sign in first if your session has expired.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Home className="h-4 w-4" aria-hidden />
              Marketing site
            </Link>
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              Analytics (after sign-in)
            </Link>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-10">
        <div className="absolute right-5 top-5 z-10 flex items-center gap-2 sm:right-8 sm:top-8">
          <CurrencySwitcher variant={chromeOnDark ? "dark" : "light"} />
          <ThemeToggle variant={chromeOnDark ? "onDark" : "default"} />
        </div>

        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-gray-950" />
        <div className="relative z-[1] w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 inline-flex rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:hidden">
              <BrandLogo className="h-12 w-12" imageClassName="h-12 w-12 w-auto object-contain" />
            </div>
            <h1 className="ui-title text-2xl font-bold tracking-tight text-white lg:text-surface-foreground dark:lg:text-white">
              Administrator access
            </h1>
            <p className="ui-caption mt-2 text-primary-200 lg:text-muted-foreground dark:lg:text-primary-200">
              {COMPANY_NAME_SHORT}, staff and operations
            </p>
          </div>

          <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl lg:border-border lg:bg-surface lg:shadow-lg dark:lg:border-white/10 dark:lg:bg-primary-950/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-white/10 bg-white/10 p-2 lg:border-border lg:bg-muted/50">
                <Lock className="h-5 w-5 text-accent-400 lg:text-primary-600 dark:lg:text-accent-400" />
              </div>
              <div>
                <h2 className="ui-title text-lg font-bold text-white lg:text-surface-foreground">Sign in</h2>
                <p className="ui-caption text-primary-300 lg:text-muted-foreground">Use your administrator credentials</p>
              </div>
            </div>

            {/* Mobile mini calendar strip */}
            <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3 lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary-400">Upcoming public holidays (ref.)</p>
              <p className="mt-1 line-clamp-2 text-xs text-primary-200">
                {upcoming.map((h) => `${formatHolidayDate(h.date)}: ${h.name}`).join(" · ")}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-100 lg:text-surface-foreground">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-primary-400/70 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/25 lg:border-border lg:bg-surface lg:text-surface-foreground lg:placeholder:text-muted-foreground dark:lg:border-white/15 dark:lg:bg-black/30 dark:lg:text-white"
                  placeholder="admin@company.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary-100 lg:text-surface-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 pr-11 text-sm text-white placeholder:text-primary-400/70 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/25 lg:border-border lg:bg-surface lg:text-surface-foreground lg:placeholder:text-muted-foreground dark:lg:border-white/15 dark:lg:bg-black/30 dark:lg:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-white lg:text-muted-foreground lg:hover:text-surface-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-900/40 transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in as administrator"}
              </button>
              {loading && (
                <p className="text-center text-xs text-primary-300 lg:text-muted-foreground" aria-live="polite">
                  Verifying administrator role and preparing secure workspace...
                </p>
              )}
            </form>

            {demoAuthAvailable && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-primary-200 lg:border-border lg:bg-muted/30 lg:text-muted-foreground dark:lg:border-white/10 dark:lg:bg-black/20 dark:lg:text-primary-200">
                <p className="font-semibold text-white lg:text-surface-foreground">Development demo administrator</p>
                <p className="mt-1 break-all font-mono text-primary-300 lg:text-muted-foreground dark:lg:text-primary-300">
                  {adminDemo.email} / {adminDemo.password}
                </p>
                <button
                  type="button"
                  onClick={fillAdminDemo}
                  className="mt-3 text-sm font-medium text-accent-400 underline-offset-2 hover:underline"
                >
                  Fill demo credentials
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-primary-300 lg:text-muted-foreground">
              <Link to="/login" className="font-medium text-white underline-offset-2 hover:underline lg:text-primary-600 dark:lg:text-white">
                Standard broker / client sign-in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-primary-400 lg:text-muted-foreground">Unauthorized access is prohibited and may be prosecuted.</p>
        </div>
      </div>
    </div>
  );
}
