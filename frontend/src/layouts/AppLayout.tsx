import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Upload, Users, Settings, LogOut, Menu, X,
  ShieldCheck, KeyRound, ClipboardList, MessageSquare, CreditCard,
  Calculator, BarChart3, Bell, MessageCircle, Mic, Shield, ChevronDown,
  Globe, Home, RefreshCw, Award, Calendar, Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAutoLogout } from "../hooks/useAutoLogout";
import { useTranslation } from "react-i18next";
import { ParticleField } from "../components/ParticleField";
import { ThemeToggle } from "../components/ThemeToggle";
import { CommandPalette } from "../components/CommandPalette";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { COMPANY_NAME_SHORT, PORTAL_HEADING } from "../lib/branding";
import "../lib/i18n";

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Array<"admin" | "broker" | "client">;
  badge?: string;
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Core",
    items: [
      { name: "dashboard", to: "/dashboard", icon: LayoutDashboard },
      { name: "my-policies", to: "/dashboard/my-policies", icon: Home, roles: ["client"] },
      { name: "documents", to: "/dashboard/documents", icon: FileText },
      { name: "upload", to: "/dashboard/upload", icon: Upload },
      { name: "clients", to: "/dashboard/clients", icon: Users, roles: ["admin", "broker"] },
    ],
  },
  {
    label: "Services",
    items: [
      { name: "services", to: "/dashboard/services", icon: Globe },
      { name: "quotes", to: "/dashboard/quotes", icon: Calculator },
      { name: "mid-term", to: "/dashboard/mid-term", icon: RefreshCw },
    ],
  },
  {
    label: "Communication",
    items: [
      { name: "inbox", to: "/dashboard/inbox", icon: MessageSquare },
      { name: "payments", to: "/dashboard/payments", icon: CreditCard },
      { name: "whatsapp", to: "/dashboard/whatsapp", icon: MessageCircle, roles: ["admin", "broker"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "review", to: "/dashboard/review", icon: ClipboardList, roles: ["admin", "broker"] },
      { name: "analytics", to: "/dashboard/analytics", icon: BarChart3, roles: ["admin", "broker"] },
      { name: "commissions", to: "/dashboard/commissions", icon: Award, roles: ["admin", "broker"] },
      { name: "capacity", to: "/dashboard/capacity", icon: Users, roles: ["admin"] },
      { name: "audit", to: "/dashboard/audit", icon: Shield, roles: ["admin"] },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "expiry", to: "/dashboard/expiry", icon: Bell },
      { name: "calendar", to: "/dashboard/calendar", icon: Calendar },
      { name: "voice", to: "/dashboard/voice", icon: Mic },
      { name: "compliance", to: "/dashboard/compliance", icon: ShieldCheck, roles: ["admin", "broker"] },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "2fa", to: "/dashboard/2fa", icon: KeyRound },
      { name: "settings", to: "/dashboard/settings", icon: Settings },
    ],
  },
];

const navLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "my-policies": "My Policies",
  documents: "Documents",
  upload: "Upload",
  clients: "Clients",
  services: "Services",
  quotes: "Quote Calculator",
  "mid-term": "Mid-Term Adjust.",
  inbox: "Inbox",
  payments: "Payments",
  whatsapp: "WhatsApp",
  review: "Doc Review",
  analytics: "Analytics",
  commissions: "Commissions",
  capacity: "Capacity Mgmt.",
  audit: "Audit Log",
  expiry: "Expiry Monitor",
  calendar: "Holiday Calendar",
  voice: "Voice Upload",
  compliance: "Compliance",
  "2fa": "Two-Factor Auth",
  settings: "Settings",
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const { i18n } = useTranslation();
  useAutoLogout();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const jumpShortcut =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘K" : "Ctrl+K";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) { next.delete(label); } else { next.add(label); }
      return next;
    });
  };

  const visibleGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.roles) return true;
      return profile?.role && item.roles.includes(profile.role);
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="relative flex h-screen dashboard-bg">
      <a
        href="#main-content"
        className="absolute -top-16 left-4 z-[9999] rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar — Glassmorphism + Aurora gradient ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} relative overflow-hidden`}>
        {/* Sidebar gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950" />
        {/* Visible aurora orbs in sidebar */}
        <div className="aurora-bg opacity-70">
          <div className="aurora-orb-1 aurora-sidebar-1" />
          <div className="aurora-orb-2 aurora-sidebar-2" />
          <div className="aurora-orb-3 aurora-sidebar-3" />
        </div>
        {/* Rising particles in sidebar */}
        <ParticleField count={10} variant="rise" className="opacity-60" />

        {/* Logo */}
        <div className="relative flex h-16 items-center gap-3 px-5 border-b border-white/8">
          <div className="rounded-lg bg-white/10 border border-white/15 p-1.5 shrink-0">
            <ShieldCheck className="h-5 w-5 text-accent-400" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold tracking-tight text-white">{COMPANY_NAME_SHORT}</span>
            <p className="text-xs text-primary-400 truncate">Insurance Portal</p>
          </div>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-500 hover:text-primary-300 cursor-pointer transition-colors duration-200"
              >
                {group.label}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${collapsedGroups.has(group.label) ? "-rotate-90" : ""}`} />
              </button>
              {!collapsedGroups.has(group.label) && group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-white/15 text-white nav-active-glow border border-white/10"
                        : "text-primary-300 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isActive ? "text-accent-400" : "text-primary-400 group-hover:text-primary-200"}`} />
                      <span className="truncate">{navLabels[item.name] ?? item.name}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-danger-500 px-1.5 py-0.5 text-xs font-bold text-white leading-none">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="relative border-t border-white/8 p-4 space-y-3">
          {/* Language switcher */}
          <div className="flex gap-1 rounded-xl bg-white/8 border border-white/10 p-1">
            {[["en", "EN"], ["fr", "FR"], ["mfe", "KR"]].map(([code, label]) => (
              <button
                key={code}
                onClick={() => { void i18n.changeLanguage(code ?? "en"); localStorage.setItem("sb_lang", code ?? "en"); }}
                className={`flex-1 rounded-lg py-1 text-xs font-bold cursor-pointer transition-all duration-200 ${
                  i18n.language === code ? "bg-primary-500 text-white shadow-sm" : "text-primary-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-sm">
              {profile?.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile?.full_name || "User"}</p>
              <p className="text-xs text-primary-400 capitalize">{profile?.role || "client"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary-300 hover:bg-white/8 hover:text-white cursor-pointer transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header — glass effect */}
        <header className="flex h-16 items-center gap-4 border-b border-border/60 bg-white/70 backdrop-blur-md px-6 lg:px-8 shadow-sm dark:border-border dark:bg-surface/75 dark:shadow-none">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary-50 dark:hover:bg-muted cursor-pointer lg:hidden transition-colors duration-200"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-500 hidden sm:block" />
            <h1 className="text-base font-bold text-surface-foreground">{PORTAL_HEADING}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary-300 hover:text-surface-foreground cursor-pointer transition-colors dark:border-border dark:hover:border-primary-600"
              aria-label="Open jump to page"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[8rem] truncate">Jump to…</span>
              <kbd className="hidden rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground md:inline">{jumpShortcut}</kbd>
            </button>
            <CurrencySwitcher />
            <ThemeToggle />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200/60 px-3 py-1 text-xs font-semibold text-accent-700 dark:border-accent-600/40 dark:bg-accent-950/50 dark:text-accent-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
              Protected · {profile?.role ?? "client"}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-sm sm:hidden">
              {profile?.full_name?.charAt(0) ?? "U"}
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:p-8 lg:pb-[max(2rem,env(safe-area-inset-bottom))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
