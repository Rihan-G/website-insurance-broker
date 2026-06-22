# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root via pnpm workspaces:

```bash
pnpm dev                   # Vite dev server on localhost:5173
pnpm build                 # tsc -b + Vite production build
pnpm lint                  # ESLint + tsc --noEmit
pnpm test                  # Vitest (run once)
pnpm preview               # Preview production build

# Portal-specific builds (require separate .env files)
pnpm build:portal-client
pnpm build:portal-staff

# Cloudflare Pages deploy
pnpm deploy:cloudflare
```

Run a single test file:
```bash
cd frontend && npx vitest run src/test/someFile.test.ts
```

Watch mode for tests:
```bash
pnpm --filter frontend test:watch
```

## Architecture

**Monorepo:** pnpm workspaces — `frontend/` and `supabase/functions/*`.

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4. Entry: `frontend/src/main.tsx`. All 50+ routes are lazy-loaded in `frontend/src/App.tsx`.

**Backend:** Supabase (PostgreSQL with RLS, Auth, Storage). SQL migrations in `supabase/migrations/`. Config in `supabase/config.toml` (local API: 54321, DB: 54322, Studio: 54323).

### Routing model

- `/` — shared marketing `HomePage` for all visitors (not role-specific)
- `/dashboard/*` — role-gated screens; clients, brokers, and admins see different UI controlled by `RoleGuard`
- Optional split origins for simultaneous sessions: `VITE_PORTAL_FLAVOR=client|staff` drives `frontend/src/lib/portalFlavor.ts`, with separate auth storage keys per flavor

### Authentication

- `frontend/src/context/AuthContext.tsx` wraps the app; use `useAuth()` hook throughout
- Demo mode (`VITE_ALLOW_DEMO_LOGIN=true`): `frontend/src/lib/demoAuth.ts` provides session-only login with no real Supabase required — used on GitHub Pages
- Real auth uses Supabase email/password; `frontend/src/lib/ensureProfile.ts` creates a profile row on first login

### Supabase integration

- Single client: `frontend/src/lib/supabase.ts`
- Without `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set, the app falls back to mock data for dashboard/documents/clients
- Document uploads go to storage under `documents/<client_id>/…`; downloads use signed URLs (`frontend/src/lib/documentStorage.ts`)
- User roles: `admin`, `broker`, `client` — enforced by RLS on every table

### Key lib files

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client |
| `lib/demoAuth.ts` | Demo session login |
| `lib/portalFlavor.ts` | Client vs staff portal split |
| `lib/branding.ts` | Brand constants |
| `lib/aiConfig.ts` + `openRouterChat.ts` | Optional OpenRouter AI features |
| `lib/amlNameMatch.ts` | Local fuzzy AML name matching |
| `lib/i18n.ts` | i18next setup (EN / FR / Mauritian Kreol) |
| `types/database.ts` | TypeScript types matching Supabase schema |

### State management

React Context only: `AuthContext`, `ThemeContext`, `CurrencyContext` (MUR/USD/GBP/EUR). User preferences in `localStorage` via `lib/localPrefs.ts`.

## Non-obvious caveats

- **esbuild post-install:** `pnpm.onlyBuiltDependencies` in root `package.json` allows esbuild's postinstall to run non-interactively. Do not run `pnpm approve-builds`.
- **Vitest config is separate** from `vite.config.ts` (`frontend/vitest.config.ts`) — intentional to avoid `tsc -b` errors.
- **Auth bypass for local testing:** Temporarily change `ProtectedRoute` in `src/App.tsx` to return `<>{children}</>` instead of checking `user`. Revert before committing.
- **Split portal builds** need their own `.env` files: copy `frontend/.env.portal-client.example` → `frontend/.env.portal-client` (and staff variant) before running `pnpm build:portal-client`.
- **GitHub Pages deploy** is automated via `.github/workflows/deploy-github-pages.yml` on push to `main`. The workflow sets `VITE_GH_PAGES_BASE=/website-insurance-broker` and copies `index.html` → `404.html` for SPA fallback.
- **Cloudflare Pages** uses `wrangler.toml` (`pages_build_output_dir: frontend/dist`).

## Phased rollout

Feature availability is tracked in **PHASES.md** (engineering/RLS order) and **docs/FEATURES_BY_PHASE.md** (UI routes vs mock/live). Many dashboard screens use mock data until the corresponding Supabase phase is wired up.
