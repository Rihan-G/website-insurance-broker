# Feature ideas backlog — net-new (beyond PHASES.md)

This doc is **additional** to [`PHASES.md`](../PHASES.md) and [`FEATURES_BY_PHASE.md`](FEATURES_BY_PHASE.md), which cover finishing/wiring **existing** screens to real Supabase data. Everything below is **new product surface**. Pick items to scope and build individually.

## Status

- **Batch 1 (done):** #1 French translation bundle + language switcher, #3 lead pipeline kanban view, #4 renewal countdown chips — all shipped (marketing nav switcher, `RenewalCountdown` + `.ics` reminder on `ClientPortalPage`, `QuoteLeadsKanban` view toggle on `QuoteLeadsPage`).
- **Batch 2 (next sprint, new table + RLS):** #5 referral program (v1 = status tracking only), #7 data privacy/DSAR center (v1 = request capture + manual staff queue), #8 automated renewal reminder drip (check `pg_cron` availability first; in-app notification only for v1).
- **Batch 3 (scope individually before building):** #10 guided claim photo capture, #11 multi-currency portal display.
- **Removed from consideration for now:** #2 FSC license badge, #6 digital insurance card, #9 household/multi-policy view.

Each item lists **value**, **effort**, **scope** (files/tables to touch), and **dependencies/risks**, following existing patterns in this repo (e.g. `newsletter_subscribers` as the RLS template for new tables).

---

## Already covered — don't rebuild

Verified against the current codebase so we don't duplicate:

| Idea | Already exists as |
|------|--------------------|
| Insurer/plan comparison | `coverageComparison.ts` + `ComparePage` |
| Onboarding/claim document checklists | `documentChecklists.ts` + `ChecklistsPage` |
| Cyclone-season home insurance content | `blogArticles.ts` (`cyclone-season-checklist`) |
| Calendar export for renewals | `icsExport.ts` + `portalCalendarEvents.ts` |
| Multi-currency quote math | `currency.ts` (MUR/USD/GBP/EUR, used in `QuoteCalculatorPage`) |
| i18n framework | `i18n.ts` (react-i18next wired, **English only** so far) |

---

## Tier 1 — Quick wins (frontend-only or trivial schema, ~1 day each)

### 1. French translation bundle + language switcher
- **Value:** Mauritius is bilingual EN/FR; French clients are a large share of the market. The i18n plumbing already exists — only the `fr` resource bundle and a switcher are missing.
- **Scope:** Add `fr.translation` resources to `frontend/src/lib/i18n.ts` (mirror existing `en` keys); add a language toggle to `AppLayout` nav and marketing nav (`HomeMarketingNav.tsx`); persist choice via `localPrefs.ts`.
- **Risk:** Translation accuracy/coverage — start with nav, dashboard, and marketing homepage strings; expand incrementally.

### 2. FSC license verification badge
- **Value:** Reinforces "Licensed" brand pillar with a verifiable trust signal (anti-reference list explicitly calls for real regulator trust signals).
- **Scope:** Small `LicenseBadge` component (license number + link), placed in footer and `AboutPage`. Static content in `branding.ts`/`brandAssets.ts`. No backend.
- **Risk:** None — purely presentational, needs the real FSC license number/URL from the business.

### 3. Lead pipeline kanban view (`QuoteLeadsPage`)
- **Value:** Visual pipeline (New → Contacted → Quoted → Won/Lost) is faster for brokers to scan than a flat table; reuses the existing `quotes.status` field.
- **Scope:** New `QuoteLeadsKanban` component, view toggle (table/kanban) in `QuoteLeadsPage`. Status change via existing `db.quotes().update({ status })` — same write path already used by the table dropdown. Avoid a drag-and-drop library; use click-to-move buttons per column to keep bundle size down.
- **Risk:** None — purely frontend, no new tables.

### 4. Renewal countdown chips
- **Value:** Surfaces "Renews in 12 days" prominently on `ClientPortalPage` and staff `DashboardPage`, nudging renewals before expiry — pairs with the existing "download to calendar" (`icsExport`) action.
- **Scope:** Small `RenewalCountdown` component computing days-to-`end_date` from `policies`, with `StatusPill`-style tones (green >30d, amber 8–30d, red ≤7d). No schema change — derives from existing `policies.end_date`.
- **Risk:** None.

---

## Tier 2 — Medium (new table + RLS + focused UI, ~2–4 days each)

### 5. Referral program
- **Value:** Low-cost client acquisition; brokers already get referrals informally — formalizing it creates a trackable lead source.
- **Scope:**
  - New migration `referrals` table: `id, referrer_id (profiles), referred_email, referred_name, code, status (pending/contacted/converted), created_at`. RLS modeled on `newsletter_subscribers`: client can insert/select own rows; staff can select all.
  - `ClientPortalPage` "Refer a friend" card: generates a shareable code/link, shows referral status.
  - Staff side: referrals feed into `QuoteLeadsPage`/`ClientsPage` as a lead source filter.
