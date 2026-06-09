import { useCallback, useEffect, useState } from "react";
import {
  HERO_BG_STORAGE_KEY,
  type HeroBgPreset,
  readHeroBgFromUrl,
  readStoredHeroBg,
} from "./homeHeroBackgrounds";

export function useHomeHeroBackground() {
  const [preset, setPresetState] = useState<HeroBgPreset>(() => readHeroBgFromUrl() ?? readStoredHeroBg());

  useEffect(() => {
    const fromUrl = readHeroBgFromUrl();
    if (fromUrl) setPresetState(fromUrl);
  }, []);

  const setPreset = useCallback((next: HeroBgPreset) => {
    setPresetState(next);
    try {
      localStorage.setItem(HERO_BG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { preset, setPreset };
}
