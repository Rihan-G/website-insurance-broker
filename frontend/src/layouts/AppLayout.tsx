import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Upload, Users, Settings, LogOut, Menu, X,
  ShieldCheck, KeyRound, ClipboardList, MessageSquare, CreditCard,
  Calculator, BarChart3, Bell, MessageCircle, Mic, Shield, ChevronDown,
  Globe, Home, RefreshCw, Award, Calendar, Search, CalendarClock, FileWarning,
  MessagesSquare, BellRing, ListTodo, UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAutoLogout } from "../hooks/useAutoLogout";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../components/ThemeToggle";
import { CommandPalette } from "../components/CommandPalette";
import { DashboardAccessSentinel } from "../components/DashboardAccessSentinel";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { BrandLogo } from "../components/BrandLogo";
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
      { name: "quote-leads", to: "/dashboard/quote-leads", icon: UserPlus, roles: ["admin", "broker"] },
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
  "quote-leads": "Quote leads",
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

const navEmoji: Record<string, string> = {
  dashboard: "🏠",
  "my-policies": "🧾",
  documents: "📄",
  upload: "📤",
  clients: "👥",
  services: "🧰",
  quotes: "🧮",
  "mid-term": "🔁",
  inbox: "📥",
  payments: "💳",
  renewals: "📅",
  claims: "⚠️",
  "secure-messages": "💬",
  notifications: "🔔",
  tasks: "✅",
  whatsapp: "🟢",
  review: "🗂️",
  "quote-leads": "🎯",
  analytics: "📈",
  commissions: "🏅",
  capacity: "🧑‍🤝‍🧑",
  audit: "🔒",
  expiry: "⏰",
  calendar: "🗓️",
  voice: "🎤",
  compliance: "🛡️",
  "2fa": "🔑",
  settings: "⚙️",
};

function navLabel(name: string): string {
  return navLabels[name] ?? name;
}

function navLabelWithEmoji(name: string): string {
  const label = navLabel(name);
  const emoji = navEmoji[name];
  return emoji ? `${emoji} ${label}` : label;
}

type VisibleNavGroup = { label: string; items: NavItem[] };

const DESKTOP_SHELL_MIN_PX = 1024;

/**
 * Prefer min(document client width, visualViewport width) so iOS/Android Chrome in
 * “Desktop site” / zoomed layouts still treat the shell as compact: matchMedia alone
 * can report a wide layout viewport while only a narrow band is visible, which
 * used to keep a desktop rail and squeeze dashboard content to the right.
 */
function shellLayoutWidthPx(): number {
  if (typeof document === "undefined") return 0;
  const client = document.documentElement.clientWidth;
  if (typeof window === "undefined") return client;
  const vvW = window.visualViewport?.width;
  if (vvW != null && vvW > 0 && client > 0) return Math.min(client, vvW);
  return client > 0 ? client : window.innerWidth;
}

function shellLayoutIsWide(): boolean {
  return shellLayoutWidthPx() >= DESKTOP_SHELL_MIN_PX;
}

function shellLayoutIsWideServer(): boolean {
  return false;
}

