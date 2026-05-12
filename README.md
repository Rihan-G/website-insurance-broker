# SecureBroker – Insurance Broker Portal

A modern insurance broker management platform built with React, TypeScript, and Supabase.

## Demo

https://github.com/user-attachments/assets/dashboard_walkthrough.mp4

| Login | Dashboard | Documents |
|:---:|:---:|:---:|
| ![Login](docs/demo/login_page.webp) | ![Dashboard](docs/demo/dashboard.webp) | ![Documents](docs/demo/documents_page.webp) |

| Upload | Clients | Settings |
|:---:|:---:|:---:|
| ![Upload](docs/demo/upload_page.webp) | ![Clients](docs/demo/clients_page.webp) | ![Settings](docs/demo/settings_page.webp) |

## Live site (browser, including iPhone)

The repo includes a **GitHub Actions** workflow that builds the Vite app and deploys it to **GitHub Pages** whenever `main` is updated.

1. In GitHub: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
2. Open the **Actions** tab and confirm the **Deploy GitHub Pages** workflow completes (or push to `main` to trigger it).
3. Your app will be at:

**https://rihan-g.github.io/website-insurance-broker/**

Use your real GitHub username if it differs (`https://<user>.github.io/website-insurance-broker/`). Client-side routes work because the workflow copies `index.html` to `404.html` for SPA fallback.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Opens the dev server at [http://localhost:5173](http://localhost:5173).

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers (Auth)
│   │   ├── layouts/       # Page layouts (AppLayout)
│   │   ├── lib/           # Supabase client, utilities
│   │   ├── pages/         # Page components
│   │   ├── test/          # Test setup and test files
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── supabase/              # Supabase configuration
│   ├── config.toml        # Local dev config
│   └── migrations/        # Database migrations (SQL)
└── package.json           # Root workspace config
```

## Phases

This project follows a phased rollout:

1. **Phase 1** – Upload portal, OCR extraction, document storage, export
2. **Phase 2** – Admin dashboard, 2FA, search/filters, audit trail
3. **Phase 3** – Client access, secure inbox, notifications, payments
4. **Phase 4** – PDF receipts, policy documents, financial reporting
5. **Phase 5** – Service pages, branding, mobile-friendly design
6. **Phase 6** – Calculators, multi-language, compliance, analytics
7. **Phase 7** – Document monitoring, WhatsApp integration, e-ID verification
