# Cloudflare Pages + Supabase (free tier)

Host the **static React app** on Cloudflare Pages ($0) and keep **Supabase** as the backend (Auth, Postgres, Storage). This complements the existing [GitHub Pages demo](./GITHUB_PAGES.md)—you can run both until Cloudflare is verified.

**Time:** ~45–90 minutes once you have approval to go live.

---

## Architecture

```text
User browser
    → Cloudflare Pages (HTTPS, CDN) — serves frontend/dist
    → Supabase (Auth, DB, Storage, Edge Functions)
```

Cloudflare does **not** replace Supabase. It only replaces static hosting (instead of GitHub Pages or Vercel).

---

## Part 1 — Supabase (do this first)

### 1.1 Create or open a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. **New project** (free tier) or open an existing one.
3. Save the **database password** somewhere safe.

Free tier note: inactive projects can **pause** after ~7 days. Wake the project from the dashboard before testing.

### 1.2 Apply database migrations

**Option A — Supabase CLI (recommended if installed)**

```bash
cd c:\website-insurance-broker
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

**Option B — SQL Editor (no CLI)**

1. Dashboard → **SQL Editor**.
2. Run each file in `supabase/migrations/` **in numeric order** (`00001` … through latest, e.g. `00010`).
3. Wait for success on each before running the next.

### 1.3 Get API keys

Dashboard → **Project Settings** → **API**:

| Copy this | Use as |
|-----------|--------|
| Project URL | `VITE_SUPABASE_URL` |
| Publishable key (`sb_publishable_…`) | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| *(or legacy anon JWT)* | `VITE_SUPABASE_ANON_KEY` |

Never commit keys to git. Use `.env` locally and Cloudflare env vars in production.

### 1.4 Local test (optional but recommended)

```bash
cd c:\website-insurance-broker
copy frontend\.env.example frontend\.env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_ALLOW_DEMO_LOGIN=false
```

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`, sign up or create test users (admin / broker / client). Fix RLS errors before deploying—see [PHASES.md](../PHASES.md) Phase 1.

---

## Part 2 — Cloudflare account and Pages project

### 2.1 Sign up

1. [dash.cloudflare.com](https://dash.cloudflare.com) → sign up (free).
2. Left sidebar → **Workers & Pages**.

### 2.2 Connect GitHub

1. **Create** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare on GitHub.
3. Select repository: **`website-insurance-broker`** (or your fork name).

### 2.3 Build configuration

On the setup screen (or **Settings → Builds & deployments**):

| Setting | Value |
|---------|--------|
| **Production branch** | `main` |
| **Framework preset** | None (or Vite if listed) |
| **Build command** | `npm run build:cloudflare` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | `/` (repository root) |

### 2.4 Node version

**Settings → Environment variables** → **Production** (and **Preview** if you use PR previews):

| Name | Value |
|------|--------|
| `NODE_VERSION` | `20` |

### 2.5 Production environment variables

Same place — **Production** variables:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR_REF.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your publishable key |
| `VITE_ALLOW_DEMO_LOGIN` | `false` |
| `VITE_OPENROUTER_API_KEY` | optional AI key for voice/assistant testing (`sk-or-...`) |

Use `VITE_SUPABASE_ANON_KEY` instead of publishable if that is what your project provides.

**Do not set** `VITE_GH_PAGES_BASE` on Cloudflare. That variable is only for GitHub Pages subpaths. Cloudflare serves the app at `/` (site root).

### 2.6 SPA routing

This repo includes `frontend/public/_redirects`:

```text
/*    /index.html   200
```

Vite copies it into `dist/` on build so routes like `/dashboard` work on refresh. Commit and push before the first Cloudflare deploy if it is not on `main` yet.

### 2.7 Deploy

1. **Save and Deploy** (or push to `main` to trigger a build).
2. Wait for the build log to finish green.
3. Note your URL, e.g. `https://website-insurance-broker.pages.dev`.

**Build fails?** Common fixes:

- Ensure `pnpm-lock.yaml` is committed.
- Set `NODE_VERSION=20`.
- Confirm output path is `frontend/dist`, not `dist`.

---

## Part 3 — Wire Supabase Auth to Cloudflare

1. Supabase Dashboard → **Authentication** → **URL configuration**.
2. Set **Site URL** to your Cloudflare URL, e.g.  
   `https://website-insurance-broker.pages.dev`
3. Under **Redirect URLs**, add:
   - `https://website-insurance-broker.pages.dev/**`
   - (Optional) keep GitHub Pages demo URL if you still use it.

4. **Save**.

Without this step, login redirects and email links will fail on the Cloudflare host.

---

## Part 4 — Smoke test checklist

Open your `*.pages.dev` URL and verify:

- [ ] `/` — homepage loads, assets not 404
- [ ] `/login` — login page loads
- [ ] Sign in with a **real** Supabase user (not demo if `VITE_ALLOW_DEMO_LOGIN=false`)
- [ ] `/dashboard` — loads after login
- [ ] **Refresh** on `/dashboard/clients` (or any deep link) — no 404
- [ ] Browser console — no Supabase auth errors
- [ ] (Optional) upload a document if migration `00004` is applied

---

## Part 5 — Custom domain (later, optional)

When you have a domain (e.g. `www.sindicombrokers.com`):

1. Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**.
2. Follow DNS instructions (CNAME to `*.pages.dev` or use Cloudflare as DNS registrar).
3. SSL is automatic on Cloudflare.
4. Update Supabase **Site URL** and **Redirect URLs** to `https://www.yourdomain.com/**`.
5. Redeploy is usually **not** required for domain-only changes.

Custom domain on Cloudflare Pages is still **free** on the Pages free plan; you only pay the registrar for the domain name.

---

## Part 6 — GitHub Pages vs Cloudflare (both free)

| Host | URL shape | When to use |
|------|-----------|-------------|
| **GitHub Pages** | `https://user.github.io/website-insurance-broker/` | Portfolio demo; uses `VITE_GH_PAGES_BASE` in CI |
| **Cloudflare Pages** | `https://project.pages.dev/` | Production-style host at `/`; real Supabase |

You can disable GitHub Pages later or keep it as a demo mirror.

---

## Free-tier limits (planning)

| Service | Limit / gotcha |
|---------|----------------|
| **Supabase free** | Pauses when inactive; DB size & egress caps |
| **Cloudflare Pages free** | Monthly build minutes; bandwidth usually fine for MVP |
| **Email** | Supabase auth emails only unless you add Resend etc. |

See also [FREE_TIER_STACK.md](./FREE_TIER_STACK.md).

---

## Quick reference — env vars

| Variable | Local (`.env`) | Cloudflare Pages | GitHub Pages CI |
|----------|----------------|------------------|-----------------|
| `VITE_SUPABASE_URL` | Yes | Yes | Repo secret |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Yes | Repo secret |
| `VITE_ALLOW_DEMO_LOGIN` | `false` prod | `false` prod | often `true` for demo |
| `VITE_GH_PAGES_BASE` | omit | **omit** | set by workflow |

---

## Related docs

- [PHASES.md](../PHASES.md) — database & product rollout order
- [GITHUB_PAGES.md](./GITHUB_PAGES.md) — existing demo deploy
- [FREE_TIER_STACK.md](./FREE_TIER_STACK.md) — stack overview
- [frontend/.env.example](../frontend/.env.example) — all env vars
