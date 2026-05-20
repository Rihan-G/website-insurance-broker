import { Bell, Calendar, FileText, Shield } from "lucide-react";
import { WEBSITE_DOMAIN } from "../../lib/branding";

/** Decorative “your portal” preview for the marketing hero (no live data) — written for clients & prospects, not broker ops. */
export function HomeHeroDashboardMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg select-none lg:mx-0"
      aria-hidden
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent-500/25 via-primary-500/15 to-transparent blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/75 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          </div>
          <p className="ml-2 truncate text-[11px] font-medium text-primary-200/90">{WEBSITE_DOMAIN}</p>
        </div>
        <div className="grid gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-200/90">Your cover</p>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300 ring-1 ring-emerald-500/30">
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-300">Policies</p>
              <p className="mt-1 text-xl font-bold text-white">2</p>
              <p className="text-[10px] text-emerald-300/90">Motor & home</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-300">Next renewal</p>
              <p className="mt-1 text-xl font-bold text-white">Aug</p>
              <p className="text-[10px] text-primary-200/90">We will remind you</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-primary-900/80 to-slate-900/80 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary-200">This year</p>
              <Calendar className="h-4 w-4 text-accent-400" />
            </div>
            <div className="flex h-14 items-end gap-1.5">
              {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary-600/40 to-accent-400/80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-primary-200/80">Illustrative preview — not your real data.</p>
          </div>
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary-200">Updates</p>
            {[
              { icon: FileText, t: "Policy schedule uploaded", s: "New" },
              { icon: Shield, t: "Renewal quote ready to review", s: "Action" },
              { icon: Bell, t: "Reminder: motor premium due soon", s: "Soon" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-950/40 px-2 py-2 ring-1 ring-white/5">
                <row.icon className="h-4 w-4 shrink-0 text-primary-300" />
                <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-primary-100">{row.t}</p>
                <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-200">
                  {row.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
