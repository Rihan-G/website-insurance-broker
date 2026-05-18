import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { CurrencyProvider } from "../context/CurrencyContext";
import { DashboardPage } from "../pages/DashboardPage";
import type { Profile } from "../types";

/** Demo session with staff-shaped metrics (pipeline names, stat labels). */
const demoBrokerProfile: Profile = {
  id: "demo-user-id",
  email: "broker@demo.local",
  full_name: "Demo Broker",
  role: "broker",
  phone: null,
  totp_secret: null,
  totp_enabled: false,
  last_login_at: null,
  avatar_url: null,
  bio: null,
  commission_rate: null,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "demo-user-id" },
    profile: demoBrokerProfile,
    session: null,
    loading: false,
    demoAuthActive: true,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    isAdmin: false,
    demoAuthAvailable: true,
  }),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <CurrencyProvider>
        <DashboardPage />
      </CurrencyProvider>
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  it("renders dashboard heading", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays stat cards", () => {
    renderDashboard();
    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByText("Active Policies")).toBeInTheDocument();
    expect(screen.getByText("Pending Documents")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("shows document pipeline items", () => {
    renderDashboard();
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean-Pierre Ramgoolam")).toBeInTheDocument();
    expect(screen.getByText("Document Pipeline")).toBeInTheDocument();
  });

  it("shows revenue trend section", () => {
    renderDashboard();
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    expect(screen.getByText("+12.5% Growth")).toBeInTheDocument();
  });

  it("shows care snapshot region with demo counts", () => {
    renderDashboard();
    const region = screen.getByRole("region", { name: /care snapshot/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent("Unread");
    expect(region).toHaveTextContent("Open tasks");
    expect(region).toHaveTextContent("Claims queue");
  });
});
