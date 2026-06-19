# SindicomUI (frontend@0.1.0)

This design system is the published frontend React library, bundled as a single
browser global. All 30 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.SindicomUI`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.SindicomUI.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { BackToTop } = window.SindicomUI;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<BackToTop />);
```

Wrap the tree in the provider — most components read theme/i18n from context:

```jsx
<MemoryRouter><ThemeProvider><CurrencyProvider>{children}</CurrencyProvider></ThemeProvider></MemoryRouter>
```

## Tokens

278 CSS custom properties from frontend. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (166): `--tw-border-style`, `--tw-shadow-color`, `--tw-inset-shadow-color`, …
- **spacing** (5): `--tw-space-y-reverse`, `--tw-inset-shadow`, `--tw-inset-shadow-alpha`, …
- **typography** (16): `--tw-font-weight`, `--tw-tracking`, `--font-sans`, …
- **radius** (4): `--radius-md`, `--radius-lg`, `--radius-xl`, …
- **shadow** (8): `--tw-shadow`, `--tw-shadow-alpha`, `--tw-ring-shadow`, …
- **other** (79): `--tw-translate-x`, `--tw-translate-y`, `--tw-translate-z`, …

## Components

### general
- `BackToTop`
- `BrandLogo` — Sindicom logo from public/brand/ (logo.svg  logo.png), with shield fallback.
- `BrokerTemplateDownloads`
- `ClaimsTimeline`
- `CommandPalette`
- `CommissionCalculatorTool`
- `CookieConsent`
- `CurrencySwitcher`
- `DashboardAccessSentinel` — - Unified (default): clients cannot open staff dashboard segments (same origin).
- `EmptyState`
- `ErrorBoundary`
- `ExplainCoverTool`
- `FaqAssistant`
- `IncidentLocationMap`
- `KineticHeading`
- `OfflineBanner`
- `OnboardingTour`
- `PageFallback` — Minimal full-width spinner while lazy dashboard routes load.
- `ParticleField`
- `QuoteComparePanel`
- `RoleGuard`
- `ScrollProgress` — Homepage colour rail under the nav  sliding cyan / champagne / silver track,
- `StatusPill`
- `TemplatePreviewModal`
- `ThemeToggle`
- `Typewriter`
- `WaveDivider`

### marketing
- `MarketingFooter`
- `MarketingPageLayout`
- `MarketingSubNav`
