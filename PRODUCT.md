# Product

## Register

product

## Users

**Insurance clients in Mauritius** insuring motor, home, life, health, travel, or business risks. They often arrive on mobile, comparing premiums or chasing a renewal before a deadline. They need an indicative quote fast, plain-language advice, and a secure channel for documents and claims updates.

**Brokers and staff** at Sindicom who run the book day to day: quote leads, renewals, expiry monitoring, secure messages, WhatsApp follow-ups, compliance checks, and client onboarding.

**Admins** who audit activity, oversee capacity, and configure how the platform is used across the firm.

Everyone sees the **same marketing homepage** at `/` before sign-in. Role-specific tools live under `/dashboard/*`. Optional split deployments (`VITE_PORTAL_FLAVOR=client` vs `staff`) use separate origins but the same brand entry.

## Product Purpose

Sindicom Brokers Ltd (`sindicombrokers.mu`) is an FSC-licensed insurance broker platform that makes cover **understandable, quotable, and manageable** for Mauritian individuals and businesses.

The product places cover with leading local and international insurers (Swan, MUA, Jubilee, Mauritius Union, and others). It is not an insurer: the broker advises; the insurer underwrites.

Success looks like:
- A visitor gets an **indicative** quote or reaches a licensed advisor without dead ends.
- A signed-in client sees policies, uploads documents, and tracks claims in one portal.
- Staff spend less time chasing paperwork and more time placing cover.
- The experience feels like a competent broker's office, not a generic SaaS template or AI demo.

**Demo mode** (GitHub Pages, `VITE_ALLOW_DEMO_LOGIN`) proves the UX with mock data. **Production mode** (Supabase + real env vars) is the same UI with persisted auth, profiles, quotes, and documents.

## Brand Personality

**Clear. Licensed. Human.**

- **Clear:** Plain language, visible status, honest limits (estimates are indicative until a broker confirms).
- **Licensed:** FSC Mauritius credentials, named advisors, insurer partnerships stated accurately.
- **Human:** Phone, email, and WhatsApp to real advisors; the homepage AI assistant guides but never binds cover or replaces the broker.

Tone is warm-professional: confident without hype. Copy should sound like a broker in Port Louis explaining options at a desk, not a Silicon Valley growth page.

Reference feel: **Stripe Dashboard** clarity on data-heavy screens, **Linear** focus for staff tasks, **Monzo**-style approachability for client status and notifications. Marketing energy is a **credible regional financial services site**, not generic AI-tool marketing.

## Anti-references

- Generic **SaaS landing-page clichés**: hero metric blocks (big number + three stats), identical icon-card grids, gradient text, glassmorphism wallpaper.
- **Generic AI tool marketing**: chatbot-as-hero with no licensed-broker context, purple gradients, "magic" claims about replacing professionals.
- **Finance category reflex**: navy-and-gold palettes, stock-photo handshakes, corporate stiffness with no Mauritius identity.
- **Crypto / neon aesthetics**: dark mode with neon accents, terminal-green on black.
- **Call-centre anonymity**: faceless support, no FSC or insurer trust signals, no path to a named advisor.
- **Duplicate home routes** per role; one shared marketing entry, role split in dashboard only.
- **Implying automated underwriting** or binding cover without human broker review.

## Design Principles

1. **Trust through clarity.** High-stakes decisions need obvious next steps, visible status, and honest framing (indicative quotes, advisor follow-up for binding cover).

2. **Licensed voice, not AI slop.** The assistant helps with guidance; the broker holds the license. UI and copy must never suggest the platform replaces professional advice for binding decisions.

3. **Calm precision in the app.** Dashboard and portal prioritize legibility, semantic status (`StatusPill` tones), and task completion. Decoration serves comprehension, not spectacle.

4. **Show the product on the marketing site.** Portal previews, claims journey, and quote flows are proof, not brochure filler. Visitors should see what they get after sign-in.

5. **One brand, two registers.** Marketing may be more expressive (aurora hero, kinetic type, asymmetric rows). Product UI stays restrained. Both follow `DESIGN.md` tokens and this document's voice.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for text contrast on light and dark surfaces.
- **Keyboard navigation:** visible `:focus-visible` rings; skip links on marketing pages.
- **Reduced motion:** respect `prefers-reduced-motion`; disable particles, kinetic staggers, and hover lifts when set.
- **Mobile-first:** quote flows and homepage CTAs work on phones (safe-area insets, primary touch targets ≥48px).
- **Plain language:** explain insurance terms; write for Mauritius's multilingual audience (English UI, plain and direct).
