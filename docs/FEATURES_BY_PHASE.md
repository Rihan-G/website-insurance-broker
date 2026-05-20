# Features by implementation phase

This document maps **product features and routes** to the rollout phases in **[PHASES.md](../PHASES.md)**. Those phases are the **authoritative implementation order** for Supabase, RLS, and storage. The older seven-bullet list in the root README is **historical / marketing themes** only — use **PHASES.md** plus this file for engineering.

---

## Phase 1 — Database and authentication

| Feature | Where in the app | Typical status |
|---------|------------------|----------------|
| Supabase Auth (email/password) | `LoginPage`, `AuthContext` | Live when env + migrations applied |
| Demo sign-in (no backend) | `demoAuth.ts`, `LoginPage` | On by default for GitHub Pages when `VITE_ALLOW_DEMO_LOGIN` is true |
| Profiles and roles (`admin` / `broker` / `client`) | `profiles`, `AppLayout`, `RoleGuard` | Live after `handle_new_user` + migrations |
| Session persistence | `supabase` client `storageKey` (portal flavors) | Live |

**Migrations:** start with **`00001_initial_schema.sql`** through policies in **`00003_staff_read_access.sql`** (order matters; see `supabase/migrations/`).

---

## Phase 2 — Storage and documents

| Feature | Where in the app | Typical status |
|---------|------------------|----------------|
| Private `documents` bucket + RLS | Supabase Storage | Requires **`00004_documents_storage_bucket.sql`** |
| Upload to client folder | `UploadPage`, `uploadService.ts` | Live path `documents/<client_id>/…` |
| Document list, signed URLs | `DocumentsPage`, `documentStorage.ts` | Live when bucket + RLS exist |
| OCR / review pipeline (UI) | `ReviewPage`, document statuses | Partially live; depends on real rows |

---

## Phase 3 — Money, quotes, and core workflows

| Feature | Where in the app | Typical status |
|---------|------------------|----------------|
| Quote calculator + save | `QuoteCalculatorPage`, `quotes` table | Persist + RLS wired |
| Home quick quote → leads | `HomeQuoteCalculator`, `quotes` | Anonymous + logged-in inserts where RLS allows |
| Staff quote pipeline | `QuoteLeadsPage`, `DashboardPage` preview | Live for admin/broker |
| Payments | `PaymentsPage` | Often still **mock payment links** until gateway / Edge Function |
| Commissions | `CommissionPage` | Queries exist; verify against real data |
| Mid-term / expiry / renewals (data paths) | `MidTermPage`, `ExpiryMonitorPage`, `RenewalsPage` | Mixed; verify per environment |
| Claims intake (FNOL) | `ClaimsIntakePage`, `claim_intakes` | Live insert + notifications when not demo |
| Claim evidence files | Same page + `claim_intake_attachments` | Requires **`00010_claim_intake_attachments.sql`** |
| Client portal (policies, payments, claims, docs, quotes) | `ClientPortalPage` (`/dashboard/my-policies`) | Live reads when tables populated |
| Inbox | `InboxPage` | Live with `inbox_messages` |
| Secure messages / notifications / tasks | `SecureMessagesPage`, `NotificationsPage`, `TasksPage` | Mostly live with care workspace migrations (**`00005_care_workspace.sql`**) |

---

## Phase 4 — Compliance, integrations, admin UX

| Feature | Where in the app | Typical status |
|---------|------------------|----------------|
| Compliance / KYC / AML (tables) | `CompliancePage` | Often **mock rows** until schema + RLS |
| WhatsApp log | `WhatsAppPage` | **Mock** until Meta / Edge integration |
| Add client / onboarding | `ClientsPage` | Demo list vs live invite flow |
| 2FA (TOTP) | `TwoFactorPage` | QR generation exists; confirm `profiles` columns + verify path for production |
| Document audit (brokers) | `AuditLogPage`, migration **`00009_audit_logs_broker_select.sql`** | Policy-dependent |

---

## Phase 5 — Hardening and operations

| Feature | Where in the app | Typical status |
|---------|------------------|----------------|
| Automated tests | `frontend/src/test`, Vitest | Baseline on `App`, `DashboardPage`, libs |
| Lint / TypeScript | `pnpm lint` | CI and local |
| Observability (Sentry, etc.) | Not bundled by default | Optional |
| Secrets hygiene | `.env`, GitHub Secrets | Documented in README / PHASES |

---

## README “Phases 1–7” (legacy themes)

The README still lists seven **high-level product themes** (upload portal, admin dashboard, client access, PDFs, services, calculators, WhatsApp, etc.). Many of those **span multiple technical phases above** or are **already partially built in the UI** before backend work finishes. Treat them as a **roadmap narrative**, not as a second ordering system.

| README theme | Overlaps technical phases |
|--------------|---------------------------|
| Upload, OCR, storage | **Phase 2** + parts of **Phase 3** |
| Admin dashboard, 2FA, audit | **Phase 1**–**4** |
| Client access, inbox, notifications, payments | **Phase 3**–**4** |
| PDFs, financial reporting | **Phase 3** (e.g. `pdfService`) + future hardening |
| Service pages, branding, mobile | Marketing (`HomePage`, `ServicesPage`) + **Phase 5** polish |
| Calculators, i18n, compliance, analytics | **Phase 3**–**4** (calculator, `i18n`, `CompliancePage`, `AnalyticsPage`) |
| Monitoring, WhatsApp, e-ID | **Phase 4** + integrations |

---

## Single rule of thumb

1. Follow **[PHASES.md](../PHASES.md)** order for **database and RLS**.  
2. Use this file to see **which screens belong to which phase**.  
3. For GitHub Pages deploy issues, see **[GITHUB_PAGES.md](./GITHUB_PAGES.md)**.
