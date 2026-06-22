import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { CurrencyProvider } from "../context/CurrencyContext";

vi.mock("../lib/db", () => ({
  db: {
    payments: () => ({
      select: () => ({
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      }),
    }),
    profiles: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
  },
}));

vi.mock("../lib/auditService", () => ({ logAudit: vi.fn() }));
vi.mock("../hooks/usePageMeta", () => ({ usePageMeta: vi.fn() }));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { role: "broker", full_name: "Test Broker" },
    session: { user: { id: "user-1" } },
    demoAuthActive: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { PaymentsPage } from "../pages/PaymentsPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <CurrencyProvider>
          <PaymentsPage />
        </CurrencyProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("PaymentsPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("renders the page heading", async () => {
    await act(async () => { renderPage(); });
    expect(screen.getByRole("heading", { name: /payments/i })).toBeInTheDocument();
  });

  it("shows the New Payment Link button for broker role", async () => {
    await act(async () => { renderPage(); });
    expect(screen.getByRole("button", { name: /new payment link/i })).toBeInTheDocument();
  });

  it("shows the form when New Payment Link is clicked", async () => {
    await act(async () => { renderPage(); });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /new payment link/i }));
    });
    expect(screen.getByRole("button", { name: /create payment link/i })).toBeInTheDocument();
  });

  it("shows Export button", async () => {
    await act(async () => { renderPage(); });
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });
});
