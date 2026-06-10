import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COMPANY_NAME, CONTACT_EMAIL } from "./branding";
import { BRAND_LOGO_PNG, BRAND_LOGO_SVG } from "./brandAssets";

let cachedLogoDataUrl: string | null | undefined;

async function loadBrandLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl;
  for (const url of [BRAND_LOGO_PNG, BRAND_LOGO_SVG]) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      cachedLogoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      if (cachedLogoDataUrl) return cachedLogoDataUrl;
    } catch {
      /* try next format */
    }
  }
  cachedLogoDataUrl = null;
  return null;
}

interface ReceiptData {
  receiptNumber: string;
  clientName: string;
  clientEmail: string;
  policyNumber: string;
  productType: string;
  insurer: string;
  amount: number;
  currency: string;
  gateway: string;
  paidAt: string;
  brokerName: string;
  brokerPhone: string;
}

interface PolicyData {
  policyNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  productType: string;
  insurer: string;
  premium: number;
  startDate: string;
  endDate: string;
  coverageDetails: string[];
}

function addHeader(doc: jsPDF, title: string, logoDataUrl?: string | null) {
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  const textX = logoDataUrl ? 32 : 14;
  if (logoDataUrl) {
    try {
      const format = logoDataUrl.includes("image/svg") ? "SVG" : "PNG";
      doc.addImage(logoDataUrl, format, 10, 5, 16, 16);
    } catch {
      /* text-only header */
    }
  }
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_NAME, textX, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Licensed Insurance Broker · Mauritius", textX, 20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 196, 16, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${COMPANY_NAME} · Tel: +230 XXXX XXXX · Email: ${CONTACT_EMAIL}`,
      105,
      287,
      { align: "center" }
    );
    doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: "right" });
  }
}

export async function generateReceipt(data: ReceiptData): Promise<void> {
  const doc = new jsPDF();
  const logo = await loadBrandLogoDataUrl();

  addHeader(doc, "PAYMENT RECEIPT", logo);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptNumber, 55, 40);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", 130, 40);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.paidAt).toLocaleDateString("en-MU"), 155, 40);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 45, 196, 45);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", 14, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.clientName, 14, 63);
  doc.text(data.clientEmail, 14, 70);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Broker", 130, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.brokerName, 130, 63);
  doc.text(data.brokerPhone, 130, 70);

  autoTable(doc, {
    startY: 82,
    head: [["Description", "Policy No.", "Insurer", "Amount"]],
    body: [
      [
        data.productType,
        data.policyNumber,
        data.insurer,
        `${data.currency} ${data.amount.toLocaleString("en-MU", { minimumFractionDigits: 2 })}`,
      ],
    ],
    headStyles: { fillColor: [15, 52, 96], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    styles: { fontSize: 10 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total Paid: ${data.currency} ${data.amount.toLocaleString("en-MU", { minimumFractionDigits: 2 })}`, 196, finalY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Payment via: ${data.gateway.replace("_", " ").toUpperCase()}`, 14, finalY + 14);
  doc.text("This receipt is computer-generated and valid without a signature.", 14, finalY + 22);

  addFooter(doc);

  doc.save(`receipt_${data.receiptNumber}.pdf`);
}

export async function generatePolicyCertificate(data: PolicyData): Promise<void> {
  const doc = new jsPDF();
  const logo = await loadBrandLogoDataUrl();

  addHeader(doc, "POLICY CERTIFICATE", logo);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Policy Number:", 14, 42);
  doc.setFont("helvetica", "normal");
  doc.text(data.policyNumber, 60, 42);

  doc.setFont("helvetica", "bold");
  doc.text("Product:", 130, 42);
  doc.setFont("helvetica", "normal");
  doc.text(data.productType, 155, 42);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 48, 196, 48);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Policyholder Details", 14, 58);

  autoTable(doc, {
    startY: 64,
    body: [
      ["Name", data.clientName],
      ["Email", data.clientEmail],
      ["Phone", data.clientPhone],
      ["Insurer", data.insurer],
      ["Start Date", new Date(data.startDate).toLocaleDateString("en-MU")],
      ["End Date", new Date(data.endDate).toLocaleDateString("en-MU")],
      ["Annual Premium", `MUR ${data.premium.toLocaleString("en-MU", { minimumFractionDigits: 2 })}`],
    ],
    headStyles: { fillColor: [15, 52, 96] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
  });

  const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  if (data.coverageDetails.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Coverage Details", 14, tableEnd);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    data.coverageDetails.forEach((detail, i) => {
      doc.text(`• ${detail}`, 18, tableEnd + 10 + i * 8);
    });
  }

  addFooter(doc);

  doc.save(`policy_certificate_${data.policyNumber}.pdf`);
}

export interface QuoteEstimatePdfData {
  policyType: string;
  coverageAmount: number;
  currency: string;
  monthlyPremium: number;
  clientEmail?: string;
  clientPhone?: string;
}

export async function generateQuoteEstimatePdf(data: QuoteEstimatePdfData): Promise<void> {
  const doc = new jsPDF();
  const logo = await loadBrandLogoDataUrl();
  addHeader(doc, "INDICATIVE QUOTE", logo);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString("en-MU")}`, 14, 40);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 44, 196, 44);

  autoTable(doc, {
    startY: 52,
    body: [
      ["Product", data.policyType],
      ["Coverage sum", `${data.currency} ${data.coverageAmount.toLocaleString()}`],
      ["Estimated monthly premium", `${data.currency} ${data.monthlyPremium.toLocaleString()}`],
      ...(data.clientEmail ? [["Contact email", data.clientEmail]] : []),
      ...(data.clientPhone ? [["Contact phone", data.clientPhone]] : []),
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
  });

  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This is an indicative estimate only. Final premium depends on underwriting, claims history, and insurer acceptance.",
    14,
    y,
    { maxWidth: 180 },
  );

  addFooter(doc);
  doc.save(`quote_estimate_${data.policyType}_${Date.now()}.pdf`);
}
