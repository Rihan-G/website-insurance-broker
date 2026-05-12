import { useState } from "react";
import { Save, Bell, Lock, Globe, Palette } from "lucide-react";
import { useTheme, type ThemePreference } from "../context/ThemeContext";
import { COMPANY_NAME } from "../lib/branding";
import { useCurrency, type CurrencyCode } from "../context/CurrencyContext";

export function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const { currency, setCurrency, allCurrencies } = useCurrency();
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
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none cursor-pointer transition-colors duration-200"
                  >
                    {allCurrencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

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
