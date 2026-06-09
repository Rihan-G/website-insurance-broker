---
name: Sindicom Brokers
description: FSC-licensed insurance broker and client portal for Mauritius. Clear cover, trusted advisors, modern digital tools.
colors:
  primary-600: "#0369A1"
  primary-50: "#F0F9FF"
  primary-200: "#BAE6FD"
  primary-800: "#0A3D5C"
  primary-900: "#082F49"
  accent-500: "#16A34A"
  accent-200: "#BBF7D0"
  accent-600: "#15803D"
  warning-500: "#F59E0B"
  danger-500: "#DC2626"
  surface: "#FFFFFF"
  surface-foreground: "#0C4A6E"
  background: "#F8FBFF"
  muted: "#E7EFF5"
  muted-foreground: "#64748B"
  border: "#BAE6FD"
  ring: "#0369A1"
typography:
  display:
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.16em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.accent-500}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "14px 32px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-600}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "14px 32px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary-50}"
    rounded: "{rounded.md}"
    padding: "14px 32px"
  chip-coverage:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-800}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    typography: "{typography.body}"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.surface-foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Sindicom Brokers

## 1. Overview

**Creative North Star: "The Coastal Clarity"**

Sindicom's visual system reads like a bright Mauritian morning on a broker's desk: sky-blue confidence, green proof of protection, and paperwork that finally makes sense. Marketing surfaces are **committed** (color carries the hero; aurora meshes and kinetic type signal energy without shouting). The client portal is **restrained** (tinted neutrals, one accent at a time, panels that stay out of the way of policy data).

The system serves two registers. **Brand** (homepage, login shell) sells trust and speed with asymmetric layouts, scroll choreography, and atmospheric depth. **Product** (dashboard, portal) prioritizes legibility, status clarity, and dense information without decorative noise.

This system enforces the anti-references in `PRODUCT.md`: no SaaS landing-page clichés, no generic AI-tool marketing, no finance-category reflex (navy-and-gold), no crypto/neon aesthetics, no call-centre anonymity, and no gradient text or glassmorphism wallpaper.

