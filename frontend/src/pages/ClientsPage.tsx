import { useState } from "react";
import { Search, UserPlus, Mail, Phone, FileText } from "lucide-react";

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
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockClients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-500">Manage your insurance clients</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          <UserPlus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((client) => (
          <div key={client.id} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
                  {client.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[client.status]}`}>
                    {client.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{client.phone}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{client.policies} policies</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{client.documents} docs</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border bg-white py-12 text-center text-gray-500 shadow-sm">
          No clients found matching &quot;{searchTerm}&quot;.
        </div>
      )}
    </div>
  );
}
