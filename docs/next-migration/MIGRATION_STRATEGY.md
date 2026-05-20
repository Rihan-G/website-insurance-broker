# Next.js migration strategy (optional)

This repository ships a **React + Vite + TypeScript** application under `frontend/` with **Tailwind CSS v4** and **Supabase**. Moving to **Next.js** is optional and should be driven by **concrete triggers**, not stack fashion.

---

## When migration is worth it

Consider Next.js (usually **App Router**) if **one or more** of these become true:

| Trigger | Why Vite SPA is painful |
|---------|-------------------------|
| **SEO on many dynamic marketing URLs** | Crawlers and social cards need stable HTML for dozens of pages; prerender pipelines get complex |
| **Unified hosting** for marketing + authenticated app with shared layout | You want one deployment with middleware, cookies, and route groups |
| **Edge or server routes** colocated with UI | BFF pattern: hide service keys, rate-limit quote submissions, server-side PDFs |
| **Team standard** | Organization mandates Next for hiring and libraries |

If none apply, **stay on Vite** and invest in Lanes A–F in [BUILD_ROADMAP.md](../BUILD_ROADMAP.md).

---

## Hosting implications

| Host | Vite (today) | Next.js |
|------|----------------|-----------|
| **GitHub Pages** | Fits static SPA + `404.html` SPA fallback | **No** Node server; only **`output: 'export'`** static export with [limitations](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) (no ISR, no dynamic server routes unless replaced by client calls) |
| **Vercel** | Possible with adapter or separate static deploy | **Natural fit** for SSR, ISR, image optimization, preview URLs |
| **Supabase** | Frontend talks to Supabase from the browser | Same client SDK; **Edge Functions** already cover server logic |

**Practical split:** keep **GitHub Pages** for a lightweight public demo; deploy **production** to Vercel (or another Node host) if you adopt Next with SSR.

---

## Environment variables

| Vite (current) | Next.js equivalent |
|----------------|---------------------|
| `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or publishable key name your SDK expects) |
| `VITE_ALLOW_DEMO_LOGIN` | `NEXT_PUBLIC_ALLOW_DEMO_LOGIN` (or server-only flag if you gate in middleware) |
| `VITE_GH_PAGES_BASE` | Path prefix → `basePath` / `assetPrefix` or hosting root config |

Secrets that must not ship to the browser stay in **server-only** env vars (no `NEXT_PUBLIC_` prefix) and run in Route Handlers or Edge Functions.

---

## Suggested folder mapping (App Router)

Conceptual map from the user’s target tree to this repo’s concepts:

```txt
src/
├── app/
│   ├── (marketing)/          # Public layouts, MDX or TSX pages
│   ├── (portal)/dashboard/  # Authenticated staff/client areas
│   ├── api/                   # Route handlers if not using Supabase Edge only
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── marketing/
│   ├── dashboard/
│   ├── forms/
│   └── animations/
├── features/                  # Optional: quotes, claims, auth, policies
├── lib/                       # supabase client, utils (mirror frontend/src/lib)
├── hooks/
├── services/                  # API wrappers
├── store/                     # Zustand if adopted
├── types/
└── styles/
```

**Monorepo option:** add `apps/web` (Next) alongside `frontend/` (Vite), migrate route-by-route, and delete Vite only when parity is proven.

---

## Tailwind v4 + shadcn/ui

- Tailwind v4 uses **CSS-first configuration** in many setups; shadcn’s default docs often assume **Tailwind v3 + `tailwind.config.js`**.
- Before a large component paste: scaffold **one** shadcn component in the target framework and verify **tokens, animations, and radix** work with your v4 pipeline.
- Alternative: keep **headless Radix** + your own thin wrappers (what shadcn essentially curates).

---

## Auth and protected routes

| Approach | Notes |
|----------|--------|
| **Middleware** | Check session cookie / refresh token pattern Supabase documents for Next |
| **Server Components** | Prefer loading user on server for layout shells; keep sensitive ops off the client |
| **Client-only auth** | Possible but duplicates today’s SPA model — weaker for SEO shells |

Reuse existing **`AuthContext`** logic as a spec; reimplement with `@supabase/ssr` patterns recommended for Next.js App Router.

---

## Framer Motion

If adopted:

- Wrap **section-level** motion; avoid animating large lists.
- Honor **`prefers-reduced-motion: reduce`** (disable or simplify transitions).
- Lazy-load `framer-motion` for marketing routes only if bundle size matters.

---

## Migration phases (technical)

1. **Scaffold** Next app (`apps/web` or replace `frontend/`), TypeScript strict, ESLint, absolute imports.
2. **Static parity** — marketing home + legal/contact pages; match Lighthouse baseline.
3. **Auth** — login, callback, session refresh, protected layouts.
4. **Feature ports** — dashboard, documents, upload (likely client components + Supabase).
5. **Cutover** — CI, env, delete redundant Vite app when all routes pass smoke tests.

Each phase should end with **deployed preview** and **Vitest/Playwright** coverage for critical paths (auth, quote submit).

---

## Decision log (fill in as you go)

| Date | Decision | Rationale |
|------|----------|-----------|
| | Stay on Vite / migrate to Next | |
| | GitHub Pages / Vercel / both | |
| | shadcn yes/no | |
