export const HERO_BG_STORAGE_KEY = "sb_home_hero_bg";

export const heroBackgroundPresets = [
  { id: "tide", label: "Tide", desc: "Slow horizontal colour flow" },
  { id: "mesh", label: "Mesh", desc: "Gentle shifting gradient mesh" },
  { id: "aurora", label: "Aurora", desc: "Soft drifting light orbs" },
  { id: "dawn", label: "Dawn", desc: "Breathing sky and sea glow" },
  { id: "current", label: "Current", desc: "Diagonal light bands" },
] as const;

export type HeroBgPreset = (typeof heroBackgroundPresets)[number]["id"];

const presetIds = new Set<string>(heroBackgroundPresets.map((p) => p.id));

export function isHeroBgPreset(value: string | null | undefined): value is HeroBgPreset {
  return Boolean(value && presetIds.has(value));
}

export function readHeroBgFromUrl(): HeroBgPreset | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("heroBg");
  return isHeroBgPreset(raw) ? raw : null;
}

export function readStoredHeroBg(): HeroBgPreset {
  try {
    const raw = localStorage.getItem(HERO_BG_STORAGE_KEY);
    if (isHeroBgPreset(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "tide";
}
