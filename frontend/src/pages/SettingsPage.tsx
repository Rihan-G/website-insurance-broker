import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Save, Bell, Lock, Globe, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme, type ThemePreference } from "../context/ThemeContext";
import { COMPANY_NAME } from "../lib/branding";
import { useCurrency, type CurrencyCode } from "../context/CurrencyContext";
import { type StoredUserPrefs } from "../lib/localPrefs";
import { loadPrefsForUser, savePrefsForUser } from "../lib/userPrefsService";
import { useAuth } from "../context/AuthContext";

const langToI18n: Record<string, string> = { English: "en", French: "fr", "Kreol Morisien": "kr" };

export function SettingsPage() {
  const { user, profile } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const { i18n } = useTranslation();
  const { preference, setPreference } = useTheme();
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [prefs, setPrefs] = useState<StoredUserPrefs | null>(null);

  useEffect(() => {
    void loadPrefsForUser(user?.id, COMPANY_NAME).then(setPrefs);
  }, [user?.id]);

  const setNotification = (key: keyof StoredUserPrefs["notifications"], value: boolean) => {
    setPrefs((p) => (p ? { ...p, notifications: { ...p.notifications, [key]: value } } : p));
  };

  const handleSave = () => {
    if (!prefs) return;
    void savePrefsForUser(user?.id, prefs);
    const code = langToI18n[prefs.language];
    if (code) void i18n.changeLanguage(code);
    toast.success(user?.id ? "Preferences saved to your profile" : "Preferences saved on this device");
  };

  if (!prefs) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and portal preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                  value={prefs.companyName}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, companyName: e.target.value } : p))}
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-foreground">Business Registration Number</label>
                <input
                  type="text"
                  value={prefs.businessRegistration}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, businessRegistration: e.target.value } : p))}
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-surface-foreground">Language</label>
                  <select
                    value={prefs.language}
                    onChange={(e) => setPrefs((p) => (p ? { ...p, language: e.target.value } : p))}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none cursor-pointer"
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Kreol Morisien</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-foreground">Currency</label>
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none cursor-pointer"
                  >
                    {allCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-warning-50 p-1.5">
                <Bell className="h-5 w-5 text-warning-600" />
              </div>
              Notifications
            </h3>
            <div className="mt-5 space-y-1">
              {(
                [
                  { key: "email" as const, label: "Email Notifications", desc: "Receive updates via email" },
                  { key: "sms" as const, label: "SMS Notifications", desc: "Receive SMS alerts" },
                  { key: "whatsapp" as const, label: "WhatsApp Notifications", desc: "Receive WhatsApp messages" },
                  { key: "policyExpiry" as const, label: "Policy Expiry Alerts", desc: "Get notified before policies expire" },
                  { key: "paymentReminder" as const, label: "Payment Reminders", desc: "Automatic payment due reminders" },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-surface-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotification(item.key, !prefs.notifications[item.key])}
                    className={`relative h-6 w-11 rounded-full cursor-pointer transition-colors ${
                      prefs.notifications[item.key] ? "bg-accent-500" : "bg-muted-foreground/40"
                    }`}
                    aria-pressed={prefs.notifications[item.key]}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        prefs.notifications[item.key] ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-accent-50 p-1.5">
                <Lock className="h-5 w-5 text-accent-600" />
              </div>
              Security
            </h3>
            <div className="mt-5 space-y-3">
              <button type="button" className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted">
                Change Password
              </button>
              <Link to="/dashboard/2fa" className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-surface-foreground hover:bg-muted">
                Enable 2FA
              </Link>
              {isStaff && (
                <Link to="/dashboard/audit" className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-surface-foreground hover:bg-muted">
                  View Audit Log
                </Link>
              )}
            </div>
          </div>

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
                  className={`min-w-[5.5rem] flex-1 rounded-lg border-2 px-3 py-2.5 text-center text-sm font-semibold cursor-pointer ${
                    preference === value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-200"
                      : "border-border text-muted-foreground hover:border-primary-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
