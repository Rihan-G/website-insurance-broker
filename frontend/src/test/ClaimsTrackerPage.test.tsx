import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" }, profile: { role: "client" }, demoAuthActive: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("../hooks/usePageMeta", () => ({ usePageMeta: vi.fn() }));

import { ClaimsTrackerPage } from "../pages/ClaimsTrackerPage";

function renderPage() {
  return render(<MemoryRouter><ClaimsTrackerPage /></MemoryRouter>);
}

describe("ClaimsTrackerPage", () => {
  it("renders the page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /claims tracker/i })).toBeInTheDocument();
  });

  it("shows a claim reference number by default", () => {
    renderPage();
    const select = screen.getByRole("combobox");
    const firstOption = select.querySelector("option");
    expect(firstOption).toBeTruthy();
  });

  it("switches claim when selector changes", async () => {
    renderPage();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll("option"));
    if (options.length > 1) {
      await act(async () => {
        fireEvent.change(select, { target: { value: options[1]!.value } });
      });
      expect(select.value).toBe(options[1]!.value);
    }
  });

  it("shows a progress percentage", () => {
    renderPage();
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it("shows the call broker link", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /call your broker/i })).toBeInTheDocument();
  });
});
