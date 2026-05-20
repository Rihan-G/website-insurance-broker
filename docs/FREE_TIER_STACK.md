# Free-tier production stack (Vite + Vercel + Supabase)

You can ship a **credible insurance MVP** on mostly **free tiers** if you keep the architecture boring and push complexity into **Supabase** (data, auth, storage, Edge Functions) and a **thin React client**.

This note aligns a “best free stack” with **this repository** and points to **[PHASES.md](../PHASES.md)** for what must become real in the database versus demo UI.

---

## Recommended stack (opinionated, $0–low cost)

| Layer | Choice | Role |
|-------|--------|------|
| UI | [Vite](https://vitejs.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | SPA shell, fast DX |
| Styling | [Tailwind CSS](https://tailwindcss.com) | Utility styling; this repo uses **v4** |
| Components | [shadcn/ui](https://ui.shadcn.com) (optional) | Accessible primitives; validate recipes against Tailwind v4 before a wide rollout |
| Motion | [Framer Motion](https://www.framer.com/motion/) (optional) | Marketing polish only; respect `prefers-reduced-motion` |
| Icons | [Lucide](https://lucide.dev) | Already used in this project |
| Backend | [Supabase](https://supabase.com) | Postgres, Auth, Storage, Realtime, Edge Functions |
| Auth | Supabase Auth | Email/password, magic links, OAuth when enabled in the project |
| Client data access | `@supabase/supabase-js` + generated types | Typical MVP path |
| Server/schema ORM (optional) | [Drizzle](https://orm.drizzle.team) or [Prisma](https://www.prisma.io) | Most useful in **Edge Functions**, scripts, or a small Node BFF—not mandatory in the browser if you use the Supabase client |
| State | [Zustand](https://github.com/pmndrs/zustand) (when needed) | Simpler than Redux for multi-step flows |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Validation and fewer re-renders |
| Charts | [Recharts](https://recharts.org) | Already in this project |
| Toasts | [Sonner](https://sonner.emilkowal.ski) or current **react-hot-toast** | Pick one pattern project-wide |
| Tables | [TanStack Table](https://tanstack.com/table) | Headless grids for broker/admin lists |
| Files | Supabase Storage | Private buckets + signed URLs (see migrations and `documentStorage` helpers) |
| Email | [Resend](https://resend.com) (or Supabase hooks + provider) | Transactional: quote ack, reset password, claim updates |
| Analytics | [PostHog](https://posthog.com) (or GA4) | Funnels, feature usage, demo vs prod separation |
| Deploy | [Vercel](https://vercel.com) (and/or **GitHub Pages** for the public demo) | Previews on PRs; static `vite build` output |
| CMS (optional) | [Sanity](https://www.sanity.io) / [Contentful](https://www.contentful.com) | Only if you commit to a blog/news cadence |
| AI (optional) | [OpenRouter](https://openrouter.ai) or direct model APIs | Gate behind feature flags; broker-side tools first |

---

## What this repo already matches

| Piece | Status |
|-------|--------|
| Vite + React + TypeScript | `frontend/` |
| Tailwind v4 | `frontend` + `@tailwindcss/vite` |
| Supabase client | `@supabase/supabase-js` |
| Lucide | `lucide-react` |
| React Router | `react-router-dom` v7 |
| Recharts | `recharts` |
| Toasts | `react-hot-toast` (Sonner is an optional swap) |

---

## Highest-impact free “features” to build next

These three change perception from **marketing demo** to **platform**:

1. **Quote estimator** — interactive UI + **persisted** submissions (RLS-safe table).
2. **Client dashboard** — policies, renewals, documents, claim status from **real** reads (empty states OK).
3. **Claims submission flow** — end-to-end intake + Storage + staff queue.

Implementation order and database work: **[PHASES.md](../PHASES.md)** and **[BUILD_ROADMAP.md](./BUILD_ROADMAP.md)**.

---

## What to defer paying for

Until traffic or compliance demands it, you can usually skip:

- Third-party auth suites (Supabase Auth is enough for many MVPs).
- Premium UI kits (Tailwind + a small internal `components/ui` layer go far).
- Heavy enterprise CMS (Markdown in-repo or a free tier CMS first).
- Extra databases beside Postgres (stay in Supabase unless you have a hard requirement).

---

## Free-tier reality checks (planning, not legal advice)

- **Supabase**: free projects can pause after inactivity; watch **database size**, **egress**, and **Auth** provider quotas.
- **Vercel**: hobby limits on **bandwidth**, **build minutes**, and **serverless** if you add functions.
- **Email**: free tiers cap **monthly sends**; design flows so brokers can retry or see queue state.
- **Analytics**: sample rates and data retention differ by tier; use **separate projects** for production vs staging.

---

## Performance and quality (no paid tools required)

- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) and [PageSpeed Insights](https://pagespeed.web.dev) for regressions.
- Route-level **code splitting** (`React.lazy`) for heavy dashboard routes.
- Image discipline (formats, dimensions, lazy loading) on marketing pages.

---

## Related docs

- **[BUILD_ROADMAP.md](./BUILD_ROADMAP.md)** — sequencing architecture, UX, and conversion work without migrating frameworks.
- **[next-migration/MIGRATION_STRATEGY.md](./next-migration/MIGRATION_STRATEGY.md)** — Next.js only if a concrete trigger appears.
