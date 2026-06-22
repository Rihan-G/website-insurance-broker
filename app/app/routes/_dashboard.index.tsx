import { Link, useLoaderData } from "react-router";
import {
  Users, FileText, Clock, DollarSign, Upload, ArrowRight, ShieldCheck,
} from "lucide-react";
import { getSession, createSupabaseServerClient } from "~/lib/supabase.server";
import type { Route } from "./+types/_dashboard.index";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Dashboard — Sindicom Portal" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const headers = new Headers();
  const { session } = await getSession(request);
  if (!session) return { stats: null, profile: null };

  const supabase = createSupabaseServerClient(request, headers);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", session.user.id)
    .single();

  const isStaff = profile?.role === "admin" || profile?.role === "broker";

  if (isStaff) {
    const [clients, policies, pending, revenue] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("policies").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("documents").select("*", { count: "exact", head: true }).in("status", ["uploaded", "processing"]),
      supabase.from("payments").select("amount").eq("status", "paid"),
    ]);
    const monthlyRevenue = (revenue.data ?? []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
    return {
      profile,
      stats: {
        totalClients: clients.count ?? 0,
        activePolicies: policies.count ?? 0,
        pendingDocs: pending.count ?? 0,
        monthlyRevenue,
      },
    };
  }

  const [policies, pending] = await Promise.all([
    supabase.from("policies").select("*", { count: "exact", head: true }).eq("client_id", session.user.id).eq("status", "active"),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", session.user.id).in("status", ["uploaded", "processing"]),
  ]);

  return {
    profile,
    stats: { totalClients: 1, activePolicies: policies.count ?? 0, pendingDocs: pending.count ?? 0, monthlyRevenue: 0 },
  };
}

export default function Dashboard() {
  const { stats, profile } = useLoaderData<typeof loader>();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const firstName = (profile?.full_name ?? "there").split(" ")[0];

  const cards = isStaff
    ? [
        { title: "Total Clients", value: stats?.totalClients ?? 0, icon: Users, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" },
        { title: "Active Policies", value: stats?.activePolicies ?? 0, icon: FileText, bg: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300" },
        { title: "Pending Documents", value: stats?.pendingDocs ?? 0, icon: Clock, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" },
        { title: "Monthly Revenue (MUR)", value: (stats?.monthlyRevenue ?? 0).toLocaleString(), icon: DollarSign, bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" },
      ]
    : [
        { title: "Active Policies", value: stats?.activePolicies ?? 0, icon: FileText, bg: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300" },
        { title: "Pending Documents", value: stats?.pendingDocs ?? 0, icon: Clock, bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" },
      ];

  const shortcuts = isStaff
    ? [
        { to: "/dashboard/clients", label: "View clients", icon: Users },
        { to: "/dashboard/upload", label: "Upload document", icon: Upload },
        { to: "/dashboard/payments", label: "Manage payments", icon: DollarSign },
        { to: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck },
      ]
    : [
        { to: "/dashboard/upload", label: "Upload document", icon: Upload },
        { to: "/dashboard/payments", label: "View payments", icon: DollarSign },
        { to: "/dashboard/documents", label: "My documents", icon: FileText },
      ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
          {isStaff ? "Broker workspace" : "Your portal"}
        </p>
        <h2 className="mt-1 text-2xl font-bold">Good day, {firstName}</h2>
        <p className="mt-1 text-sm text-blue-200">
          {isStaff ? "Policies, documents, and client care in one place." : "Your policies, documents, and messages in one place."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
              <card.icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((s) => (
            <Link key={s.to} to={s.to} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300">
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Document pipeline</p>
        <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <Upload className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">No documents in the pipeline yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload a policy or endorsement to kick off review.</p>
          <Link to="/dashboard/upload" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Upload className="h-4 w-4" /> Go to upload
          </Link>
        </div>
      </div>
    </div>
  );
}
