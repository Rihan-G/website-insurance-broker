# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Insurance broker portal (SecureBroker) — React 19 + TypeScript + Vite + Tailwind CSS v4 frontend, with Supabase as the backend (PostgreSQL, Auth, Storage, Edge Functions). Monorepo using pnpm workspaces.

### Quick reference
Standard dev commands are in root `package.json` and documented in `README.md`:
- `pnpm dev` — starts Vite dev server on port 5173
- `pnpm lint` — ESLint + TypeScript type check
- `pnpm test` — Vitest (unit/integration)
- `pnpm build` — TypeScript compile + Vite production build

### Non-obvious caveats
- **esbuild build scripts**: The root `package.json` has `pnpm.onlyBuiltDependencies: ["esbuild"]` to allow esbuild's postinstall to run non-interactively. Do NOT run `pnpm approve-builds` (interactive).
- **Vitest config**: Test config lives in `frontend/vitest.config.ts` (separate from `vite.config.ts`) to avoid TypeScript build errors with `tsc -b`.
- **Supabase not running locally**: The frontend uses mock data for dashboard/documents/clients. Supabase connection defaults to `localhost:54321` with a placeholder key. To connect to a real Supabase instance, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`.
- **Auth bypass for testing**: To view protected pages without a Supabase backend, temporarily modify `ProtectedRoute` in `src/App.tsx` to return `<>{children}</>` instead of checking `user`. Remember to revert before committing.
- **Database migrations**: SQL migrations are in `supabase/migrations/`. These are for reference and for when Supabase CLI (`supabase db push`) is used.
