# Build roadmap — execution sequencing

This document turns architecture ideas into an **ordered execution plan** for the SecureBroker / Sindicom Brokers portal and the public marketing experience (including the [GitHub Pages demo](https://rihan-g.github.io/website-insurance-broker/)).

It complements **[PHASES.md](../PHASES.md)**, which is the authoritative **Supabase and product rollout** checklist (auth → storage → money/quotes → compliance). Use **PHASES.md** for “what must be true in the database,” and this file for **frontend structure, marketing depth, and optional platform upgrades**.

---

## Current baseline (facts in this repo)

| Layer | Today |
|--------|--------|
| App shell | React 19 + TypeScript + **Vite** (`frontend/`) |
| Styling | **Tailwind CSS v4** |
| Backend | **Supabase** (Auth, Postgres, Storage, Edge Functions) — `supabase/migrations/` |
| Deploy | Static **GitHub Pages** build (`pnpm build` + workflow); demo login via `VITE_ALLOW_DEMO_LOGIN` |
| Tests | Vitest + RTL (`frontend/vitest.config.ts`) |

Treat **Next.js + shadcn + Framer Motion** as an **optional migration path**, not a prerequisite for shipping value. The highest-impact product move remains **real quotes/leads + staff workflows** on the stack you already have.

---

## Guiding priorities (order of leverage)

1. **Trust and clarity** — insurance UI must feel calm and precise; motion and glass effects are secondary to readability and honest copy.
2. **One source of truth for data** — fewer mock tables in production paths; align with PHASES.md exit criteria.
3. **Interactive proof** — quote estimator + a credible **portal/dashboard preview** (even partly mocked) convert better than brochure pages alone.
4. **SEO where it earns traffic** — dedicated routes for product lines when you have real content, not empty shells.
5. **Framework migration only when it unlocks a concrete need** — SSR for SEO, unified marketing+app hosting, or team conventions. See [next-migration/MIGRATION_STRATEGY.md](./next-migration/MIGRATION_STRATEGY.md).

---

## Lane A — Foundation (keep the codebase “professional”)

**Goal:** predictable structure, linting, types, and layout primitives so feature work does not fight the repo.

| Priority | Task | Notes |
|:--------:|------|--------|
| A1 | Keep **ESLint + TypeScript strict** green in CI | Root: `pnpm lint` |
| A2 | **Absolute imports** (`@/…`) if not already uniform | Match existing `frontend` tsconfig paths |
| A3 | **Responsive container + type scale** | Shared max-width, spacing rhythm, heading/body tokens in Tailwind theme |
| A4 | **Color tokens** | Semantic tokens (background, surface, border, primary, danger) — avoid one-off hex in pages |
| A5 | Document **env vars** | `frontend/.env.example`; Pages vs local vs “real Supabase” |

**Exit:** a new page can be added in under a day without new global hacks.

---

## Lane B — Design system (before painting more pages)

**Goal:** reusable primitives so marketing and dashboard do not diverge.

Build in this order (dependencies first):

1. **Button**, **Input**, **Select**, **Textarea** (forms)
2. **Card**, **Section**, **Container**
3. **Modal / Dialog** (accessible focus trap)
4. **Navbar** / **Footer** patterns for marketing vs `AppLayout` staff shell

**Stack note:** [shadcn/ui](https://ui.shadcn.com) is a strong default **if** you adopt Radix primitives consistently. This repo already ships Tailwind v4; validate component recipes against v4 before mass-copying v3 snippets. Defer shadcn until you either stay on Vite or complete the Next decision (see migration doc).

**Exit:** new sections compose from `components/ui/*` without copying Tailwind strings across files.

---

## Lane C — Marketing site / homepage (conversion sequence)

**Goal:** the public site reads as a **product**, not only a demo.

Implement sections in **this order** (each builds trust for the next):

| Order | Section | Why this order |
|:-----:|---------|----------------|
| C1 | **Hero** | First impression, primary CTA, optional live or static “dashboard preview” |
| C2 | **Trust strip** | Logos, metrics, regulator copy — reduces bounce before scroll |
| C3 | **Services grid** | Clear product mapping; links to future `/auto-insurance`, etc. |
| C4 | **Statistics** | Social proof; prefer honest numbers or “demo” labels |
| C5 | **Testimonials** | Works after services are understood |
| C6 | **Quote estimator** | “Wow” interaction once the brand feels legitimate |

**Motion:** prefer CSS transitions and small `prefers-reduced-motion` gates. If you add **Framer Motion**, restrict to hero and section entrances; avoid scroll-jank and heavy parallax.

**Typography direction (optional):** headings **Manrope** or **Space Grotesk**, body **Inter** — load only what you use; subset weights.

---

## Lane D — Quote estimator → persistence

**Goal:** move from “toy calculator” to **lead capture** aligned with RLS.

| Step | Task |
|------|------|
| D1 | Finalize **client-side formula** and validation (currency, min/max, duration) |
| D2 | Supabase table **`quote_requests`** (or extend existing `quotes`) + RLS (insert for anon or authenticated only) |
| D3 | Wire **Home** / **QuoteCalculatorPage** submit to insert row + success state |
| D4 | Staff **list + export** (minimal admin table or reuse an existing screen) |

**Cross-reference:** PHASES.md **Phase 3 — Quotes** for making calculator output real in production paths.

---

## Lane E — Admin / broker “SaaS” perception

**Goal:** reviewers see an operational portal, not only marketing.

| Step | Task |
|------|------|
| E1 | **Dashboard** — real aggregates where migrations exist; label illustrative charts |
| E2 | **Claims intake** / **Clients** — reduce mock-only paths per PHASES.md Phase 4 |
| E3 | **Lead management** — tie quote requests to broker queue or notifications |

---

## Lane F — SEO and content architecture

**Goal:** indexable pages when you have substance.

| Route (examples) | Intent |
|--------------------|--------|
| `/auto-insurance`, `/life-insurance`, `/health-insurance` | Line-of-business landing pages |
| `/claims`, `/contact` | High-intent support and conversion |
| `/blog` | Only if you commit to content cadence |

**Without SSR:** Vite SPA on GitHub Pages relies on **prerendering** or **post-build static HTML** for perfect crawler snapshots of deep links. If SEO becomes a blocker, revisit Next or a static site generator — see migration doc.

**Targets:** aim for **Lighthouse** 95+ performance on marketing (after image/video discipline), **100 a11y** on forms and nav, **100 best practices** (HTTPS, no mixed content). SEO score follows real titles, meta descriptions, and content depth.

---

## State management sequencing

| Stage | Recommendation |
|-------|------------------|
| Now | **React Context** for auth, theme, currency (already present) |
| When global client state grows (filters, wizard steps, cross-page quote draft) | **Zustand** (or similar) for a few focused stores |
| Avoid | **Redux** unless multiple teams demand time-travel devtools and strict middleware patterns |

---

## Analytics and deployment (after core flows work)

| Piece | When |
|-------|------|
| **Vercel** (or similar) | If you migrate to Next or need preview deployments per PR |
| **Supabase** | Already the production backend target |
| **GA4 / PostHog** | After events are defined (quote start, submit, login, upload) |

---

## Mapping to the “10 help items” list

| # | Item | Where it lives in this roadmap |
|---|------|----------------------------------|
| 1 | Full Next.js migration setup | [next-migration/MIGRATION_STRATEGY.md](./next-migration/MIGRATION_STRATEGY.md) — **defer** until triggers are met |
| 2 | Tailwind + shadcn architecture | Lane **B** (+ migration doc for App Router layout) |
| 3 | Complete homepage redesign | Lane **C** |
| 4 | Production folder scaffolding | Lanes **A**–**B**; optional tree in migration doc |
| 5 | Responsive navbar | Lane **B** then **C1** |
| 6 | Quote estimator logic | Lane **D1** |
| 7 | Supabase schema design | **PHASES.md** + Lane **D2** |
| 8 | Admin dashboard UI | Lane **E** |
| 9 | Framer Motion system | Subset of **C**; respect `prefers-reduced-motion` |
| 10 | SEO metadata | Lane **F**; SSR decision drives implementation |

---

## What “done” looks like for a portfolio-grade milestone

- Marketing homepage tells a coherent product story with **one primary CTA** and a working **quote → stored lead** path.
- Staff experience shows **real or clearly labeled** data; PHASES.md Phase 3 exit criteria trending green.
- Docs: this roadmap + PHASES.md + migration strategy stay **the single place** new contributors read first.
