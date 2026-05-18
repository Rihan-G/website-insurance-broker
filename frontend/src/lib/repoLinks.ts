/** Normalize user-entered repo or compare URLs (add https:// when missing). Exported for unit tests. */
export function ensureGithubHttpUrl(url: string): string {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u.replace(/^\/+/, "")}`;
}

/** Default source repo for in-app “open on GitHub” links (override with VITE_GITHUB_REPO_URL). */
const DEFAULT_GITHUB_REPO = "https://github.com/Rihan-G/website-insurance-broker";

function readTrimmedEnv(name: "VITE_GITHUB_REPO_URL" | "VITE_GITHUB_PR_COMPARE"): string | undefined {
  const raw = import.meta.env[name];
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

/** Public repo root, always a valid https URL. */
export function githubRepoHomeUrl(): string {
  const o = readTrimmedEnv("VITE_GITHUB_REPO_URL");
  return o ? ensureGithubHttpUrl(o) : DEFAULT_GITHUB_REPO;
}

/** Pull request list for the configured repo. */
export function githubRepoPullsUrl(): string {
  return `${githubRepoHomeUrl().replace(/\/$/, "")}/pulls`;
}

/**
 * Compare / PR link: uses VITE_GITHUB_PR_COMPARE when set to a non-empty string.
 * Otherwise opens a same-repo compare view (main vs main) so GitHub always receives a full compare path.
 */
export function githubCompareOrPrUrl(): string {
  const custom = readTrimmedEnv("VITE_GITHUB_PR_COMPARE");
  if (custom) return ensureGithubHttpUrl(custom);
  const base = githubRepoHomeUrl().replace(/\/$/, "");
  return `${base}/compare/main...main`;
}

/** True when VITE_GITHUB_PR_COMPARE is a non-empty string (after trim). */
export function githubPrCompareConfigured(): boolean {
  return readTrimmedEnv("VITE_GITHUB_PR_COMPARE") !== undefined;
}