- **Risk:** Reward mechanics (discount, cash) are a business decision — scope the UI to "track status" first; defer automatic reward issuance.

### 6. Digital proof-of-insurance card
- **Value:** Clients can show a QR-backed digital card (policy #, insurer, cover dates) to police/officials — tangible, Mauritius-relevant utility that's cheap to build (`qrcode.react` already a dependency, used in `TwoFactorPage`).
- **Scope:**
  - New `InsuranceCard` component on `ClientPortalPage` per active policy: card UI + `QRCodeSVG` encoding a verification URL/token.
  - Downloadable PDF via existing `pdfService.ts` patterns.
  - Optional verification page (`/verify/:token`) showing policy status without exposing PII — needs a short-lived signed token, likely an Edge Function.
- **Risk:** The public verification endpoint needs careful scoping (no PII leakage) — start with PDF/QR for offline display only, defer the live verification endpoint to a follow-up.

### 7. Data privacy center (DSAR self-service)
- **Value:** Mauritius Data Protection Act compliance + builds trust ("Clear. Licensed. Human." pillar). Lets clients request data export/deletion without emailing support.
- **Scope:**
  - New migration `data_requests` table: `id, client_id, type (export/delete), status (pending/in_progress/done), notes, created_at, resolved_at`. RLS: client inserts/selects own; staff (admin) select/update all — modeled on `audit_logs` policies (`00009`).
  - `SettingsPage` section: "Request a copy of my data" / "Request account deletion" buttons that insert a row.
  - Staff queue: small new section in `AuditLogPage` or a new `PrivacyRequestsPage` for admins to action requests (manual fulfilment is fine for v1).
- **Risk:** Actual export/deletion fulfilment stays manual/admin-driven initially — this just gives clients a formal request channel and an auditable trail.

### 8. Automated renewal reminder drip
- **Value:** Reduces lapses by reminding clients at 30/14/7 days before `policies.end_date`, via the existing `notification_log` (from `00002_phases_2_to_5.sql`).
- **Scope:**
  - New Supabase Edge Function (cron via `pg_cron` or Supabase scheduled triggers) that queries policies expiring in 30/14/7 days and inserts rows into `notification_log` (and/or sends email via Resend, per `FREE_TIER_STACK.md`).
  - `NotificationsPage`/`ExpiryMonitorPage` surfaces these as they're created.
- **Risk:** Needs `pg_cron` extension enabled on the Supabase project (check via `list_extensions`); email sending needs a Resend API key — can ship "in-app notification only" first, defer email.

---

## Tier 3 — Larger / cross-cutting (multi-page, ~1+ week each)

### 9. Household / multi-policy family view
- **Value:** Many clients insure as a family (motor + home + travel for multiple members) — a single login showing all linked household policies reduces support friction.
- **Scope:**
  - New migration `household_links` table: `client_id, linked_client_id, relationship, status (pending/accepted)` with mutual-consent RLS (both parties must exist as profiles; linked client must accept).
  - `ClientPortalPage`: household switcher/aggregate view across linked profiles' `policies`.
  - Staff: `ClientsPage` shows household groupings.
- **Risk:** Consent and RLS complexity (one client viewing another's policy data) — needs careful policy design; recommend a written mini-spec before implementation.

### 10. Guided claim photo capture
- **Value:** Better-quality FNOL evidence (damage photos, odometer, documents) improves claims processing speed — extends `ClaimsIntakePage` + `claim_intake_attachments` (already live per `00010`).
- **Scope:** Mobile-first capture flow with labelled prompts (front/back/side/damage close-up/odometer), reusing `uploadService` + `VoiceUploadPage`'s camera patterns. No new tables — attaches to existing `claim_intake_attachments`.
- **Risk:** Browser camera API quirks on iOS Safari — test on real devices.

### 11. Multi-currency portal display
- **Value:** Diaspora/expat clients see policy premiums and payment history in their preferred currency, not just MUR.
- **Scope:** Extend `currency.ts` usage from `QuoteCalculatorPage` into `ClientPortalPage` (policy premiums) and `PaymentsPage`; store preferred currency in `profiles.portal_prefs` (JSONB, already added by `00012_newsletter_and_prefs.sql`).
- **Risk:** Rates in `currency.ts` are static/indicative — fine for display-only conversion with an "indicative FX" disclaimer; live FX is out of scope.

---

## Recommended sequencing

1. ~~**Tier 1 first** (#1, #3, #4)~~ — done, see Status above.
2. **Tier 2 next** (#5, #7, #8) — each is one focused migration following the `newsletter_subscribers` RLS template; #7 (privacy center) and #5 (referrals) are the most self-contained.
3. **Tier 3** — scope individually with a short design note first (#10, #11).

Tell me which Batch 2 item(s) to scope into a real implementation plan and I'll start there.