**Key Characteristics:**
- Sky-primary (#0369A1) for trust and navigation; meadow-green (#16A34A) reserved for success, CTAs, and "protected" moments
- Light-first marketing with optional dark mode; dashboard dark tokens tuned for WCAG-friendly copy on navy surfaces
- Inter + IBM Plex Sans: humanist sans throughout; no serif display pairing
- Asymmetric section rhythm on marketing pages; flat-by-default panels in the app
- Expo ease-out motion (240ms UI, 560ms entrances); no bounce or elastic easing
- Copy is direct and licensed-broker appropriate; no em dashes

## 2. Colors

A full-palette system with deliberate roles: primary sky blue, accent meadow green, warm amber for urgency, red for danger. Neutrals are cool-tinted toward primary hue, not pure gray.

### Primary
- **Harbor Sky** (#0369A1 / primary-600): Main brand anchor. Navigation focus rings, links, dashboard chrome, insurer trust signals.
- **Mist Wash** (#F0F9FF / primary-50): Section backgrounds, chip fills, info status pills.
- **Open Water** (#BAE6FD / primary-200): Borders, helper surfaces, hover border shifts on cards.
- **Deep Current** (#0C4A6E / surface-foreground): Body copy on light surfaces; headings in app UI.

### Secondary
- **Meadow Proof** (#16A34A / accent-500): Primary CTAs ("Get a Free Quote"), success states, live indicators, accent headlines on dark hero.
- **Soft Canopy** (#BBF7D0 / accent-200): Subhead emphasis on dark hero backgrounds (solid, never gradient-clipped).
- **Forest Press** (#15803D / accent-600): CTA hover, confirmed/success emphasis.

### Tertiary
- **Sunlit Alert** (#F59E0B / warning-500): Renewal urgency, amber aurora accents, warning pills.
- **Signal Red** (#DC2626 / danger-500): Errors, critical claims status, destructive actions.

### Neutral
- **Paper Surface** (#FFFFFF / surface): Cards, modals, nav bar when scrolled.
- **Morning Air** (#F8FBFF / background): Page canvas for app and soft marketing sections.
- **Sea Fog** (#E7EFF5 / muted): Input tracks, disabled fills, subtle dividers.
- **Harbor Slate** (#64748B / muted-foreground): Secondary copy, placeholders, captions.
- **Tide Line** (#BAE6FD / border): Default borders on panels and inputs.

**The Rarity Rule.** Green accent and amber warning each appear on ≤15% of any screen. Their scarcity signals action and urgency. Blue carries structure; green earns the click.

## 3. Typography

**Display Font:** Inter (with IBM Plex Sans, system-ui fallback)
**Body Font:** Inter (with IBM Plex Sans, system-ui fallback)
**Label Font:** Inter (uppercase eyebrows via `.ui-eyebrow`)

**Character:** Confident and legible. Tight negative tracking on large headings; generous line-height on body. No decorative display face; hierarchy comes from weight and scale, not font switching.

### Hierarchy
- **Display** (800, clamp(2.25rem–3.75rem), 1.06): Hero kinetic headings, major marketing statements.
- **Headline** (700, clamp(1.5rem–2.25rem), 1.15): Section titles (`.ui-title`), dashboard page headers.
- **Title** (700, 1.25rem, 1.25): Card titles, feature row headings, modal titles.
- **Body** (400, 0.925rem, 1.6): Paragraphs (`.ui-body`). Cap line length at 65–75ch on long-form copy.
- **Label** (700, 11px, 0.16em tracking, uppercase): Eyebrows (`.ui-eyebrow`), section tags, table column headers.
- **Caption** (400, 0.75rem, 1.45): Timestamps, footnotes (`.ui-caption`).

**The Solid Emphasis Rule.** Emphasis on dark heroes uses solid `text-accent-200` or weight change. Gradient-clipped text (`.text-gradient`, `.text-gradient-warm`) is legacy and prohibited on new surfaces.

## 4. Elevation

Hybrid system: **tonal layering by default**, **lift on interaction**. Marketing sections use soft gradient washes (`home-section-soft`, `home-section-tint`) instead of heavy shadows. Cards and panels gain depth only on hover or when elevated (modals, command palette).

Depth on the hero comes from aurora orbs and particle fields (ambient, not structural), not from stacking shadowed cards.

### Shadow Vocabulary
- **Panel rest** (`0 10px 40px -12px rgba(3, 105, 161, 0.1)`): `.dashboard-panel` default elevation in app.
- **Card hover lift** (`0 12px 40px rgba(3, 105, 161, 0.12), 0 4px 12px rgba(3, 105, 161, 0.08)`): `.card-hover:hover` on marketing cards.
- **Feature row hover** (`0 16px 40px -24px rgba(3, 105, 161, 0.45)`): `.home-feature-row:hover` asymmetric feature blocks.
- **Nav scrolled** (`0 8px 30px -12px rgba(3, 105, 161, 0.2)`): Fixed marketing nav after scroll threshold.
- **Modal** (`shadow-2xl` + ring): Command palette, mobile overlays.

**The Flat-By-Default Rule.** Surfaces at rest are flat or tonally layered. Shadows appear as a response to hover, scroll state, or modal elevation, never as permanent decoration on static content.

## 5. Components

### Buttons
- **Shape:** Gently rounded (12px / `rounded-xl`).
- **Primary:** Meadow green fill (`from-accent-500 to-accent-600` gradient acceptable on hero CTA only), white text, bold 14px, min-height 48px, `.btn-glow` sheen on hover.
- **Hover / Focus:** Darken to accent-600; `ring-2 ring-primary-300` or global `:focus-visible` 3px `var(--color-ring)` outline with 2px offset.
- **Secondary (hero):** Transparent or `border-white/25` ghost on dark aurora; solid `border-border bg-surface` in app context.
- **Destructive:** `danger-500` fill; never green.

### Chips / Pills
- **Coverage pills:** `rounded-full`, `bg-primary-50 text-primary-800`, border `primary-200/80`, hover lift via `.home-coverage-pill`.
- **Status pills:** `rounded-full border px-2.5 py-1 text-xs font-semibold`; tone maps to primary/accent/warning/danger semantic fills (see `StatusPill`).

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`) for feature cards; 12px (`rounded-xl`) for compact panels.
- **Background:** `surface` on light; `dashboard-panel` class for app content.
- **Shadow Strategy:** Rest flat; `.card-hover` or `.home-feature-row` for interactive lift.
- **Border:** 1px `border-border` or `border-primary-200/80`; hover shifts to `primary-300` / `#7DD3FC`.
- **Internal Padding:** 24px (md cards), 32px (lg feature rows).
- **Layout:** Prefer asymmetric rows and alternating spans over uniform 3–4 column identical grids.

### Inputs / Fields
- **Style:** `rounded-xl border border-border bg-white` (dark: `bg-slate-900/80`), high-contrast text (`text-slate-900` / `dark:text-slate-100`).
- **Focus:** `ring-2 ring-primary-400` or global focus-visible ring.
- **Error:** `border-danger-500` + `text-danger-600` message below field.
- **Placeholder:** `muted-foreground` at 82% opacity in dark mode.

### Navigation
- **Marketing nav:** Fixed top, transparent-on-hero → `bg-white/92 backdrop-blur-xl` when scrolled. Links use underline grow animation (`after:w-0` → `after:w-full`). Brand + ShieldCheck icon.
- **App nav:** Sidebar with `aurora-sidebar` ambient orbs (subtle); active route uses primary fill, not side-stripe accent borders.
- **Mobile:** Full-screen slide panel; body scroll lock; Escape to close.

### Signature: Aurora Hero
- Layered `.aurora-orb-*` blobs (sky, green, amber) with 32–55px blur, slow blob keyframes.
- `.ParticleField` rise/drift particles, `.scan-line` horizontal beam, `.dot-grid` overlay.
- Content sits in `max-w-7xl` grid with kinetic heading and dashboard mockup float animation.

### Signature: Kinetic Heading
- Word-by-word entrance via `.kinetic-heading` + `.word-animate`; 80ms stagger per word; triggered on scroll into view.

## 6. Do's and Don'ts

### Do:
- **Do** use sky primary for structure and meadow green only for actions, success, and "protected" semantics.
- **Do** break marketing layouts with alternating asymmetric rows (7/5 columns, staggered feature blocks).
- **Do** use motion tokens: `--ease-out-expo`, `--duration-ui` (240ms), `--duration-entrance` (560ms).
- **Do** keep body copy at 0.925rem / 1.6 line-height and cap long paragraphs at ~70ch.
- **Do** respect `prefers-reduced-motion`: disable hover lifts, particle fields, and kinetic staggers.
- **Do** use solid `text-accent-200` for hero subheads; commas instead of em dashes in all user-facing copy.

### Don't:
- **Don't** use `background-clip: text` gradient text on new components (`.text-gradient-warm` is banned).
- **Don't** apply `backdrop-blur` glass cards as a default container; glass is limited to nav scroll state and hero badge.
- **Don't** build identical icon + heading + blurb card grids; vary span, order, and background treatment per row.
- **Don't** use colored `border-left` or `border-right` stripes greater than 1px on cards, alerts, or list items.
- **Don't** deploy the hero-metric template (big number, small label, three stats in a row) without asymmetric context.
- **Don't** use em dashes or double hyphens in UI copy.
- **Don't** reach for navy-and-gold, purple-gradient dark mode, or neon-on-black crypto aesthetics.
- **Don't** animate layout properties (`width`, `height`, `margin`); transform and opacity only.
