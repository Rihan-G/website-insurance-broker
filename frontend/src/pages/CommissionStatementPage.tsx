import { useState } from "react";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { Printer } from "lucide-react";
import { COMPANY_NAME as BRAND_NAME, OFFICE_ADDRESS as BRAND_ADDRESS, CONTACT_EMAIL as BRAND_EMAIL } from "../lib/branding";
import { useAuth } from "../context/AuthContext";

type CommissionRow = {
  id: string;
  policyNumber: string;
  clientName: string;
  product: string;
  insurer: string;
  grossPremium: number;
  commissionRate: number;
  commissionAmount: number;
  transactionDate: Date;
  type: "new" | "renewal";
};

function buildDemoRows(monthOffset: number): CommissionRow[] {
  const base = subMonths(new Date(), monthOffset);
  const d = (day: number) => new Date(base.getFullYear(), base.getMonth(), day);
  return [
    { id: "1", policyNumber: "MOT-2024-8841", clientName: "Marie Dupont", product: "Motor — Comprehensive", insurer: "MUA Ltd", grossPremium: 18500, commissionRate: 15, commissionAmount: 2775, transactionDate: d(3), type: "renewal" },
    { id: "2", policyNumber: "HOM-2023-1120", clientName: "Ahmed Boolell", product: "Home — Building", insurer: "Swan Insurance", grossPremium: 12800, commissionRate: 12, commissionAmount: 1536, transactionDate: d(5), type: "renewal" },
    { id: "3", policyNumber: "HLT-2024-0432", clientName: "Priya Devi", product: "Health — Group", insurer: "Jubilee Insurance", grossPremium: 28000, commissionRate: 10, commissionAmount: 2800, transactionDate: d(8), type: "new" },
    { id: "4", policyNumber: "BUS-2024-3310", clientName: "Jean-Pierre R.", product: "Business — Liability", insurer: "Mauritius Union", grossPremium: 45000, commissionRate: 12, commissionAmount: 5400, transactionDate: d(12), type: "new" },
    { id: "5", policyNumber: "LIF-2022-0891", clientName: "Sophie Chen", product: "Life — Term", insurer: "Sicom", grossPremium: 12000, commissionRate: 20, commissionAmount: 2400, transactionDate: d(15), type: "renewal" },
    { id: "6", policyNumber: "TRV-2024-0055", clientName: "Ravi Lutchmanen", product: "Travel — Annual", insurer: "Allianz", grossPremium: 5800, commissionRate: 18, commissionAmount: 1044, transactionDate: d(18), type: "new" },
    { id: "7", policyNumber: "MOT-2023-7710", clientName: "Nadia Ramgoolam", product: "Motor — Third Party", insurer: "Eagle Insurance", grossPremium: 8200, commissionRate: 15, commissionAmount: 1230, transactionDate: d(22), type: "renewal" },
  ];
}

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  offset: i,
  label: format(subMonths(new Date(), i), "MMMM yyyy"),
}));

export function CommissionStatementPage() {
  const { profile } = useAuth();
  const [monthOffset, setMonthOffset] = useState(0);
  const rows = buildDemoRows(monthOffset);
  const selectedMonth = subMonths(new Date(), monthOffset);

  const totalGross = rows.reduce((s, r) => s + r.grossPremium, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commissionAmount, 0);
  const newCount = rows.filter((r) => r.type === "new").length;
  const renewalCount = rows.filter((r) => r.type === "renewal").length;
  const avgRate = rows.length ? (rows.reduce((s, r) => s + r.commissionRate, 0) / rows.length).toFixed(1) : "0";
  const brokerName = profile?.full_name ?? "Jean Ramsamy";

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Finance</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Commission statement</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monthly summary of earned commissions for payroll and accounting.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={monthOffset}
            onChange={(e) => setMonthOffset(Number(e.target.value))}
            className="h-10 rounded-xl border border-border bg-surface px-4 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.offset} value={m.offset}>{m.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <Printer className="h-4 w-4" aria-hidden /> Print / PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-4 print:hidden">
        {[
          { label: "Total commission", value: `MUR ${totalCommission.toLocaleString()}` },
          { label: "Gross premium", value: `MUR ${totalGross.toLocaleString()}` },
          { label: "New policies", value: newCount.toString() },
          { label: "Renewals", value: renewalCount.toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-surface-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Printable statement */}
      <div
        id="statement"
        className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-surface print:rounded-none print:border-none print:shadow-none print:p-0"
      >
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-primary-600 pb-6 mb-6">
          <div>
            <p className="text-2xl font-bold text-primary-700">{BRAND_NAME}</p>
            <p className="mt-1 text-xs text-gray-500">{BRAND_ADDRESS}</p>
            <p className="text-xs text-gray-500">{BRAND_EMAIL}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Commission Statement</p>
            <p className="mt-1 text-sm font-semibold text-gray-700">{format(selectedMonth, "MMMM yyyy")}</p>
            <p className="text-xs text-gray-500">Period: {format(startOfMonth(selectedMonth), "dd MMM")} – {format(endOfMonth(selectedMonth), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Broker info */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Broker</p>
            <p className="font-semibold text-gray-900">{brokerName}</p>
            <p className="text-gray-600">Insurance Broker</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Statement ref</p>
            <p className="font-semibold text-gray-900">STMT-{format(selectedMonth, "yyyyMM")}-{brokerName.split(" ").map(w => w[0]).join("")}</p>
            <p className="text-gray-600">Issued {format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Summary box */}
        <div className="grid grid-cols-3 gap-4 mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Policies</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{rows.length}</p>
            <p className="text-xs text-gray-500">{newCount} new · {renewalCount} renewals</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Gross premium</p>
            <p className="mt-1 text-xl font-bold text-gray-900">MUR {totalGross.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Avg rate {avgRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total commission</p>
            <p className="mt-1 text-xl font-bold text-primary-700">MUR {totalCommission.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Payable by 28th</p>
          </div>
        </div>

        {/* Detail table */}
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300">
              {["Date", "Policy #", "Client", "Product", "Insurer", "Type", "Gross (MUR)", "Rate", "Commission (MUR)"].map((h) => (
                <th key={h} className="py-2 pr-3 text-left font-bold uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-3 text-gray-700">{format(r.transactionDate, "dd MMM")}</td>
                <td className="py-2 pr-3 font-mono text-gray-900">{r.policyNumber}</td>
                <td className="py-2 pr-3 text-gray-900">{r.clientName}</td>
                <td className="py-2 pr-3 text-gray-700">{r.product}</td>
                <td className="py-2 pr-3 text-gray-700">{r.insurer}</td>
                <td className="py-2 pr-3">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${r.type === "new" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"}`}>
                    {r.type === "new" ? "New" : "Renewal"}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right text-gray-900">{r.grossPremium.toLocaleString()}</td>
                <td className="py-2 pr-3 text-right text-gray-700">{r.commissionRate}%</td>
                <td className="py-2 pr-3 text-right font-bold text-gray-900">{r.commissionAmount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-bold">
              <td colSpan={6} className="py-2 pr-3 text-gray-900">TOTAL</td>
              <td className="py-2 pr-3 text-right text-gray-900">{totalGross.toLocaleString()}</td>
              <td className="py-2 pr-3 text-right text-gray-500">{avgRate}%</td>
              <td className="py-2 pr-3 text-right text-primary-700">{totalCommission.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-400 text-center">
          This statement is computer-generated by {BRAND_NAME}. Commissions are subject to applicable tax deductions per Mauritius Revenue Authority regulations.
          Retain for a minimum of 7 years per FSC record-keeping requirements.
        </div>
      </div>
    </div>
  );
}
