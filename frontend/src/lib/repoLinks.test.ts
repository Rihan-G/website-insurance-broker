import { describe, expect, it } from "vitest";
import { ensureGithubHttpUrl } from "./repoLinks";

describe("ensureGithubHttpUrl", () => {
  it("preserves https URLs", () => {
    expect(ensureGithubHttpUrl("https://github.com/a/b")).toBe("https://github.com/a/b");
  });

  it("adds https when scheme omitted", () => {
    expect(ensureGithubHttpUrl("github.com/foo/bar")).toBe("https://github.com/foo/bar");
  });

  it("trims whitespace", () => {
    expect(ensureGithubHttpUrl("  https://x.y/z  ")).toBe("https://x.y/z");
  });
});