function subscribeShellLayout(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const vv = window.visualViewport;
  vv?.addEventListener("resize", cb);
  vv?.addEventListener("scroll", cb);
  window.addEventListener("resize", cb);
  return () => {
    vv?.removeEventListener("resize", cb);
    vv?.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}

function dashboardLabelFromPath(pathname: string, withEmoji: boolean): string {
  if (pathname === "/dashboard") return withEmoji ? navLabelWithEmoji("dashboard") : navLabel("dashboard");
  if (!pathname.startsWith("/dashboard/")) return withEmoji ? navLabelWithEmoji("dashboard") : navLabel("dashboard");
  const slug = pathname.slice("/dashboard/".length).split("/")[0] ?? "";
  return withEmoji ? navLabelWithEmoji(slug) : navLabel(slug);
}

function DashboardSidebarPanel({
  onNavLinkClick,
  onSignOut,
  visibleGroups,
  collapsedGroups,
  toggleGroup,
  notifBadge,
  profile,
  showEmojiHints,
}: {
  onNavLinkClick: () => void;
  onSignOut: () => void | Promise<void>;
  visibleGroups: VisibleNavGroup[];
  collapsedGroups: Set<string>;
  toggleGroup: (label: string) => void;
  notifBadge: number | null;
  profile: Profile | null;
  showEmojiHints: boolean;
}) {
  const { i18n } = useTranslation();

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-[#0a3554] to-primary-950" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at 80% 90%, rgba(22,163,74,0.12), transparent 40%)",
        }}
      />

      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-5">
        <div className="rounded-lg border border-white/15 bg-white/10 p-1.5 shrink-0">
          <BrandLogo className="h-5 w-5" imageClassName="h-5 w-5 w-auto object-contain" />
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
              <span className="inline-flex items-center gap-1.5">
                {showEmojiHints && (
                  <span aria-hidden>
                    {group.label === "Core"
                      ? "🧭"
                      : group.label === "Services"
                        ? "🧩"
                        : group.label === "Communication"
                          ? "💬"
                          : group.label === "Care"
                            ? "🩺"
                            : group.label === "Admin"
                              ? "🛠️"
                              : group.label === "Tools"
                                ? "🧪"
                                : "👤"}
                  </span>
                )}
                {group.label}
              </span>
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
                        <span className="truncate">{showEmojiHints ? navLabelWithEmoji(item.name) : navLabel(item.name)}</span>
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
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { profile, signOut, session, demoAuthActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [notifBadge, setNotifBadge] = useState<number | null>(null);
  const isLg = useSyncExternalStore(subscribeShellLayout, shellLayoutIsWide, shellLayoutIsWideServer);
  useAutoLogout();

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    setQuickCreateOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isLg) setSidebarOpen(false);
  }, [isLg]);

  useEffect(() => {
    if (isLg || !sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLg, sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen || isLg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, isLg]);

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
  const currentPageLabel = dashboardLabelFromPath(location.pathname, !isLg);
  const quickActions = profile?.role === "client"
    ? [
        { to: "/dashboard/upload", label: "New upload", icon: "📤" },
        { to: "/dashboard/claims", label: "Start claim", icon: "⚠️" },
        { to: "/dashboard/secure-messages", label: "New message", icon: "💬" },
      ]
    : [
        { to: "/dashboard/upload", label: "New upload", icon: "📤" },
        { to: "/dashboard/quotes", label: "Create quote", icon: "🧮" },
        { to: "/dashboard/tasks", label: "Create task", icon: "✅" },
        { to: "/dashboard/claims", label: "Start claim", icon: "⚠️" },
      ];

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
      const role = profile?.role ?? "client";
      return item.roles.includes(role);
    }),
  })).filter((group) => group.items.length > 0);

  const mobileNavOverlay =
    !isLg && sidebarOpen
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
              aria-hidden
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              id="app-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="fixed inset-y-0 left-0 z-[201] flex min-h-0 w-[min(100%,24rem)] flex-col overflow-hidden border-r border-white/10 bg-primary-950 pt-[env(safe-area-inset-top)] shadow-[4px_0_24px_rgba(0,0,0,0.35)]"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-[max(0.5rem,env(safe-area-inset-top))] z-[5] rounded-xl p-2 text-primary-100 transition-colors hover:bg-white/10"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <DashboardSidebarPanel
                onNavLinkClick={() => setSidebarOpen(false)}
                onSignOut={handleSignOut}
                visibleGroups={visibleGroups}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                notifBadge={notifBadge}
                profile={profile}
                showEmojiHints
              />
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <>
    <div
      className={`relative flex w-full flex-1 overflow-hidden bg-background min-h-0 min-h-screen-dynamic ${isLg ? "flex-row" : "flex-col"}`}
    >
      {/* Desktop only: mount the w-64 rail only when the shell is truly wide (see shellLayoutWidthPx). */}
      {isLg ? (
        <aside className="relative flex h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-white/5">
          <DashboardSidebarPanel
            onNavLinkClick={() => {}}
            onSignOut={handleSignOut}
            visibleGroups={visibleGroups}
            collapsedGroups={collapsedGroups}
            toggleGroup={toggleGroup}
            notifBadge={notifBadge}
            profile={profile}
            showEmojiHints={false}
          />
        </aside>
      ) : null}

      {/* Dashboard canvas: full width on mobile; nav is a fixed portal (Figma-style sheet), not a flex sibling. */}
      <div
        className={`relative flex min-h-0 min-w-0 w-full max-w-full flex-1 basis-full flex-col overflow-x-clip overflow-hidden ${!isLg ? "pt-[env(safe-area-inset-top)]" : ""}`}
      >
        <a
          href="#main-content"
          className="absolute -top-16 left-4 z-[9999] rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

        <header
          className={`relative z-10 flex h-16 min-w-0 shrink-0 items-center gap-4 border-b border-border/70 bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_28px_-16px_rgba(3,105,161,0.12)] backdrop-blur-xl dark:border-border/80 dark:bg-surface/92 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-12px_rgba(0,0,0,0.45)] ${isLg ? "px-8" : "px-6"}`}
        >
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-controls={!isLg && sidebarOpen ? "app-sidebar" : undefined}
            onClick={() => setSidebarOpen((open) => !open)}
            className={`shrink-0 rounded-xl p-1.5 text-muted-foreground hover:bg-primary-50 dark:hover:bg-muted cursor-pointer transition-colors duration-200 ${isLg ? "hidden" : ""}`}
          >
            {sidebarOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{sidebarOpen ? "Close navigation" : "Open navigation"}</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <BrandLogo className="h-5 w-5 shrink-0 hidden sm:block" imageClassName="h-5 w-5 w-auto object-contain" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-surface-foreground">{PORTAL_HEADING}</h1>
              <p className="hidden truncate text-[11px] text-muted-foreground md:block">{currentPageLabel}</p>
            </div>
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickCreateOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700"
                aria-expanded={quickCreateOpen}
                aria-haspopup="menu"
              >
                <span className="text-sm leading-none">＋</span>
                <span className="hidden sm:inline">New</span>
              </button>
              {quickCreateOpen && (
                <div className="absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-44 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                  {quickActions.map((a) => (
                    <button
                      key={a.to}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-surface-foreground hover:bg-muted"
                      onClick={() => {
                        setQuickCreateOpen(false);
                        navigate(a.to);
                      }}
                    >
                      <span aria-hidden>{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <CurrencySwitcher />
            <ThemeToggle />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-accent-200/70 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-800 dark:border-accent-600/40 dark:bg-accent-950/50 dark:text-accent-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
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
          className={`dashboard-bg relative z-0 min-h-0 min-w-0 w-full max-w-full flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
            isLg
              ? "p-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
              : "p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          }`}
        >
          <DashboardAccessSentinel>
            <Outlet />
          </DashboardAccessSentinel>
        </main>
      </div>
    </div>
    {mobileNavOverlay}
    </>
  );
}
