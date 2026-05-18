import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Upload, Users, Settings, LogOut, Menu, X,
  ShieldCheck, KeyRound, ClipboardList, MessageSquare, CreditCard,
  Calculator, BarChart3, Bell, MessageCircle, Mic, Shield, ChevronDown,
  Globe, Home, RefreshCw, Award, Calendar, Search, CalendarClock, FileWarning,
  MessagesSquare, BellRing, ListTodo,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAutoLogout } from "../hooks/useAutoLogout";
import { useTranslation } from "react-i18next";
import { ParticleField } from "../components/ParticleField";
import { ThemeToggle } from "../components/ThemeToggle";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardAccessSentinel } from "../components/DashboardAccessSentinel";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { COMPANY_NAME_SHORT, PORTAL_HEADING } from "../lib/branding";
import { getPortalFlavor } from "../lib/portalFlavor";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";
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
    label: "Care",
    items: [
      { name: "renewals", to: "/dashboard/renewals", icon: CalendarClock },
      { name: "claims", to: "/dashboard/claims", icon: FileWarning },
      { name: "secure-messages", to: "/dashboard/secure-messages", icon: MessagesSquare },
      { name: "notifications", to: "/dashboard/notifications", icon: BellRing },
      { name: "tasks", to: "/dashboard/tasks", icon: ListTodo, roles: ["admin", "broker"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "review", to: "/dashboard/review", icon: ClipboardList, roles: ["admin", "broker"] },
      { name: "analytics", to: "/dashboard/analytics", icon: BarChart3, roles: ["admin", "broker"] },
      { name: "commissions", to: "/dashboard/commissions", icon: Award, roles: ["admin", "broker"] },
      { name: "capacity", to: "/dashboard/capacity", icon: Users, roles: ["admin", "broker"] },
      { name: "audit", to: "/dashboard/audit", icon: Shield, roles: ["admin", "broker"] },
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
  renewals: "Renewals",
  claims: "Claims intake",
  "secure-messages": "Secure messages",
  notifications: "Notifications",
  tasks: "Tasks",
  whatsapp: "WhatsApp",
  review: "Doc Review",
  analytics: "Analytics",
  commissions: "Commissions",
  capacity: "Capacity Mgmt.",
  audit: "Audit Log",
  expiry: "Expiry Monitor",
  calendar: "Calendar",
  voice: "Voice Upload",
  compliance: "Compliance",
  "2fa": "Two-Factor Auth",
  settings: "Settings",
};

type VisibleNavGroup = { label: string; items: NavItem[] };

function DashboardSidebarPanel({
  onNavLinkClick,
  onSignOut,
  visibleGroups,
  collapsedGroups,
  toggleGroup,
  notifBadge,
  profile,
}: {
  onNavLinkClick: () => void;
  onSignOut: () => void | Promise<void>;
  visibleGroups: VisibleNavGroup[];
  collapsedGroups: Set<string>;
  toggleGroup: (label: string) => void;
  notifBadge: number | null;
  profile: Profile | null;
}) {
  const { i18n } = useTranslation();

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950" />
      <div className="aurora-bg opacity-70">
        <div className="aurora-orb-1 aurora-sidebar-1" />
        <div className="aurora-orb-2 aurora-sidebar-2" />
        <div className="aurora-orb-3 aurora-sidebar-3" />
      </div>
      <ParticleField count={10} variant="rise" className="opacity-60" />

      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-5">
        <div className="rounded-lg border border-white/15 bg-white/10 p-1.5 shrink-0">
          <ShieldCheck className="h-5 w-5 text-accent-400" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold tracking-tight text-white">{COMPANY_NAME_SHORT}</span>
          <p className="truncate text-xs text-primary-400">Insurance Portal</p>
        </div>
      </div>

      <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className="flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-500 transition-colors duration-200 hover:text-primary-300"
            >
              {group.label}
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${collapsedGroups.has(group.label) ? "-rotate-90" : ""}`}
              />
            </button>
            {!collapsedGroups.has(group.label) &&
              group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => onNavLinkClick()}
                  className={({ isActive }) =>
                    `group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "border border-white/10 bg-white/15 text-white nav-active-glow"
                        : "text-primary-300 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => {
                    const badgeCount =
                      item.name === "notifications" && notifBadge != null && notifBadge > 0
                        ? notifBadge > 99
                          ? "99+"
                          : String(notifBadge)
                        : undefined;
                    const badgeText = item.badge ?? badgeCount;
                    return (
                      <>
                        <item.icon
                          className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isActive ? "text-accent-400" : "text-primary-400 group-hover:text-primary-200"}`}
                        />
                        <span className="truncate">{navLabels[item.name] ?? item.name}</span>
                        {badgeText && (
                          <span className="ml-auto rounded-full bg-danger-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                            {badgeText}
                          </span>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="relative shrink-0 space-y-3 border-t border-white/8 p-4">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/8 p-1">
          {[
            ["en", "EN"],
            ["fr", "FR"],
            ["mfe", "KR"],
          ].map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                void i18n.changeLanguage(code ?? "en");
                localStorage.setItem("sb_lang", code ?? "en");
              }}
              className={`flex-1 cursor-pointer rounded-lg py-1 text-xs font-bold transition-all duration-200 ${
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
          type="button"
          onClick={() => void onSignOut()}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary-300 transition-colors duration-200 hover:bg-white/8 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { profile, signOut, session, demoAuthActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [notifBadge, setNotifBadge] = useState<number | null>(null);
  useAutoLogout();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (demoAuthActive || !session?.user?.id) {
      setNotifBadge(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { count, error } = await supabase
        .from("portal_notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("read", false);
      if (cancelled || error) return;
      setNotifBadge(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, demoAuthActive]);

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
      const shell = getPortalFlavor();
      if (shell === "client") {
        if (item.roles?.length && !item.roles.includes("client")) return false;
      } else if (shell === "staff") {
        if (item.roles?.length === 1 && item.roles[0] === "client") return false;
      }
      if (!item.roles) return true;
      return profile?.role ? item.roles.includes(profile.role) : false;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-hidden dashboard-bg">
      <a
        href="#main-content"
        className="absolute -top-16 left-4 z-[9999] rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 min-h-[100dvh] w-full bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop: in-flow column. Mobile drawer is a separate fixed sibling (`lg:hidden`) so Chrome never reserves a phantom flex width. */}
      <aside className="relative hidden h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-white/5 lg:flex lg:flex-col">
        <DashboardSidebarPanel
          onNavLinkClick={() => {}}
          onSignOut={handleSignOut}
          visibleGroups={visibleGroups}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
          notifBadge={notifBadge}
          profile={profile}
        />
      </aside>

      <aside
        id="app-sidebar"
        aria-hidden={!sidebarOpen}
        className={`fixed bottom-[env(safe-area-inset-bottom,0px)] left-0 top-[env(safe-area-inset-top,0px)] z-50 flex min-h-0 w-64 max-w-[85vw] flex-col overflow-hidden border-r border-white/5 shadow-2xl transition-transform duration-300 ease-out will-change-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <DashboardSidebarPanel
          onNavLinkClick={() => setSidebarOpen(false)}
          onSignOut={handleSignOut}
          visibleGroups={visibleGroups}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
          notifBadge={notifBadge}
          profile={profile}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:box-border max-lg:pt-[env(safe-area-inset-top,0px)]">
        {/* Top header — glass effect */}
        <header className="flex h-16 min-w-0 shrink-0 items-center gap-4 border-b border-border/70 bg-white/85 px-6 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_28px_-16px_rgba(3,105,161,0.12)] backdrop-blur-xl lg:px-8 dark:border-border dark:bg-surface/75 dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_12px_40px_-12px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
            className="shrink-0 rounded-xl p-1.5 text-muted-foreground hover:bg-primary-50 dark:hover:bg-muted cursor-pointer lg:hidden transition-colors duration-200"
          >
            {sidebarOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{sidebarOpen ? "Close navigation" : "Open navigation"}</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary-500 hidden sm:block" />
            <h1 className="truncate text-base font-bold text-surface-foreground">{PORTAL_HEADING}</h1>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
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
              Protected · {profile?.role === "client" ? "Member" : profile?.role ?? "client"}
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
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:p-8 lg:pb-[max(2rem,env(safe-area-inset-bottom))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <DashboardAccessSentinel>
            <Outlet />
          </DashboardAccessSentinel>
        </main>
      </div>
    </div>
  );
}
