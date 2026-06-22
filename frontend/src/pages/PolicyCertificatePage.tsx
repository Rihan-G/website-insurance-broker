import { useState } from "react";
import { Printer, ShieldCheck, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { COMPANY_NAME as BRAND_NAME, OFFICE_ADDRESS as BRAND_ADDRESS, CONTACT_EMAIL as BRAND_EMAIL, CONTACT_PHONE_TEL as BRAND_PHONE } from "../lib/branding";

type Policy = {
  id: string;
  policyNumber: string;
  product: string;
  insurer: string;
  clientName: string;
  clientAddress: string;
  clientIdNumber: string;
  sumInsured: number;
  premium: number;
  excess: number;
  startDate: Date;
  endDate: Date;
  coverType: string;
  vehicleReg?: string;
  vehicleMake?: string;
};

const DEMO_POLICIES: Policy[] = [
  {
    id: "p1",
    policyNumber: "MOT-2024-8841",
    product: "Motor Insurance",
    insurer: "MUA Ltd",
    clientName: "Marie Dupont",
    clientAddress: "14 Rue Labourdonnais, Port Louis, Mauritius",
    clientIdNumber: "A1234567890123K",
    sumInsured: 850000,
    premium: 18500,
    excess: 15000,
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2025, 0, 14),
    coverType: "Comprehensive",
    vehicleReg: "M 1234 AU",
    vehicleMake: "Toyota Yaris 1.3 2021",
  },
  {
    id: "p2",
    policyNumber: "HOM-2023-1120",
    product: "Home Insurance",
    insurer: "Swan Insurance",
    clientName: "Ahmed Boolell",
    clientAddress: "7 Allée des Cocotiers, Quatre Bornes, Mauritius",
    clientIdNumber: "B9876543210987Z",
    sumInsured: 4500000,
    premium: 12800,
    excess: 10000,
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2024, 5, 30),
    coverType: "Building & Contents",
  },
  {
    id: "p3",
    policyNumber: "HLT-2024-0432",
    product: "Health Insurance",
    insurer: "Jubilee Insurance",
    clientName: "Priya Devi",
    clientAddress: "22 Sir Seewoosagur Ramgoolam St, Vacoas, Mauritius",
    clientIdNumber: "C1122334455667P",
    sumInsured: 500000,
    premium: 28000,
    excess: 5000,
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2025, 1, 28),
    coverType: "Group Health — Premium Plan",
  },
];

export function PolicyCertificatePage() {
  const [selectedId, setSelectedId] = useState(DEMO_POLICIES[0]!.id);
  const policy = DEMO_POLICIES.find((p) => p.id === selectedId) ?? DEMO_POLICIES[0]!;

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Documents</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Policy certificate</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate a printable certificate of insurance for any policy.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <Printer className="h-4 w-4" aria-hidden /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Policy selector */}
      <div className="print:hidden">
        <label className="block text-sm font-semibold text-surface-foreground mb-2">Select policy</label>
        <div className="relative max-w-sm">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {DEMO_POLICIES.map((p) => (
              <option key={p.id} value={p.id}>{p.policyNumber} — {p.clientName} ({p.product})</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="rounded-2xl border border-border bg-white p-8 shadow-sm dark:bg-surface print:rounded-none print:border-none print:shadow-none print:p-0"
        style={{ fontFamily: "serif" }}
      >
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-primary-600 pb-6 mb-6">
          <div>
            <p className="text-2xl font-bold text-primary-700" style={{ fontFamily: "sans-serif" }}>{BRAND_NAME}</p>
            <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: "sans-serif" }}>{BRAND_ADDRESS}</p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "sans-serif" }}>{BRAND_PHONE} · {BRAND_EMAIL}</p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "sans-serif" }}>FSC Licensed Insurance Broker · Licence No. IB/00XX/2024</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <ShieldCheck className="h-10 w-10 text-primary-600" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600" style={{ fontFamily: "sans-serif" }}>Certificate of Insurance</p>
          </div>
        </div>

        {/* Certificate title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Certificate of Insurance</h2>
          <p className="mt-1 text-sm text-gray-500">This certificate is issued as a matter of information only and confers no rights upon the certificate holder.</p>
        </div>

        {/* Grid of details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          <Field label="Policy Number" value={policy.policyNumber} />
          <Field label="Insurer" value={policy.insurer} />
          <Field label="Type of Insurance" value={policy.product} />
          <Field label="Cover Type" value={policy.coverType} />
          <Field label="Policyholder Name" value={policy.clientName} />
          <Field label="ID / BRN Number" value={policy.clientIdNumber} />
          <Field label="Policyholder Address" value={policy.clientAddress} colSpan />
          {policy.vehicleReg && <Field label="Vehicle Registration" value={policy.vehicleReg} />}
          {policy.vehicleMake && <Field label="Vehicle Description" value={policy.vehicleMake} />}
          <Field
            label="Period of Insurance"
            value={`${format(policy.startDate, "dd MMMM yyyy")} to ${format(policy.endDate, "dd MMMM yyyy")} (both dates inclusive)`}
            colSpan
          />
          <Field label="Sum Insured" value={`MUR ${policy.sumInsured.toLocaleString()}`} />
          <Field label="Annual Premium" value={`MUR ${policy.premium.toLocaleString()}`} />
          <Field label="Policy Excess" value={`MUR ${policy.excess.toLocaleString()}`} />
          <Field label="Date of Issue" value={format(new Date(), "dd MMMM yyyy")} />
        </div>

        {/* Certification block */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-8 text-sm text-gray-700">
          This is to certify that a policy of insurance as described above has been issued to the named policyholder and is in force for the period stated.
          This certificate is issued by <strong>{BRAND_NAME}</strong> as authorised insurance broker on behalf of <strong>{policy.insurer}</strong>.
          Any claim under this policy should be reported to your broker immediately.
        </div>

        {/* Signature block */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="border-t border-gray-400 pt-3">
            <p className="text-sm text-gray-600">Authorised Signatory — {BRAND_NAME}</p>
            <p className="text-xs text-gray-400 mt-1">Licensed Insurance Broker</p>
          </div>
          <div className="border-t border-gray-400 pt-3">
            <p className="text-sm text-gray-600">Date: {format(new Date(), "dd MMMM yyyy")}</p>
            <p className="text-xs text-gray-400 mt-1">Issued in Mauritius</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400">
          This document is computer-generated. {BRAND_NAME} is regulated by the Financial Services Commission of Mauritius.
          This certificate does not replace the original policy schedule. Please refer to your full policy wording for terms and conditions.
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, colSpan }: { label: string; value: string; colSpan?: boolean }) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5" style={{ fontFamily: "sans-serif" }}>{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
