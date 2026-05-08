import Papa from "papaparse";

export function exportToCsv<T extends object>(data: T[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDocumentsForExport(documents: Array<{
  file_name: string;
  client?: string;
  status: string;
  ocr_confidence: number | null;
  version: number;
  created_at: string;
  file_size: number;
}>) {
  return documents.map((d) => ({
    "File Name": d.file_name,
    "Client": d.client ?? "",
    "Status": d.status,
    "OCR Confidence (%)": d.ocr_confidence ?? "Pending",
    "Version": d.version,
    "Size (KB)": (d.file_size / 1024).toFixed(1),
    "Uploaded At": new Date(d.created_at).toLocaleString(),
  }));
}

export function formatClientsForExport(clients: Array<{
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
}>) {
  return clients.map((c) => ({
    "Full Name": c.full_name,
    "Email": c.email,
    "Phone": c.phone ?? "",
    "Role": c.role,
    "Joined": new Date(c.created_at).toLocaleDateString(),
  }));
}

export function formatPaymentsForExport(payments: Array<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  created_at: string;
  paid_at: string | null;
}>) {
  return payments.map((p) => ({
    "Payment ID": p.id,
    "Amount": `${p.currency} ${p.amount.toFixed(2)}`,
    "Status": p.status,
    "Gateway": p.gateway.replace("_", " ").toUpperCase(),
    "Created": new Date(p.created_at).toLocaleDateString(),
    "Paid At": p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "–",
  }));
}
