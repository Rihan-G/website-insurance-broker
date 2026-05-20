# GitHub Pages — deploy and troubleshooting

The workflow **Deploy GitHub Pages** (`.github/workflows/deploy-github-pages.yml`) runs on every push to **`main`**.

---

## Correct URL

For a **project** repository named `website-insurance-broker`, the app is served at:

`https://<github-username-lowercase>.github.io/website-insurance-broker/`

Opening only `https://<user>.github.io/` shows the **user/org site** (different repo), not this app.

---

## Common errors

### 1. Blank page or “Failed to fetch dynamically imported module”

**Cause:** Vite **`base`** path does not match the path GitHub serves (including **letter case** on the first URL segment).

**Fix:** The workflow sets `VITE_GH_PAGES_BASE` from the repository name using a **lowercased** slug so it matches GitHub’s usual URLs. If you renamed the repo, redeploy after the next push to `main`.

Local check (replace with your repo slug):

```bash
cd frontend && VITE_GH_PAGES_BASE=/website-insurance-broker/ VITE_ALLOW_DEMO_LOGIN=true pnpm build && pnpm preview
```

Preview at the URL Vite prints; confirm assets load under `/website-insurance-broker/assets/…`.

### 2. Build fails in Actions (TypeScript / ESLint)

**Cause:** `pnpm build` runs **`tsc -b`** then **`vite build`**. Any TS error fails the Pages build.

**Fix:** Run `pnpm lint` locally before merging to `main`. Recent example: duplicate imports or missing interfaces in a page component will break CI.

### 3. 404 when refreshing a deep link (e.g. `/dashboard/quotes`)

**Cause:** GitHub Pages looks for a real file at that path.

**Fix:** The workflow copies **`index.html` → `404.html`** and adds **`.nojekyll`** so the SPA shell loads. If you deploy without that step, refresh on nested routes will 404. Re-run the workflow from `main`.

### 4. Demo login missing on the live site

**Cause:** `VITE_ALLOW_DEMO_LOGIN` was unset in CI, so the build did not enable demo mode.

**Fix:** The workflow defaults demo login to **`true`** for the Pages build unless you set the **`VITE_ALLOW_DEMO_LOGIN`** repository secret to `false`. Override only when you intentionally want demo accounts disabled on Pages.

### 5. Real Supabase auth redirects to the wrong origin

**Cause:** Supabase **Site URL** and **Redirect URLs** do not include your GitHub Pages URL.

**Fix:** In Supabase → Authentication → URL configuration, add:

`https://<user>.github.io/website-insurance-broker/`

(and `http://localhost:5173` for local dev if needed).

### 6. “Environment approval” / workflow stuck

**Cause:** GitHub Pages environment protection.

**Fix:** In the Actions run, approve deployment to **`github-pages`** when GitHub prompts.

---

## Related

- Root **[README.md](../README.md)** — one-time Pages setup in the GitHub UI.  
- **[PHASES.md](../PHASES.md)** — Supabase migration order.  
- Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` (optional for demo-only Pages).
