import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("DashboardPage", () => {
  it("renders dashboard heading", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays stat cards", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByText("Active Policies")).toBeInTheDocument();
    expect(screen.getByText("Pending Documents")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("shows document pipeline items", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean-Pierre Ramgoolam")).toBeInTheDocument();
    expect(screen.getByText("Document Pipeline")).toBeInTheDocument();
  });

  it("shows revenue trend section", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    expect(screen.getByText("+12.5% Growth")).toBeInTheDocument();
  });
});
