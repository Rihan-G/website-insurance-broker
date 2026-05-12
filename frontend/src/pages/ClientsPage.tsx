import { useEffect, useState, useMemo } from "react";
import { Search, UserPlus, Mail, Phone, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  policies: number;
  documents: number;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Marie Dupont", email: "marie@email.com", phone: "+230 5729 1234", policies: 3, documents: 12, status: "active", joinedAt: "2024-03-15" },
  { id: "2", name: "Jean-Pierre Ramgoolam", email: "jp@email.com", phone: "+230 5834 5678", policies: 2, documents: 8, status: "active", joinedAt: "2024-05-22" },
  { id: "3", name: "Priya Devi", email: "priya@email.com", phone: "+230 5912 3456", policies: 1, documents: 4, status: "pending", joinedAt: "2025-01-10" },
  { id: "4", name: "Ahmed Boolell", email: "ahmed@email.com", phone: "+230 5748 9012", policies: 4, documents: 15, status: "active", joinedAt: "2023-11-08" },
  { id: "5", name: "Sophie Chen", email: "sophie@email.com", phone: "+230 5863 7890", policies: 1, documents: 3, status: "inactive", joinedAt: "2024-08-30" },
  { id: "6", name: "Ravi Patel", email: "ravi@email.com", phone: "+230 5921 4567", policies: 2, documents: 7, status: "active", joinedAt: "2024-06-12" },
];

const statusStyles: Record<string, string> = {
  active: "bg-accent-50 text-accent-600",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning-50 text-warning-600",
};

function deriveStatus(activePolicies: number, pendingPolicies: number): Client["status"] {
  if (activePolicies > 0) return "active";
  if (pendingPolicies > 0) return "pending";
  return "inactive";
}

export function ClientsPage() {
  const { demoAuthActive } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [liveClients, setLiveClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoAuthActive) {
      setLiveClients([]);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data: profiles, error: pErr }, polRes, docRes] = await Promise.all([
        supabase.from("profiles").select("id,email,full_name,phone,created_at").eq("role", "client").order("created_at", { ascending: false }),
        supabase.from("policies").select("client_id,status"),
        supabase.from("documents").select("client_id"),
      ]);
      setLoading(false);
      if (cancelled || pErr || !profiles) {
        setLiveClients([]);
        return;
      }

      const polByClient = new Map<string, { active: number; pending: number; total: number }>();
      const polRows = (polRes.data ?? []) as Array<{ client_id: string; status: string }>;
      for (const row of polRows) {
        const cid = row.client_id;
        const prev = polByClient.get(cid) ?? { active: 0, pending: 0, total: 0 };
        prev.total += 1;
        if (row.status === "active") prev.active += 1;
        if (row.status === "pending") prev.pending += 1;
        polByClient.set(cid, prev);
      }

      const docByClient = new Map<string, number>();
      const docRows = (docRes.data ?? []) as Array<{ client_id: string }>;
      for (const row of docRows) {
        docByClient.set(row.client_id, (docByClient.get(row.client_id) ?? 0) + 1);
      }

      setLiveClients(
        (profiles as Array<{ id: string; full_name: string; email: string; phone: string | null; created_at: string }>).map((p) => {
          const pc = polByClient.get(p.id) ?? { active: 0, pending: 0, total: 0 };
          return {
            id: p.id,
            name: p.full_name,
            email: p.email,
            phone: p.phone ?? "—",
            policies: pc.total,
            documents: docByClient.get(p.id) ?? 0,
            status: deriveStatus(pc.active, pc.pending),
            joinedAt: p.created_at.slice(0, 10),
          };
        }),
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [demoAuthActive]);

  const rows = demoAuthActive ? mockClients : liveClients;

  const filtered = useMemo(
    () =>
      rows.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [rows, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Clients</h2>
          <p className="text-muted-foreground">
            {demoAuthActive ? "Demo sample data" : loading ? "Loading from Supabase…" : "Manage your insurance clients"}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
        >
          <UserPlus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="rounded-xl border border-border bg-surface p-6 hover:shadow-md hover:border-primary-200 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold dark:bg-primary-950 dark:text-primary-300">
                  {client.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-surface-foreground">{client.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[client.status]}`}
                  >
                    {client.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{client.phone}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{client.policies} policies</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{client.documents} docs</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-surface py-12 text-center text-muted-foreground">
          {searchTerm ? <>No clients found matching &quot;{searchTerm}&quot;.</> : <>No clients in the database yet.</>}
        </div>
      )}
    </div>
  );
}
