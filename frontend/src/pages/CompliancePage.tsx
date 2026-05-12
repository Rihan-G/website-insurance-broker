import { useState } from "react";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Fingerprint, Search, Download, ChevronRight, UserSearch } from "lucide-react";
import { exportToCsv } from "../lib/exportService";
import toast from "react-hot-toast";
import { matchPersonName, type AmlNameVerdict } from "../lib/amlNameMatch";

interface ComplianceRecord {
  id: string;
  clientName: string;
  email: string;
  kycStatus: "verified" | "pending" | "failed" | "not_started";
  amlStatus: "clear" | "flagged" | "pending";
  idVerified: boolean;
  dataConsentDate: string | null;
  dataRetentionDue: string;
  riskLevel: "low" | "medium" | "high";
}

const mockRecords: ComplianceRecord[] = [
  { id: "1", clientName: "Marie Dupont", email: "marie@email.com", kycStatus: "verified", amlStatus: "clear", idVerified: true, dataConsentDate: "2024-03-15", dataRetentionDue: "2031-03-15", riskLevel: "low" },
  { id: "2", clientName: "Jean-Pierre Ramgoolam", email: "jp@email.com", kycStatus: "pending", amlStatus: "pending", idVerified: false, dataConsentDate: "2024-05-22", dataRetentionDue: "2031-05-22", riskLevel: "medium" },
  { id: "3", clientName: "Priya Devi", email: "priya@email.com", kycStatus: "verified", amlStatus: "flagged", idVerified: true, dataConsentDate: "2025-01-10", dataRetentionDue: "2032-01-10", riskLevel: "high" },
  { id: "4", clientName: "Ahmed Boolell", email: "ahmed@email.com", kycStatus: "not_started", amlStatus: "pending", idVerified: false, dataConsentDate: null, dataRetentionDue: "2030-11-08", riskLevel: "medium" },
  { id: "5", clientName: "Sophie Chen", email: "sophie@email.com", kycStatus: "verified", amlStatus: "clear", idVerified: true, dataConsentDate: "2024-08-30", dataRetentionDue: "2031-08-30", riskLevel: "low" },
];

const kycStyles: Record<string, string> = {
  verified: "bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300",
  pending: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300",
  failed: "bg-danger-50 text-danger-600 dark:bg-danger-950/40 dark:text-danger-300",
  not_started: "bg-muted text-muted-foreground dark:bg-muted/50",
};

const amlStyles: Record<string, string> = {
  clear: "bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300",
  flagged: "bg-danger-50 text-danger-600 dark:bg-danger-950/40 dark:text-danger-300",
  pending: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300",
};

const riskStyles: Record<string, string> = {
  low: "bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-300",
  medium: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300",
  high: "bg-danger-50 text-danger-600 dark:bg-danger-950/40 dark:text-danger-300",
};

const amlVerdictStyles: Record<AmlNameVerdict, string> = {
  match: "bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300",
  review: "bg-warning-50 text-warning-700 dark:bg-warning-950/40 dark:text-warning-300",
  mismatch: "bg-danger-50 text-danger-700 dark:bg-danger-950/40 dark:text-danger-300",
};

