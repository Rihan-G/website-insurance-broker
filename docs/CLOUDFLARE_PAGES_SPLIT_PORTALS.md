# Cloudflare Pages — split client vs. staff portals

This is a companion to [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) for running **two**
deployments of this app from the **same repo and the same Supabase project**:

- a **client portal** (`VITE_PORTAL_FLAVOR=client`) for policyholders, and
- a **staff/ops portal** (`VITE_PORTAL_FLAVOR=staff`) for brokers/admins.

Each portal is its own Cloudflare Pages project (its own origin), so each keeps its own
Supabase session in `localStorage` — a user can be signed in to both at once on the same
machine. Cross-portal links (e.g. a client clicking a staff-only page, or vice versa)
do a full-page redirect to the *other* portal's URL.

**Time:** ~30–45 minutes once the shared Supabase project from
[CLOUDFLARE_PAGES.md Part 1](./CLOUDFLARE_PAGES.md#part-1--supabase-do-this-first) is set up.

---

## How the split works in this codebase

No app code changes are needed — this is all driven by env vars and existing logic:

- `frontend/src/lib/portalFlavor.ts` — reads `VITE_PORTAL_FLAVOR` (`client` | `staff` |
  `unified`) and the cross-portal base URLs (`VITE_STAFF_PORTAL_URL`,
  `VITE_CLIENT_PORTAL_URL`).
- `frontend/src/lib/supabase.ts` — gives each non-unified flavor its own Supabase
  `auth.storageKey` (`sb-securebroker-auth-client` / `-staff`), so the two origins never
  share a session.
- `frontend/src/components/DashboardAccessSentinel.tsx` +
  `frontend/src/lib/staffDashboardRoutes.ts` — if a signed-in user on the client portal
  opens a staff-only segment (e.g. `/dashboard/clients`), they're redirected to
  `VITE_STAFF_PORTAL_URL` + that path (via `CrossPortalNavigate`), and vice versa for
  `/dashboard/my-policies` on the staff portal.
- `frontend/src/layouts/AppLayout.tsx` — filters the sidebar nav per portal flavor and
  per `profile.role`.
- `frontend/package.json` — `build:portal-client` / `build:portal-staff` (Vite modes
  that force `VITE_PORTAL_FLAVOR`).
- Root `package.json` — `deploy:cloudflare-client` / `deploy:cloudflare-staff` for CLI
  deploys via `wrangler pages deploy` (project names below are examples; rename as you
  like, just keep them consistent with what you create in the dashboard).

---

## Part 1 — Prerequisites

Complete [CLOUDFLARE_PAGES.md Part 1](./CLOUDFLARE_PAGES.md#part-1--supabase-do-this-first)
first: one shared Supabase project (migrations applied, API keys to hand). Both portals
point at the **same** Supabase project.

---

## Part 2 — Create two Cloudflare Pages projects

Repeat **Connect to Git** twice for the **same repository**, once per portal. Cloudflare
Pages allows multiple projects from one repo, each with its own build command and env
vars.

### Project A — Client portal

Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select
this repo.

| Setting | Value |
|---------|--------|
| Project name | `website-insurance-broker-client` (example — note the `.pages.dev` URL it produces) |
| Production branch | `main` |
| Framework preset | None (or Vite if listed) |
| Build command | `npm run build:portal-client` |
| Build output directory | `frontend/dist` |
| Root directory | `/` (repository root) |

**Environment variables** (Production, and Preview if used):

| Name | Value |
|------|--------|
| `NODE_VERSION` | `20` |
| `VITE_SUPABASE_URL` | `https://YOUR_REF.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your publishable key (or `VITE_SUPABASE_ANON_KEY`) |
| `VITE_ALLOW_DEMO_LOGIN` | `false` (or `true` for a demo) |
| `VITE_STAFF_PORTAL_URL` | placeholder for now, e.g. `https://website-insurance-broker-staff.pages.dev` |

Save and deploy. Note the resulting URL, e.g. `https://website-insurance-broker-client.pages.dev`.

### Project B — Staff/ops portal

Same repo, new Pages project:

| Setting | Value |
|---------|--------|
| Project name | `website-insurance-broker-staff` (example) |
| Production branch | `main` |
| Framework preset | None (or Vite if listed) |
| Build command | `npm run build:portal-staff` |
| Build output directory | `frontend/dist` |
| Root directory | `/` (repository root) |

**Environment variables** — same shared Supabase vars as Project A, plus:

| Name | Value |
|------|--------|
| `VITE_CLIENT_PORTAL_URL` | the Project A URL, e.g. `https://website-insurance-broker-client.pages.dev` |

Save and deploy. Note the resulting URL, e.g. `https://website-insurance-broker-staff.pages.dev`.

### Two-pass setup

`VITE_STAFF_PORTAL_URL` / `VITE_CLIENT_PORTAL_URL` reference each other's URL, which you
only know once both projects exist. After both first deploys succeed:

1. Go back to **Project A** → Settings → Environment variables → set
   `VITE_STAFF_PORTAL_URL` to Project B's real `.pages.dev` URL.
2. Go to **Project B** → Settings → Environment variables → set
   `VITE_CLIENT_PORTAL_URL` to Project A's real `.pages.dev` URL.
3. Redeploy both (Cloudflare Pages → **Retry deployment**, or push an empty commit).

**Do not set** `VITE_GH_PAGES_BASE` — that's GitHub Pages only.

---

## Part 3 — Wire Supabase Auth to both origins

Supabase Dashboard → **Authentication** → **URL configuration**:

- **Site URL**: pick one portal as primary (commonly the client portal).
- **Redirect URLs**: add **both**:
  - `https://website-insurance-broker-client.pages.dev/**`
  - `https://website-insurance-broker-staff.pages.dev/**`

Without both, login/email redirects from one portal can land on the wrong origin.

---

## Part 4 — Custom domains (later, optional)

Once you have domains, set them up the same way as
[CLOUDFLARE_PAGES.md Part 5](./CLOUDFLARE_PAGES.md#part-5--custom-domain-later-optional)
for each project, e.g.:

- Client portal → `https://portal.example.com`
- Staff portal → `https://ops.example.com`

Then update `VITE_STAFF_PORTAL_URL` / `VITE_CLIENT_PORTAL_URL` on both projects to the
new custom domains, redeploy, and update Supabase Redirect URLs to match.

---

## Part 5 — Smoke test checklist

- [ ] Sign in on the **client portal** with a `client` role account — `/dashboard`
      loads, sidebar shows client-only items (e.g. "My Policies"), no staff-only items
      (Clients, Tasks, Analytics, …).
- [ ] Sign in on the **staff portal** with an `admin`/`broker` account — sidebar shows
      staff items, no "My Policies".
- [ ] Both sessions are independent (different `auth.storageKey`s) — signing out of one
      portal does not sign you out of the other.
- [ ] On the **client portal**, manually visit a staff-only path, e.g.
      `/dashboard/clients` — you're redirected to the staff portal's URL for that path
      (`CrossPortalNavigate`).
- [ ] On the **staff portal**, visit `/dashboard/my-policies` — you're redirected to the
      client portal's URL for that path.
- [ ] Browser console — no Supabase auth errors on either origin.

---

## Related docs

- [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) — single unified deployment (the default).
- [frontend/.env.portal-client.example](../frontend/.env.portal-client.example) /
  [frontend/.env.portal-staff.example](../frontend/.env.portal-staff.example) — local env
  templates for `pnpm build:portal-client` / `pnpm build:portal-staff`.
- [frontend/.env.example](../frontend/.env.example) — all env vars.
- `AGENTS.md` — "Split client vs staff portals" note for local/dev context.
