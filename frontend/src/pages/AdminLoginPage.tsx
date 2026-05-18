import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Calendar,
  Sparkles,
  CheckCircle,
  Home,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  Inbox,
  CalendarClock,
  BellRing,
  MessagesSquare,
  ListTodo,
  CreditCard,
  FileWarning,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { ParticleField } from "../components/ParticleField";
import { DEMO_ACCOUNTS } from "../lib/demoAuth";
import { COMPANY_NAME_SHORT } from "../lib/branding";
import { formatHolidayDate, upcomingMauritiusHolidays, type MauritiusHoliday } from "../lib/mauritiusHolidays";

const adminDemo = DEMO_ACCOUNTS[0];

const trustSignals = [
  "Role-based access for administrators",
  "256-bit TLS · audit-ready session trail",
  "Mauritius holidays plus shared office calendar (TimeTree-style desk)",
  "Multi-currency display (MUR, USD, GBP, EUR)",
];

const opsStats = [
  { value: "Shared", label: "Office calendar" },
  { value: "Care+", label: "Same hub as clients" },
  { value: "24/7", label: "Secure sessions" },
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

  /** Mobile layout is always on the dark hero; at lg+ the form sits on surface (light in light theme). */
  const chromeOnDark = !isLg || resolved === "dark";

  const upcoming = useMemo(() => upcomingMauritiusHolidays(new Date(), 5), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email, password);
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
        <div className="scan-line opacity-60" />
        <ParticleField count={18} variant="rise" className="opacity-50" />
        <div className="absolute inset-0 dot-grid opacity-25" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-accent-400" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">{COMPANY_NAME_SHORT}</p>
              <p className="text-xs font-medium text-primary-300">Administrator & operations</p>
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-accent-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            FSC Licensed · Mauritius
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-accent-200">
            <Sparkles className="h-3.5 w-3.5" />
            Dark mode, currencies & calendars — same as the main portal
          </div>

          <h1 className="mb-3 text-3xl font-bold leading-tight text-white xl:text-4xl">
            Secure staff
            <br />
            <span className="text-gradient-warm">control centre</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-primary-200">
            After sign-in you get the full dashboard: Mauritius holiday calendar, expiry monitor, analytics, audit log, and
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

          <div className="mt-8 grid grid-cols-3 gap-4">
            {opsStats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary-300">{s.label}</p>
              </div>
            ))}
          </div>

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
              Open calendar, holidays & office schedule
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

          <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-primary-500">After sign-in — same Care hub as clients</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { to: "/dashboard/inbox", label: "Inbox", icon: Inbox },
              { to: "/dashboard/renewals", label: "Renewals", icon: CalendarClock },
              { to: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
              { to: "/dashboard/notifications", label: "Notifications", icon: BellRing },
              { to: "/dashboard/secure-messages", label: "Secure msgs", icon: MessagesSquare },
              { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
              { to: "/dashboard/claims", label: "Claims", icon: FileWarning },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-primary-100 backdrop-blur-sm transition hover:bg-white/15"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-accent-300" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 lg:bg-gradient-to-br lg:from-primary-50 lg:via-white lg:to-accent-50/35 lg:px-10 dark:lg:from-[#0a1018] dark:lg:via-background dark:lg:to-primary-950/40">
        <div className="absolute right-5 top-5 z-10 flex items-center gap-2 sm:right-8 sm:top-8">
          <CurrencySwitcher variant={chromeOnDark ? "dark" : "light"} />
          <ThemeToggle variant={chromeOnDark ? "onDark" : "default"} />
        </div>

        <div className="pointer-events-none absolute inset-0 hidden opacity-60 lg:block dot-grid-light" />
        <div className="pointer-events-none absolute right-0 top-0 hidden h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-100/40 blur-3xl lg:block dark:bg-primary-900/20" />
        <div className="pointer-events-none absolute bottom-0 left-0 hidden h-80 w-80 translate-y-1/2 -translate-x-1/2 rounded-full bg-accent-100/30 blur-3xl lg:block dark:bg-accent-900/15" />

        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-gray-950" />
        <div className="relative z-[1] w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 inline-flex rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:hidden">
              <ShieldCheck className="h-12 w-12 text-accent-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white lg:text-surface-foreground dark:lg:text-white">
              Administrator access
            </h1>
            <p className="mt-2 text-sm text-primary-200 lg:text-muted-foreground dark:lg:text-primary-200">
              {COMPANY_NAME_SHORT} — staff and operations
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-2xl ring-1 ring-white/5 glass-dark lg:border-border lg:bg-white/90 lg:shadow-xl lg:ring-primary-900/[0.04] lg:backdrop-blur-xl dark:lg:border-white/10 dark:lg:bg-surface/95 dark:lg:ring-white/[0.06]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/70 to-accent-500/0 dark:via-primary-400/80 lg:opacity-100"
              aria-hidden
            />
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-white/10 bg-white/10 p-2 lg:border-border lg:bg-muted/50">
                <Lock className="h-5 w-5 text-accent-400 lg:text-primary-600 dark:lg:text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white lg:text-surface-foreground">Sign in</h2>
                <p className="text-xs text-primary-300 lg:text-muted-foreground">Use your administrator credentials</p>
              </div>
            </div>

            {/* Mobile mini calendar strip */}
            <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3 lg:hidden">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary-400">Next holidays</p>
              <p className="mt-1 line-clamp-2 text-xs text-primary-200">
                {upcoming.map((h) => `${formatHolidayDate(h.date)}: ${h.name}`).join(" · ")}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200 lg:border-danger-500/25 lg:bg-danger-50/95 lg:text-danger-700 dark:lg:bg-danger-950/35 dark:lg:text-danger-400"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
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
                className="btn-glow w-full rounded-xl bg-gradient-to-r from-primary-600 via-primary-600 to-primary-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:from-primary-700 hover:via-primary-600 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/35 disabled:opacity-50 dark:shadow-primary-900/30"
              >
                {loading ? "Signing in…" : "Sign in as administrator"}
              </button>
            </form>

            {demoAuthAvailable && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-left text-xs text-primary-200 lg:border-border/80 lg:bg-gradient-to-b lg:from-muted/60 lg:to-muted/30 lg:text-muted-foreground dark:lg:border-white/10 dark:lg:from-muted/25 dark:lg:to-transparent">
                <p className="font-semibold text-white lg:text-surface-foreground">Local demo accounts</p>
                <ul className="mt-2 space-y-2 font-mono text-[11px] leading-relaxed">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <li key={acc.profile.id}>
                      <span className="text-white lg:text-surface-foreground">{acc.profile.role}:</span> {acc.email}{" "}
                      <span className="text-primary-300 lg:text-muted-foreground">/ {acc.password}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-primary-400 lg:text-muted-foreground">
                  This page accepts <span className="font-semibold text-accent-300 lg:text-primary-600">administrator</span>{" "}
                  sign-in only; use the standard portal for broker or client roles.
                </p>
                <button
                  type="button"
                  onClick={fillAdminDemo}
                  className="mt-3 text-sm font-medium text-accent-400 underline-offset-2 hover:underline lg:text-primary-600 dark:lg:text-primary-400"
                >
                  Fill administrator demo
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-primary-300 lg:text-muted-foreground">
              <Link to="/login" className="font-medium text-white underline-offset-2 hover:underline lg:text-primary-600 dark:lg:text-white">
                Standard broker / client sign-in
              </Link>
            </p>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-primary-400 lg:text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-accent-500 lg:text-accent-600" aria-hidden />
            <span>Protected by 256-bit SSL · FSC Mauritius licensed · operations staff only</span>
          </p>
        </div>
      </div>
    </div>
  );
}
