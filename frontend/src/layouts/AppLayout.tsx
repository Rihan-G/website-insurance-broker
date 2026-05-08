import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Documents", to: "/documents", icon: FileText },
  { name: "Upload", to: "/upload", icon: Upload },
  { name: "Clients", to: "/clients", icon: Users },
  { name: "Settings", to: "/settings", icon: Settings },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-primary-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary-900 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6 border-b border-primary-800">
          <ShieldCheck className="h-7 w-7 text-accent-500" />
          <span className="text-lg font-semibold tracking-tight">SecureBroker</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-700/60 text-white"
                    : "text-primary-200 hover:bg-primary-800/60 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-primary-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold">
              {profile?.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-primary-300 capitalize">{profile?.role || "client"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-primary-200 hover:bg-primary-800/60 hover:text-white cursor-pointer transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted cursor-pointer lg:hidden transition-colors duration-200"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-lg font-semibold text-surface-foreground">
            Insurance Broker Portal
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-600">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Protected
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
