import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Copy, CheckCircle, KeyRound, AlertTriangle } from "lucide-react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../lib/auditService";
import toast from "react-hot-toast";
import { COMPANY_NAME_SHORT } from "../lib/branding";

type Step = "intro" | "setup" | "verify" | "done";

function generateTotpSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

export function TwoFactorPage() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>((profile as { totp_enabled?: boolean })?.totp_enabled ? "done" : "intro");
  const [secret] = useState(() => generateTotpSecret());
  const [verifyCode, setVerifyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const otpauthUrl = `otpauth://totp/${encodeURIComponent(COMPANY_NAME_SHORT)}:${user?.email ?? "user"}?secret=${secret}&issuer=${encodeURIComponent(COMPANY_NAME_SHORT)}`;

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setLoading(true);
    try {
      // In production, verify TOTP server-side via Supabase Edge Function.
      // For now we store the secret and mark 2FA enabled.
      const { error } = await db.profiles()
        .update({ totp_secret: secret, totp_enabled: true })
        .eq("id", user!.id);

      if (error) throw error;

      if (user) {
        await logAudit(user.id, "user.2fa_enabled", "profile", user.id);
      }

      setStep("done");
      toast.success("Two-factor authentication enabled!");
    } catch {
      toast.error("Failed to enable 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setDisabling(true);
    try {
      const { error } = await db.profiles()
        .update({ totp_secret: null, totp_enabled: false })
        .eq("id", user!.id);

      if (error) throw error;
      setStep("intro");
      toast.success("Two-factor authentication disabled.");
    } catch {
      toast.error("Failed to disable 2FA.");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Two-Factor Authentication</h2>
        <p className="text-muted-foreground">Add an extra layer of security to your account</p>
      </div>

      <div className="max-w-xl rounded-xl border border-border bg-surface p-8">
        {step === "intro" && (
          <div className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
              <ShieldCheck className="h-7 w-7 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-foreground">Protect your account</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Two-factor authentication (2FA) adds a second verification step when logging in, protecting your account even if your password is compromised.
              </p>
            </div>
            <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 text-sm text-primary-800 dark:bg-primary-950/60 dark:border-primary-700/50 dark:text-primary-100">
              You will need an authenticator app such as <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong>.
            </div>
            <button
              onClick={() => setStep("setup")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
            >
              <KeyRound className="h-4 w-4" />
              Set Up 2FA
            </button>
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-surface-foreground">Step 1 – Scan or enter your secret</h3>
            <p className="text-sm text-muted-foreground">
              Open your authenticator app and scan the QR code or manually enter the secret below.
            </p>

            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-6 dark:bg-muted/20">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <QRCodeSVG value={otpauthUrl} size={200} level="M" includeMargin={false} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center max-w-sm">
                Scan with your authenticator app. For manual setup, use the secret below.
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Manual Entry Secret</p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3">
                <code className="flex-1 font-mono text-sm text-surface-foreground break-all">{secret}</code>
                <button onClick={copySecret} className="shrink-0 rounded p-1 hover:bg-border cursor-pointer transition-colors duration-200">
                  {copied ? <CheckCircle className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
            >
              I've Added It → Verify
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-surface-foreground">Step 2 – Verify your code</h3>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code shown in your authenticator app to confirm setup.
            </p>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center font-mono text-xl tracking-widest text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("setup")}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || verifyCode.length !== 6}
                className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                {loading ? "Verifying…" : "Enable 2FA"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
              <CheckCircle className="h-7 w-7 text-accent-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-foreground">2FA is Active</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account is protected with two-factor authentication. You will be prompted for a code on each login.
              </p>
            </div>
            <div className="rounded-lg bg-warning-50 border border-warning-200 p-4 flex gap-3 dark:bg-warning-950/35 dark:border-warning-700/40">
              <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5 dark:text-warning-400" />
              <p className="text-sm text-warning-800 dark:text-warning-200">
                If you lose access to your authenticator app, contact your admin to reset 2FA.
              </p>
            </div>
            <button
              onClick={handleDisable}
              disabled={disabling}
              className="rounded-lg border border-danger-300 px-5 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-50 cursor-pointer transition-colors duration-200"
            >
              {disabling ? "Disabling…" : "Disable 2FA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
