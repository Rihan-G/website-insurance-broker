import { describe, it, expect } from "vitest";
import { validateFileMagicBytes } from "../lib/uploadMagic";

function fileFromBytes(bytes: number[], name: string, mime: string): File {
  const u8 = Uint8Array.from(bytes);
  return new File([u8], name, { type: mime });
}

describe("validateFileMagicBytes", () => {
  it("rejects PDF MIME when header bytes do not match", async () => {
    const buf = [0, 1, 2, 3];
    const f = fileFromBytes(buf, "x.pdf", "application/pdf");
    expect(await validateFileMagicBytes(f)).toContain("PDF");
  });
});
