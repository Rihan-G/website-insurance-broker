import { useState } from "react";
import { Search, Filter, Download, Eye, FileText, ChevronDown } from "lucide-react";

interface DocumentRow {
  id: string;
  fileName: string;
  client: string;
  type: string;
  status: "uploaded" | "processing" | "reviewed" | "approved" | "rejected";
  uploadedAt: string;
  size: string;
  confidence: number | null;
}

const mockDocuments: DocumentRow[] = [
  { id: "1", fileName: "motor_policy_2025.pdf", client: "Marie Dupont", type: "Motor Insurance", status: "approved", uploadedAt: "2025-01-15", size: "2.4 MB", confidence: 98 },
  { id: "2", fileName: "home_valuation.pdf", client: "Jean-Pierre Ramgoolam", type: "Home Insurance", status: "processing", uploadedAt: "2025-01-15", size: "5.1 MB", confidence: 87 },
  { id: "3", fileName: "life_application.pdf", client: "Priya Devi", type: "Life Insurance", status: "reviewed", uploadedAt: "2025-01-14", size: "1.8 MB", confidence: 94 },
  { id: "4", fileName: "health_claim_form.pdf", client: "Ahmed Boolell", type: "Health Insurance", status: "uploaded", uploadedAt: "2025-01-14", size: "3.2 MB", confidence: null },
  { id: "5", fileName: "travel_docs.pdf", client: "Sophie Chen", type: "Travel Insurance", status: "rejected", uploadedAt: "2025-01-13", size: "892 KB", confidence: 42 },
  { id: "6", fileName: "renewal_notice.pdf", client: "Ravi Patel", type: "Motor Insurance", status: "approved", uploadedAt: "2025-01-13", size: "1.1 MB", confidence: 96 },
];

const statusStyles: Record<string, string> = {
  uploaded: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-500">Manage client documents and OCR results</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-6 py-3 font-medium text-gray-500">Document</th>
                <th className="px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="px-6 py-3 font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 font-medium text-gray-500">OCR Score</th>
                <th className="px-6 py-3 font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{doc.client}</td>
                  <td className="px-6 py-4 text-gray-700">{doc.type}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.confidence !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${
                              doc.confidence >= 80 ? "bg-green-500" : doc.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${doc.confidence}%` }}
                          />
                        </div>
                        <span className="text-gray-500">{doc.confidence}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{doc.uploadedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No documents found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
