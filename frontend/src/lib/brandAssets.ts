/** Public brand files under `frontend/public/brand/` (respects Vite base for GitHub Pages). */
export function brandAssetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalized = relativePath.replace(/^\//, "");
  return `${base}${normalized}`;
}

export const BRAND_LOGO_SVG = brandAssetUrl("brand/logo.svg");
export const BRAND_LOGO_PNG = brandAssetUrl("brand/logo.png");
export const BRAND_FAVICON = brandAssetUrl("brand/favicon.svg");
