import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const trustSignals = [
  "AES-256 Encryption",
  "GDPR & Data Protection Compliant",
  "Multi-Factor Authentication",
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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password, fullName)
      : await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Trust & Authority panel */}
      <div className="hidden w-1/2 bg-primary-900 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="h-10 w-10 text-accent-500" />
          <span className="text-2xl font-bold text-white tracking-tight">SecureBroker</span>
        </div>

        <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
          Trusted Insurance<br />Broker Portal
        </h1>
        <p className="text-lg text-primary-200 max-w-lg leading-relaxed">
          Manage policies, process documents with OCR intelligence, and serve your
          clients — all through one secure, compliance-ready platform.
        </p>

        <div className="mt-10 space-y-3">
          {trustSignals.map((signal) => (
            <div key={signal} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-accent-500 shrink-0" />
              <span className="text-sm text-primary-100 font-medium">{signal}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-8">
          <div>
            <p className="text-3xl font-bold text-white">700+</p>
            <p className="text-sm text-primary-300 mt-1">Active Clients</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">99.9%</p>
            <p className="text-sm text-primary-300 mt-1">Uptime SLA</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">24/7</p>
            <p className="text-sm text-primary-300 mt-1">Support</p>
          </div>
        </div>
      </div>

      {/* Auth form */}
      <div className="flex flex-1 items-center justify-center bg-primary-50 px-6 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-primary-600" />
            <h1 className="text-2xl font-bold text-primary-900">SecureBroker</h1>
          </div>

          <div className="rounded-2xl bg-surface p-8 shadow-sm border border-border">
            <div className="mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-900">
                {isSignUp ? "Create your account" : "Secure Sign In"}
              </h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {isSignUp
                ? "Get started with your insurance broker portal"
                : "Enter your credentials to access the portal"}
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-600 border border-danger-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
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
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In Securely"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="font-semibold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors duration-200"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
