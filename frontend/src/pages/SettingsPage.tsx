import { useEffect, useState } from "react";
import { Save, Bell, Lock, Globe, Palette, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme, type ThemePreference } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { COMPANY_NAME } from "../lib/branding";
import {
  aiEdgeLikelyAvailable,
  fetchAiKeyStatus,
  pingAiProvider,
  type AiStatusResponse,
} from "../lib/aiEdge";

export function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const { profile, loading: authLoading } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isBroker = profile?.role === "broker";
  const canViewStaffAi = isAdmin || isBroker;

  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);
  const [aiStatusLoading, setAiStatusLoading] = useState(false);
  const [aiStatusError, setAiStatusError] = useState<string | null>(null);
  const [pingingBroker, setPingingBroker] = useState(false);
  const [pingingClient, setPingingClient] = useState(false);

  useEffect(() => {
    if (!canViewStaffAi || authLoading) return;
    let cancelled = false;
    setAiStatusLoading(true);
    setAiStatusError(null);
    void fetchAiKeyStatus().then(({ data, error }) => {
      if (cancelled) return;
      setAiStatusLoading(false);
      if (error) {
        setAiStatus(null);
        setAiStatusError(error.message);
        return;
      }
      setAiStatus(data);
    });
    return () => {
      cancelled = true;
    };
  }, [canViewStaffAi, authLoading]);

  const refreshAiStatus = () => {
    if (!canViewStaffAi) return;
    setAiStatusLoading(true);
    setAiStatusError(null);
    void fetchAiKeyStatus().then(({ data, error }) => {
      setAiStatusLoading(false);
      if (error) {
        setAiStatus(null);
        setAiStatusError(error.message);
        toast.error("Could not load AI key status.");
        return;
      }
      setAiStatus(data);
      toast.success("AI status refreshed.");
    });
  };

  const runBrokerPing = async () => {
    setPingingBroker(true);
    const { data, error } = await pingAiProvider("broker");
    setPingingBroker(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.ok) toast.success("Broker AI endpoint responded successfully.");
    else toast.error(data?.message ?? `Broker ping failed (${data?.upstreamStatus ?? "unknown"})`);
  };

  const runClientPing = async () => {
    setPingingClient(true);
    const { data, error } = await pingAiProvider("client");
    setPingingClient(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.ok) toast.success("Client AI endpoint responded successfully.");
    else toast.error(data?.message ?? `Client ping failed (${data?.upstreamStatus ?? "unknown"})`);
  };

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    policyExpiry: true,
    paymentReminder: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and portal preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* General */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-primary-50 p-1.5">
                <Globe className="h-5 w-5 text-primary-600" />
              </div>
              General
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-foreground">Company Name</label>
                <input
                  type="text"
                  defaultValue={COMPANY_NAME}
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-foreground">Business Registration Number</label>
                <input
                  type="text"
                  defaultValue="C12345678"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-surface-foreground">Language</label>
                  <select className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none cursor-pointer transition-colors duration-200">
                    <option>English</option>
                    <option>French</option>
                    <option>Kreol Morisien</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-foreground">Currency</label>
                  <select className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none cursor-pointer transition-colors duration-200">
                    <option>MUR (₨)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {canViewStaffAi && (
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
                <div className="rounded-lg bg-primary-50 p-1.5">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                </div>
                AI integration
                {isAdmin && (
                  <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Admin
                  </span>
                )}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                API keys are stored only as{" "}
                <span className="font-medium text-surface-foreground">Supabase Edge Function secrets</span>{" "}
                (<code className="rounded bg-muted px-1 py-0.5 text-xs">AI_API_KEY_BROKER</code>,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">AI_API_KEY_CLIENT</code>). They are never
                entered in the browser.
              </p>
              {!aiEdgeLikelyAvailable() && (
                <p className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  Connect a real Supabase project (not the local placeholder URL) to load status and run connection
                  tests from here.
                </p>
              )}
              {aiStatusError && (
                <p className="mt-3 text-sm text-danger-600">{aiStatusError}</p>
              )}
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-surface-foreground">Staff (broker) key</p>
                    <p className="text-xs text-muted-foreground">Used for internal workflows</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {aiStatusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          aiStatus?.brokerKeyConfigured
                            ? "bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {aiStatus?.brokerKeyConfigured ? "Configured" : "Not set"}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={pingingBroker || aiStatusLoading}
                      onClick={() => void runBrokerPing()}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-surface-foreground hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      {pingingBroker ? "Testing…" : "Test connection"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-surface-foreground">Client-facing key</p>
                    <p className="text-xs text-muted-foreground">Separate key for client-safe features</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {aiStatusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          aiStatus?.clientKeyConfigured
                            ? "bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {aiStatus?.clientKeyConfigured ? "Configured" : "Not set"}
                      </span>
                    )}
                    {isAdmin ? (
                      <button
                        type="button"
                        disabled={pingingClient || aiStatusLoading}
                        onClick={() => void runClientPing()}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-surface-foreground hover:bg-muted disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                      >
                        {pingingClient ? "Testing…" : "Test connection"}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Admin tests client key</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshAiStatus()}
                  disabled={aiStatusLoading}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Refresh status
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-warning-50 p-1.5">
                <Bell className="h-5 w-5 text-warning-600" />
              </div>
              Notifications
            </h3>
            <div className="mt-5 space-y-1">
              {[
                { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email" },
                { key: "sms" as const, label: "SMS Notifications", desc: "Receive SMS alerts" },
                { key: "whatsapp" as const, label: "WhatsApp Notifications", desc: "Receive WhatsApp messages" },
                { key: "policyExpiry" as const, label: "Policy Expiry Alerts", desc: "Get notified before policies expire" },
                { key: "paymentReminder" as const, label: "Payment Reminders", desc: "Automatic payment due reminders" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors duration-150">
                  <div>
                    <p className="text-sm font-medium text-surface-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className={`relative h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ${
                      notifications[item.key] ? "bg-accent-500" : "bg-gray-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        notifications[item.key] ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-accent-50 p-1.5">
                <Lock className="h-5 w-5 text-accent-600" />
              </div>
              Security
            </h3>
            <div className="mt-5 space-y-3">
              <button className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
                Change Password
              </button>
              <button className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
                Enable 2FA
              </button>
              <button className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
                View Audit Log
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-primary-50 p-1.5">
                <Palette className="h-5 w-5 text-primary-600" />
              </div>
              Appearance
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["light", "Light"],
                  ["dark", "Dark"],
                  ["system", "System"],
                ] as const satisfies ReadonlyArray<readonly [ThemePreference, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreference(value)}
                  className={`min-w-[5.5rem] flex-1 rounded-lg border-2 px-3 py-2.5 text-center text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                    preference === value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-200"
                      : "border-border text-muted-foreground hover:border-primary-300 dark:hover:border-primary-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              System follows your device appearance. Theme is saved on this browser.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
