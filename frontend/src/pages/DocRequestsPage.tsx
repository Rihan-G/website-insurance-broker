import { useState } from "react";
import { subDays, format } from "date-fns";
import { FileUp, CheckCircle2, Clock, Plus, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

type DocRequest = {
  id: string;
  clientName: string;
  docType: string;
  note: string;
  requestedAt: Date;
  status: "pending" | "uploaded" | "overdue";
};

const DEMO_REQUESTS: DocRequest[] = [
  { id: "r1", clientName: "Marie Dupont", docType: "Vehicle Registration Certificate", note: "Required before motor policy renewal on 15 Jan.", requestedAt: subDays(new Date(), 5), status: "pending" },
  { id: "r2", clientName: "Ahmed Boolell", docType: "National Identity Card", note: "AML verification — please upload front and back.", requestedAt: subDays(new Date(), 12), status: "overdue" },
  { id: "r3", clientName: "Priya Devi", docType: "Medical Certificate", note: "Needed for health policy upgrade.", requestedAt: subDays(new Date(), 2), status: "uploaded" },
  { id: "r4", clientName: "Jean-Pierre R.", docType: "Business Registration Certificate", note: "Required for new commercial liability policy.", requestedAt: subDays(new Date(), 1), status: "pending" },
];

const DOC_TYPES = [
  "National Identity Card",
  "Passport",
  "Vehicle Registration Certificate",
  "Driver's Licence",
  "Medical Certificate",
  "Business Registration Certificate",
  "Property Title Deed",
  "Bank Statement (3 months)",
  "Tax Clearance Certificate",
  "Other",
];

const DEMO_CLIENTS = ["Marie Dupont", "Ahmed Boolell", "Priya Devi", "Jean-Pierre R.", "Sophie Chen"];

const STATUS_CONFIG = {
  pending: { label: "Pending", class: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950/30 dark:text-warning-300 dark:border-warning-600/40", icon: Clock },
  uploaded: { label: "Uploaded", class: "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-950/30 dark:text-accent-300 dark:border-accent-600/40", icon: CheckCircle2 },
  overdue: { label: "Overdue", class: "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950/30 dark:text-danger-300 dark:border-danger-600/40", icon: Clock },
};

export function DocRequestsPage() {
  const { profile } = useAuth();
  const isBroker = profile?.role === "admin" || profile?.role === "broker";

  const [requests, setRequests] = useState<DocRequest[]>(DEMO_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState(DEMO_CLIENTS[0]);
  const [newDocType, setNewDocType] = useState(DOC_TYPES[0]);
  const [newNote, setNewNote] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const req: DocRequest = {
      id: `r${Date.now()}`,
      clientName: newClient,
      docType: newDocType,
      note: newNote,
      requestedAt: new Date(),
      status: "pending",
    };
    setRequests((prev) => [req, ...prev]);
    setShowForm(false);
    setNewNote("");
    toast.success(`Document request sent to ${newClient}`);
  };

  const handleUpload = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "uploaded" } : r));
    toast.success("Document uploaded");
  };

  // Client view — show only their requests
  const visible = isBroker ? requests : requests.filter((r) => r.clientName === "Marie Dupont");

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {isBroker ? "Broker tools" : "My documents"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Document requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBroker
              ? "Request specific documents from clients. They see it in their portal."
              : "Your broker has requested these documents. Upload them below."}
          </p>
        </div>
        {isBroker && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden /> New request
          </button>
        )}
      </div>

      {/* New request form */}
      {showForm && (
        <div className="rounded-2xl border border-primary-300 bg-primary-50/50 dark:border-primary-700/40 dark:bg-primary-950/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-surface-foreground">New document request</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-surface-foreground">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-surface-foreground mb-1.5">Client</label>
                <div className="relative">
                  <select value={newClient} onChange={(e) => setNewClient(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400">
                    {DEMO_CLIENTS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-foreground mb-1.5">Document type</label>
                <div className="relative">
                  <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400">
                    {DOC_TYPES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-foreground mb-1.5">Note to client (optional)</label>
              <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="E.g. Please upload front and back of NIC"
                className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
                Send request
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-surface-foreground transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request list */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{visible.length} request{visible.length !== 1 ? "s" : ""}</p>
        </div>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-accent-400" aria-hidden />
            <p className="text-sm font-semibold text-surface-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">No document requests at the moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {visible.map((r) => {
              const cfg = STATUS_CONFIG[r.status];
              const Icon = cfg.icon;
              return (
                <li key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/40">
                    <FileUp className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isBroker && <p className="text-sm font-bold text-surface-foreground">{r.clientName}</p>}
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cfg.class}`}>
                        <Icon className="h-2.5 w-2.5" aria-hidden />{cfg.label}
                      </span>
                    </div>
                    <p className={`text-sm ${isBroker ? "text-muted-foreground" : "font-semibold text-surface-foreground"} mt-0.5`}>{r.docType}</p>
                    {r.note && <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground/70">Requested {format(r.requestedAt, "dd MMM yyyy")}</p>
                  </div>
                  {r.status !== "uploaded" && (
                    <div className="shrink-0">
                      {isBroker ? (
                        <button type="button" onClick={() => handleUpload(r.id)}
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-surface-foreground transition-colors">
                          Mark uploaded
                        </button>
                      ) : (
                        <Link to="/dashboard/upload"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors">
                          <FileUp className="h-3.5 w-3.5" aria-hidden /> Upload
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
