import { Outlet, NavLink, Link, redirect, useLoaderData } from "react-router";
import {
  LayoutDashboard, FileText, Upload, CreditCard, Settings, LogOut,
  Bell, Users, ClipboardList, ShieldCheck, MessageSquare, BarChart3,
} from "lucide-react";
import { getSession, createSupabaseServerClient as createClient } from "~/lib/supabase.server";
import { COMPANY_NAME_SHORT } from "~/lib/branding";
import type { Route } from "./+types/_dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const headers = new Headers();
  const { session, supabase: sb } = await getSession(request);
  if (!sb) throw redirect("/login?notice=setup");
  if (!session) throw redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", session.user.id)
    .single();

  return { profile, user: session.user };
}

export async function action({ request }: Route.ActionArgs) {
  const headers = new Headers();
  const supabase = createClient(request, headers);
  await supabase.auth.signOut();
  return redirect("/login", { headers });
}

const navItems = [
  { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "Documents", to: "/dashboard/documents", icon: FileText },
  { name: "Upload", to: "/dashboard/upload", icon: Upload },
  { name: "Payments", to: "/dashboard/payments", icon: CreditCard },
  { name: "Notifications", to: "/dashboard/notifications", icon: Bell },
  { name: "Settings", to: "/dashboard/settings", icon: Settings },
];

const staffItems = [
  { name: "Clients", to: "/dashboard/clients", icon: Users },
  { name: "Review", to: "/dashboard/review", icon: ClipboardList },
  { name: "Performance", to: "/dashboard/performance", icon: BarChart3 },
  { name: "Compliance", to: "/dashboard/compliance", icon: ShieldCheck },
  { name: "Messages", to: "/dashboard/secure-messages", icon: MessageSquare },
];

export default function DashboardLayout() {
  const { profile } = useLoaderData<typeof loader>();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const initials = (profile?.full_name ?? "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-blue-950">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-5">
          <div className="rounded-lg border border-white/15 bg-white/10 p-1.5">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
          </div>
          <span className="text-sm font-bold text-white">{COMPANY_NAME_SHORT}</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? "border border-white/10 bg-white/15 text-white" : "text-blue-300 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {isStaff && (
            <>
              <p className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-500">Staff</p>
              {staffItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive ? "border border-white/10 bg-white/15 text-white" : "text-blue-300 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-white/8 p-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile?.full_name ?? "User"}</p>
              <p className="text-xs text-blue-400 capitalize">{profile?.role ?? "client"}</p>
            </div>
          </div>
          <form method="post">
            <button type="submit" className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-300 hover:bg-white/8 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-base font-bold text-gray-900 dark:text-white">{COMPANY_NAME_SHORT} Portal</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/dashboard/notifications" className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-500 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 transition-colors">
              <Bell className="h-4 w-4" />
            </Link>
            <Link to="/dashboard/settings" className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-500 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 transition-colors">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
