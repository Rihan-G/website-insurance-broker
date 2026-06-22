import { useState } from "react";
import { Link, redirect, useNavigation, useActionData } from "react-router";
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { createSupabaseServerClient, getSession } from "~/lib/supabase.server";
import { COMPANY_NAME_SHORT } from "~/lib/branding";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  const { session } = await getSession(request);
  if (session) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const headers = new Headers();
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  if (!supabaseUrl || supabaseUrl.includes("your-supabase")) {
    return { error: "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to app/.dev.vars to enable authentication." };
  }
  const supabase = createSupabaseServerClient(request, headers);
  const form = await request.formData();

  const intent = String(form.get("intent") ?? "signin");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const fullName = String(form.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (intent === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return redirect("/dashboard", { headers });
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return redirect("/dashboard", { headers });
}

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Sign In — ${COMPANY_NAME_SHORT} Portal` },
    { name: "description", content: "Sign in to the Sindicom Brokers client and staff portal." },
  ];
}

const trustSignals = [
  "AES-256 Encryption at rest and in transit",
  "GDPR & Data Protection Act Compliant",
  "Multi-Factor Authentication (2FA)",
  "Role-Based Access Control",
];

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loading = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 relative overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16 animated-mesh">
        <div className="aurora-bg">
          <div className="aurora-orb-1 aurora-login-1" />
          <div className="aurora-orb-2 aurora-login-2" />
          <div className="aurora-orb-3 aurora-login-3" />
          <div className="aurora-orb-4 aurora-login-4" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="rounded-xl bg-white/10 border border-white/20 p-2.5">
              <Lock className="h-8 w-8 text-white" aria-hidden />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{COMPANY_NAME_SHORT}</span>
              <p className="text-xs text-blue-300">Insurance Portal</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Trusted<br />
            <span className="text-green-300">Insurance Portal</span>
          </h1>
          <p className="max-w-sm text-blue-200">
            Sign in to your secure area for renewals, messages, and uploads.
          </p>
          <div className="mt-8 space-y-3">
            {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 border border-green-500/30 p-1 shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                </div>
                <span className="text-sm text-blue-100 font-medium">{signal}</span>
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
                <p className="mt-1 text-xs font-medium text-blue-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-green-50/30 px-6 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 lg:px-16">
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Lock className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{COMPANY_NAME_SHORT}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Insurance Portal</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-900 ring-1 ring-blue-900/[0.04]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-900/40 p-2.5">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isSignUp ? "Create Account" : "Secure Sign In"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isSignUp ? "Get started with your portal" : "Access your insurance portal"}
                </p>
              </div>
            </div>

            {actionData?.error && (
              <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{actionData.error}</span>
              </div>
            )}

            <form method="post" className="space-y-4">
              <input type="hidden" name="intent" value={isSignUp ? "signup" : "signin"} />

              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                  <input id="fullName" name="fullName" type="text" required={isSignUp} placeholder="Jean Dupont" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500" />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                <input id="email" name="email" type="email" required autoComplete="username" autoFocus disabled={loading} placeholder="you@company.com" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete={isSignUp ? "new-password" : "current-password"} disabled={loading} placeholder="••••••••" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/35 focus:outline-none disabled:opacity-50 transition-colors">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </span>
                ) : isSignUp ? "Create Account" : "Sign In Securely"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 cursor-pointer">
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>

            <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/admin" className="font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2">
                Administrator sign-in
              </Link>
            </p>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
            <Lock className="h-3.5 w-3.5 text-green-600" />
            Protected by 256-bit SSL · FSC Mauritius Licensed
          </p>
        </div>
      </div>
    </div>
  );
}
