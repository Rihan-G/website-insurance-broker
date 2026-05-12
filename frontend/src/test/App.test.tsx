import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { ThemeProvider } from "../context/ThemeContext";
import { CurrencyProvider } from "../context/CurrencyContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    session: null,
    loading: false,
    demoAuthActive: false,
    signIn: vi.fn().mockResolvedValue({ error: null, profile: null }),
    signUp: vi.fn(),
    signOut: vi.fn(),
    isAdmin: false,
    demoAuthAvailable: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import App from "../App";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("renders public home page at /", () => {
    renderApp("/");
    expect(screen.getByRole("navigation")).toHaveTextContent("Sindicom");
    expect(screen.getAllByText(/Licensed Insurance Broker/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Get a Quote/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders login page at /login", () => {
    renderApp("/login");
    expect(screen.getByText("Secure Sign In")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
  });

  it("shows sign up form when toggled", async () => {
    renderApp("/login");
    const createOneLink = screen.getByText("Create one");
    await act(async () => {
      createOneLink.click();
    });
    expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jean Dupont")).toBeInTheDocument();
  });

  it("renders admin login at /admin/login", () => {
    renderApp("/admin/login");
    expect(screen.getByText(/Administrator access/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in as administrator/ })).toBeInTheDocument();
  });

  it("renders a helpful 404 for unknown public URLs", () => {
    renderApp("/this-route-does-not-exist");
    expect(screen.getByRole("heading", { name: /could not find that page/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});
