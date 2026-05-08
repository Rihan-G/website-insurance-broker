import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { DEMO_ACCOUNTS } from "../lib/demoAuth";

const adminDemo = DEMO_ACCOUNTS[0];

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, demoAuthAvailable } = useAuth();
  const navigate = useNavigate();

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-gray-950 px-6 py-12">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle variant="onDark" />
      </div>

      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <ShieldCheck className="h-12 w-12 text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administrator access</h1>
          <p className="mt-2 text-sm text-primary-200">SecureBroker — staff and operations</p>
        </div>

        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-white/10 p-2">
              <Lock className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sign in</h2>
              <p className="text-xs text-primary-300">Use your administrator credentials</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-100">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-primary-400/70 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary-100">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 pr-11 text-sm text-white placeholder:text-primary-400/70 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-900/40 transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in as administrator"}
            </button>
          </form>

          {demoAuthAvailable && (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-primary-200">
              <p className="font-semibold text-white">Development demo administrator</p>
              <p className="mt-1 break-all font-mono text-primary-300">
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

          <p className="mt-6 text-center text-sm text-primary-300">
            <Link to="/login" className="font-medium text-white underline-offset-2 hover:underline">
              Standard broker / client sign-in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-primary-400">
          Unauthorized access is prohibited and may be prosecuted.
        </p>
      </div>
    </div>
  );
}
