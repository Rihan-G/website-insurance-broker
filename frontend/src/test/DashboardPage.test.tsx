import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CurrencyProvider } from "../context/CurrencyContext";
import { DashboardPage } from "../pages/DashboardPage";

function renderWithCurrency(ui: React.ReactElement) {
  return render(<CurrencyProvider>{ui}</CurrencyProvider>);
}

describe("DashboardPage", () => {
  it("renders dashboard heading", () => {
    renderWithCurrency(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("displays stat cards", () => {
    renderWithCurrency(<DashboardPage />);
    expect(screen.getByText("Total Clients")).toBeInTheDocument();
    expect(screen.getByText("Active Policies")).toBeInTheDocument();
    expect(screen.getByText("Pending Documents")).toBeInTheDocument();
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
  });

  it("shows document pipeline items", () => {
    renderWithCurrency(<DashboardPage />);
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
    expect(screen.getByText("Jean-Pierre Ramgoolam")).toBeInTheDocument();
    expect(screen.getByText("Document Pipeline")).toBeInTheDocument();
  });

  it("shows revenue trend section", () => {
    renderWithCurrency(<DashboardPage />);
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    expect(screen.getByText("+12.5% Growth")).toBeInTheDocument();
  });
});
