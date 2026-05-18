import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "./formatRelativeTime";

describe("formatRelativeTime", () => {
  it("returns a non-empty string for valid ISO timestamps", () => {
    const now = new Date("2026-05-18T12:00:00.000Z");
    const past = "2026-05-18T11:00:00.000Z";
    const s = formatRelativeTime(past, now);
    expect(s.length).toBeGreaterThan(0);
    expect(s).toMatch(/ago|in /);
  });

  it("returns empty string for invalid input", () => {
    expect(formatRelativeTime("not-a-date")).toBe("");
  });
});
