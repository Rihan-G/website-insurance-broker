# SecureBroker — phased rollout

Work in **order**: each phase builds on the last. Tick items off in your tracker or checklist when done.

---

## Phase 1 — Database & authentication

**Goal:** Hosted Supabase schema and users match what the app expects.

| Task | Notes |
|------|--------|
| Apply migrations on the hosted project | Run `supabase db push` (CLI linked to project) or paste SQL from `supabase/migrations/` in order through **`00004_documents_storage_bucket`** (see Phase 2 for Storage). |
| Smoke-test RLS | Log in as **client** vs **broker** vs **admin** and confirm dashboards/clients/documents behave (empty data is OK; errors mean RLS or missing policies). |
| Create real Auth users | At least **one admin**, **one broker**, **one client** (Sign up / Dashboard or Auth UI). |
| Confirm profiles | `handle_new_user` trigger should create `profiles` rows; if not, insert/fix manually so roles match menus (`AppLayout`). |
| Environment | `frontend/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`). Use `frontend/.env.example` as checklist. |

**Exit criteria:** Authenticated users load without console auth errors; staff see lists empty or with real rows, not perpetual permission failures.

---

## Phase 2 — Storage & documents (end-to-end)

**Goal:** Files in Supabase Storage line up with `documents` rows; list page can download/preview safely.

**In this repo (apply `00004` on your Supabase project):**

| Delivered | Notes |
|-----------|--------|
| `supabase/migrations/00004_documents_storage_bucket.sql` | Creates private bucket `documents` + RLS on `storage.objects` (client own folder; staff read/write client folders; path `documents/<client_id>/...`). |
| `frontend/src/lib/documentStorage.ts` | `createSignedUrl` helpers for preview/download. |
| `uploadService.ts` | Bucket stays private; upload no longer relies on a public URL. |
| `DocumentsPage.tsx` | Loads `file_path`; Eye / Download use signed URLs (disabled in demo rows). |

| You still do on the host | Notes |
|-----------|--------|
| Run migration `00004` | After `00001`–`00003`. Verify bucket exists in Dashboard → Storage. |
| Upload flow QA | Brokers must upload into a path whose **second** segment is an existing **client** profile id (`uploadService` already uses `clientId` in the path). Add “select client” UX on `UploadPage` if staff usually upload on behalf of clients. |

**Exit criteria:** Upload from UI produces a Storage object + DB row; user can open/download from Documents (with migration applied).

---

## Phase 3 — Money, quotes, and core workflows

**Goal:** Replace placeholders on high-traffic business flows.

| Task | Notes |
|------|--------|
| Payments | `PaymentsPage` still fabricates `mockLink` — replace with real gateway rules (Edge Function + `payments` updates) or a documented “pending link” MVP. |
| Quotes | Ensure `QuoteCalculatorPage` persists/updates `quotes` per your product rules and RLS. |
| Commissions / expiry / mid-term | Already touch Supabase in places — verify each page against real data and add missing INSERT/UPDATE paths. |
| Dashboard revenue trend | Today the chart is **illustrative** for live data; optional: monthly aggregates query or materialized view. |

**Exit criteria:** Primary revenue-related actions write real rows; no fake payment URLs in production paths.

---

## Phase 4 — Compliance, integrations, and admin UX

**Goal:** Screens that are still demo-only either go live or are clearly flagged.

| Task | Notes |
|------|--------|
| Compliance | Replace `CompliancePage` `mockRecords` with schema + RLS + queries (may need new tables or reuse `profiles`/KYC flags). |
| WhatsApp | `WhatsAppPage` uses `mockLog` — integrate Meta Cloud API or Edge Function + `notification_log`. |
| Add client flow | `ClientsPage` “Add client” — invite Flow (Supabase invite), admin insert, or external CRM sync. |
| 2FA | `TwoFactorPage` QR placeholder — wire `qrcode.react` + `profiles.totp_*` and verify flow for production readiness. |

**Exit criteria:** No silent “fake data” pages for roles that expect production behavior (or feature-flag them OFF).

---

## Phase 5 — Hardening & operations

**Goal:** Maintainable for a team.

| Task | Notes |
|------|--------|
| Tests | Extend Vitest beyond `App`/`DashboardPage` for auth mocks, Documents export, upload service with mocked Supabase. |
| Lint | Resolve `ThemeContext.tsx` react-refresh export warning if it bothers CI. |
| Observability | Sentry/log drains for Edge Functions and client errors (optional). |
| Secrets & keys | No keys in git; rotate if exposed; document service role usage only on server/Edge. |

---

## Quick reference — what’s already wired

- **Live data (non-demo):** Dashboard (staff/client), Clients, Documents (list + CSV), Inbox, Client portal, many phase pages using `db` / `supabase`.
- **Demo mode:** `demoAuthActive` when session is absent (see `AuthContext` + `demoAuth.ts`).
- **Upload & files:** `uploadService` uploads to private bucket `documents`; `documentStorage.ts` issues signed URLs for preview/download; run migration **`00004`** on Supabase so bucket + `storage.objects` policies exist.

When in doubt, complete **Phase 1** before changing UI in later phases so you are not debugging schema and UX at once.
