import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { CurrencyProvider } from "../context/CurrencyContext";
import { DashboardPage } from "../pages/DashboardPage";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "demo-user-id" },
    profile: null,
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
