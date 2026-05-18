/** Read first `n` bytes — small files read fully; large files use stream when available. */
async function readFilePrefix(file: File, n: number): Promise<Uint8Array> {
  const want = Math.min(n, file.size);
  if (want === 0) return new Uint8Array(0);

  if (file.size <= 65536) {
    const ab =
      typeof file.arrayBuffer === "function"
        ? await file.arrayBuffer()
        : await new Response(file).arrayBuffer();
    return new Uint8Array(ab.slice(0, want));
  }

  if (typeof file.stream === "function") {
    const out = new Uint8Array(want);
    const reader = file.stream().getReader();
    let offset = 0;
    try {
      while (offset < want) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value?.length) continue;
        const take = Math.min(value.length, want - offset);
        out.set(value.subarray(0, take), offset);
        offset += take;
      }
    } finally {
      reader.releaseLock();
    }
    return out;
  }

  const slice = file.slice(0, want);
  const ab =
    typeof (slice as Blob).arrayBuffer === "function"
      ? await (slice as Blob).arrayBuffer()
      : await new Response(slice).arrayBuffer();
  return new Uint8Array(ab);
}

/** First bytes must match declared type (complements MIME from the browser). */
export async function validateFileMagicBytes(file: File): Promise<string | null> {
  const n = Math.min(16, file.size);
  if (n < 4) return `${file.name}: File is too small to validate.`;
  const buf = await readFilePrefix(file, n);
  const mime = file.type || "";

  const b0 = buf[0] ?? 0;
  const b1 = buf[1] ?? 0;
  const b2 = buf[2] ?? 0;
  const b3 = buf[3] ?? 0;

  const isPdf = b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46;
  const isJpeg = b0 === 0xff && b1 === 0xd8 && b2 === 0xff;
  const isPng = b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47;
  const isTiff =
    (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0) ||
    (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0 && buf[3] === 0x2a);

  const mimeOk = (m: string) => mime.includes(m) || mime === "" || mime.includes("octet-stream");

  if (isPdf && (mimeOk("pdf") || mime === "")) return null;
  if (isJpeg && (mimeOk("jpeg") || mimeOk("jpg") || mime === "")) return null;
  if (isPng && (mimeOk("png") || mime === "")) return null;
  if (isTiff && (mimeOk("tiff") || mimeOk("tif") || mime === "")) return null;

  if (mime.includes("pdf") && !isPdf) return `${file.name}: Content is not a PDF (header mismatch).`;
  if ((mime.includes("jpeg") || mime.includes("jpg")) && !isJpeg) return `${file.name}: Content is not a JPEG (header mismatch).`;
  if (mime.includes("png") && !isPng) return `${file.name}: Content is not a PNG (header mismatch).`;
  if ((mime.includes("tiff") || mime.includes("tif")) && !isTiff) return `${file.name}: Content is not a TIFF (header mismatch).`;

  if (!isPdf && !isJpeg && !isPng && !isTiff) {
    return `${file.name}: Unrecognised file signature. Use PDF, JPEG, PNG, or TIFF.`;
  }

  return `${file.name}: File type does not match its contents.`;
}
