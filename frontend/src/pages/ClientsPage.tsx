import { useEffect, useState, useMemo } from "react";
import { Search, UserPlus, Mail, Phone, FileText, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { DEMO_CLIENT_ROWS } from "../lib/demoClients";
import toast from "react-hot-toast";

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

const DEMO_EXTRA_CLIENTS_KEY = "sindicom_demo_extra_clients";

const statusStyles: Record<string, string> = {
  active: "bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300",
  inactive: "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-surface-foreground/80",
  pending: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300",
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
  const [addOpen, setAddOpen] = useState(false);
  const [extraDemoClients, setExtraDemoClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (!demoAuthActive) return;
    try {
      const raw = sessionStorage.getItem(DEMO_EXTRA_CLIENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Client[];
      if (Array.isArray(parsed)) setExtraDemoClients(parsed);
    } catch {
      /* ignore */
    }
  }, [demoAuthActive]);

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

  const rows = useMemo(
    () => (demoAuthActive ? [...DEMO_CLIENT_ROWS, ...extraDemoClients] : liveClients),
    [demoAuthActive, extraDemoClients, liveClients],
  );

  const persistExtraDemo = (next: Client[]) => {
    setExtraDemoClients(next);
    try {
      sessionStorage.setItem(DEMO_EXTRA_CLIENTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const handleAddDemoClient = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    const phone = newPhone.trim() || "—";
    if (!name || !email) {
      toast.error("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    const id = `demo-${Date.now()}`;
    const row: Client = {
      id,
      name,
      email,
      phone,
      policies: 0,
      documents: 0,
      status: "pending",
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    persistExtraDemo([...extraDemoClients, row]);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setAddOpen(false);
    toast.success("Client added to demo list (session only).");
  };

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
          onClick={() => setAddOpen(true)}
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
            className="rounded-xl border border-border bg-surface p-6 hover:shadow-md hover:border-primary-200 cursor-pointer transition-all duration-200 dark:hover:border-primary-700"
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

      {addOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-client-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 id="add-client-title" className="text-lg font-semibold text-surface-foreground">
                Add client
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {demoAuthActive ? (
              <form onSubmit={handleAddDemoClient} className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adds a row to the demo client grid for this browser session only. Production onboarding uses Supabase Auth invites; see{" "}
                  <span className="font-medium text-surface-foreground">PHASES.md</span> in the repository root for the rollout checklist.
                </p>
                <div>
                  <label className="block text-sm font-medium text-surface-foreground mb-1">Full name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-foreground mb-1">Phone (optional)</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                    autoComplete="tel"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  With a live Supabase project, create client users in <strong className="text-surface-foreground">Authentication</strong> and ensure the{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">profiles</code> trigger sets <code className="rounded bg-muted px-1 py-0.5 text-xs">role</code> to{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">client</code>. They will then appear in this list automatically.
                </p>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
