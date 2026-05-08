import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { CurrencyProvider } from "../context/CurrencyContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    isAdmin: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import App from "../App";

function renderWithProviders(ui: React.ReactElement, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CurrencyProvider>{ui}</CurrencyProvider>
    </MemoryRouter>
  );
}

describe("App", () => {
  it("renders public home page at /", () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Your Trusted Insurance/)).toBeInTheDocument();
    expect(screen.getAllByText(/Get a Quote/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders login page at /login", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByText("Secure Sign In")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
  });

  it("shows sign up form when toggled", async () => {
    renderWithProviders(<App />, { route: "/login" });
    const createOneLink = screen.getByText("Create one");
    await act(async () => {
      createOneLink.click();
    });
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });
});
