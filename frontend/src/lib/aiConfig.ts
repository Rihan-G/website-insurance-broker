/** Treat empty, obvious placeholders, and tutorial strings as “not configured”. */
function isConfiguredKey(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  if (/^placeholder$/i.test(v)) return false;
  if (v.includes("your_") || v.includes("changeme")) return false;
  return true;
}

/**
 * True when at least one Vite env key is set for AI-backed features (voice transcription, future assistants).
 * Add `VITE_GEMINI_API_KEY` (or another supported key) in `frontend/.env` for production builds.
 */
export function hasAiApiKeys(): boolean {
  return [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_AI_API_KEY,
    import.meta.env.VITE_OPENAI_API_KEY,
  ].some((k) => isConfiguredKey(k as string | undefined));
}