export function CompliancePage() {
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [selected, setSelected] = useState<ComplianceRecord | null>(null);
  const [amlClientId, setAmlClientId] = useState(mockRecords[0]?.id ?? "");
  const [amlSuppliedName, setAmlSuppliedName] = useState("");
  const [amlResult, setAmlResult] = useState<ReturnType<typeof matchPersonName> | null>(null);

  const filtered = mockRecords.filter((r) => {
    const matchSearch = r.clientName.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase());
    const matchKyc = kycFilter === "all" || r.kycStatus === kycFilter;
    return matchSearch && matchKyc;
  });

  const stats = {
    verified: mockRecords.filter((r) => r.kycStatus === "verified").length,
    pending: mockRecords.filter((r) => r.kycStatus === "pending").length,
    flagged: mockRecords.filter((r) => r.amlStatus === "flagged").length,
    highRisk: mockRecords.filter((r) => r.riskLevel === "high").length,
  };

  const handleExport = () => {
    exportToCsv(mockRecords.map((r) => ({ ...r })), "compliance_report");
    toast.success("Compliance report exported.");
  };

  const runAmlNameCheck = () => {
    const rec = mockRecords.find((r) => r.id === amlClientId);
    if (!rec) {
      toast.error("Select a client record.");
      return;
    }
    if (!amlSuppliedName.trim()) {
      toast.error("Enter the name to compare (e.g. as on ID or payment instruction).");
      return;
    }
    setAmlResult(matchPersonName(rec.clientName, amlSuppliedName));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Compliance & KYC</h2>
          <p className="text-muted-foreground">AML/KYC monitoring, e-ID verification, and data retention</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* AML name match (demo — replace with vendor API in production) */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 dark:border-border">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-50 dark:bg-primary-950/50 p-2">
            <UserSearch className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-surface-foreground">AML name consistency</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compare a name from an ID, wire, or form against the client on file. This demo uses local fuzzy matching only; production should call your AML/KYC provider.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-surface-foreground mb-1.5">Client on file</label>
            <select
              aria-label="Client for AML check"
              value={amlClientId}
              onChange={(e) => {
                setAmlClientId(e.target.value);
                setAmlResult(null);
              }}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none cursor-pointer"
            >
              {mockRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.clientName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-foreground mb-1.5">Name to verify</label>
            <input
              type="text"
              value={amlSuppliedName}
              onChange={(e) => {
                setAmlSuppliedName(e.target.value);
                setAmlResult(null);
              }}
              placeholder="e.g. Marie D. Dupont"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={runAmlNameCheck}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200 active:scale-[0.99]"
        >
          <Fingerprint className="h-4 w-4" />
          Run name match
        </button>
        {amlResult && (
          <div className="rounded-lg border border-border bg-muted/30 dark:bg-muted/20 p-4 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Result:</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${amlVerdictStyles[amlResult.verdict]}`}>
                {amlResult.verdict === "match" ? "Match" : amlResult.verdict === "review" ? "Manual review" : "No match"}
              </span>
              <span className="text-muted-foreground">Score {(amlResult.score * 100).toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Normalized on file: <span className="font-mono text-surface-foreground">{amlResult.normalizedRecord || "—"}</span>
              {" · "}
              Supplied: <span className="font-mono text-surface-foreground">{amlResult.normalizedInput || "—"}</span>
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "KYC Verified", value: stats.verified, icon: CheckCircle, color: "text-accent-600 bg-accent-50 dark:text-accent-300 dark:bg-accent-950/40" },
          { label: "KYC Pending", value: stats.pending, icon: Clock, color: "text-warning-600 bg-warning-50 dark:text-warning-300 dark:bg-warning-950/35" },
          { label: "AML Flagged", value: stats.flagged, icon: AlertTriangle, color: "text-danger-600 bg-danger-50 dark:text-danger-300 dark:bg-danger-950/35" },
          { label: "High Risk", value: stats.highRisk, icon: Shield, color: "text-danger-600 bg-danger-50 dark:text-danger-300 dark:bg-danger-950/35" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-surface-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Compliance frameworks */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "FSRA Compliance", desc: "Financial Services Regulatory Authority (Mauritius)", status: "Active", icon: Shield },
          { title: "GDPR / Data Protection", desc: "Data Protection Act 2017 (Mauritius)", status: "Compliant", icon: FileText },
          { title: "FATF AML Standards", desc: "Anti-money laundering monitoring", status: "Monitoring", icon: AlertTriangle },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary-50 p-2">
                <f.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-surface-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                <span className="mt-2 inline-block rounded-full bg-accent-50 text-accent-600 px-2 py-0.5 text-xs font-medium">{f.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none" />
        </div>
        <select aria-label="Filter by KYC status" value={kycFilter} onChange={(e) => setKycFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none cursor-pointer">
          <option value="all">All KYC Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="not_started">Not Started</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left">
                <th className="px-6 py-3 font-semibold text-surface-foreground">Client</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">KYC Status</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">AML</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">e-ID</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Risk Level</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Data Expires</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-primary-50/50 dark:hover:bg-muted/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <p className="font-medium text-surface-foreground">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${kycStyles[r.kycStatus]}`}>{r.kycStatus.replace("_", " ")}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${amlStyles[r.amlStatus]}`}>{r.amlStatus}</span>
                  </td>
                  <td className="px-6 py-4">
                    {r.idVerified
                      ? <span className="inline-flex items-center gap-1 text-accent-600 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5" />Verified</span>
                      : <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><Fingerprint className="h-3.5 w-3.5" />Pending</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${riskStyles[r.riskLevel]}`}>{r.riskLevel}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{r.dataRetentionDue}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setSelected(r)} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline cursor-pointer">
                      View <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-foreground">{selected.clientName}</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-surface-foreground cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "KYC Status", value: selected.kycStatus.replace("_", " "), style: kycStyles[selected.kycStatus] },
                { label: "AML Status", value: selected.amlStatus, style: amlStyles[selected.amlStatus] },
                { label: "Risk Level", value: selected.riskLevel, style: riskStyles[selected.riskLevel] },
                { label: "e-ID Verified", value: selected.idVerified ? "Yes" : "No", style: selected.idVerified ? "bg-accent-50 text-accent-600" : "bg-muted text-muted-foreground" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${item.style}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Consent</span>
                <span className="font-medium text-surface-foreground">{selected.dataConsentDate ?? "Not obtained"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Retention Due</span>
                <span className="font-medium text-surface-foreground">{selected.dataRetentionDue}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {!selected.idVerified && (
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">
                  <Fingerprint className="h-4 w-4" />
                  Run e-ID Check
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
