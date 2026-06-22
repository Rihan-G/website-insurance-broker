import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Save, Bell, Lock, Globe, Palette, ShieldCheck, Download as DownloadIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme, type ThemePreference } from "../context/ThemeContext";
import { COMPANY_NAME } from "../lib/branding";
import { useCurrency, type CurrencyCode } from "../context/CurrencyContext";
import { type StoredUserPrefs } from "../lib/localPrefs";
import { loadPrefsForUser, savePrefsForUser } from "../lib/userPrefsService";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";

type DataRequestType = "export" | "delete";
type DataRequestStatus = "pending" | "in_progress" | "done";
interface DataRequestRow { id: string; type: DataRequestType; status: DataRequestStatus; created_at: string; }

const langToI18n: Record<string, string> = { English: "en", French: "fr", "Kreol Morisien": "kr" };

export function SettingsPage() {
  const { user, profile } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const { i18n } = useTranslation();
  const { preference, setPreference } = useTheme();
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [prefs, setPrefs] = useState<StoredUserPrefs | null>(null);
  const [dataRequests, setDataRequests] = useState<DataRequestRow[]>([]);
  const [submittingDsar, setSubmittingDsar] = useState(false);

  useEffect(() => {
    void loadPrefsForUser(user?.id, COMPANY_NAME).then(setPrefs);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    void db.dataRequests().select("id, type, status, created_at").eq("client_id", user.id).order("created_at", { ascending: false }).then((res: { data: unknown }) => {
      setDataRequests((res.data as DataRequestRow[]) ?? []);
    });
  }, [user]);

  const submitDsar = async (type: DataRequestType) => {
    if (!user) return;
    const alreadyOpen = dataRequests.some((r) => r.type === type && r.status !== "done");
    if (alreadyOpen) {
      toast.error("You already have an open request of this type.");
      return;
    }
    setSubmittingDsar(true);
    const { error } = await db.dataRequests().insert({ client_id: user.id, type });
    setSubmittingDsar(false);
    if (error) {
      toast.error(error.message ?? "Failed to submit request.");
      return;
    }
    toast.success("Request submitted. Our team will be in touch within 30 days.");
    const { data } = await db.dataRequests().select("id, type, status, created_at").eq("client_id", user.id).order("created_at", { ascending: false });
    setDataRequests((data as DataRequestRow[]) ?? []);
  };

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
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-foreground">
              <div className="rounded-lg bg-muted p-1.5">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              Data &amp; Privacy
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Mauritius Data Protection Act rights. Requests are actioned within 30 days.
            </p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                disabled={submittingDsar || !user}
                onClick={() => void submitDsar("export")}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted disabled:opacity-50"
              >
                <DownloadIcon className="h-4 w-4 shrink-0 text-primary-600" />
                Request a copy of my data
              </button>
              <button
                type="button"
                disabled={submittingDsar || !user}
                onClick={() => void submitDsar("delete")}
                className="flex w-full items-center gap-2 rounded-lg border border-danger-200 px-4 py-2.5 text-sm font-medium text-danger-700 hover:bg-danger-50 disabled:opacity-50 dark:border-danger-800/50 dark:text-danger-400 dark:hover:bg-danger-950/30"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                Request account deletion
              </button>
            </div>
            {dataRequests.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your requests</p>
                {dataRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                    <span className="capitalize text-surface-foreground">{r.type === "delete" ? "Account deletion" : "Data export"}</span>
                    <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${
                      r.status === "done"
                        ? "bg-accent-50 text-accent-700 dark:bg-accent-950/30 dark:text-accent-300"
                        : "bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-300"
                    }`}>{r.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            )}
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
