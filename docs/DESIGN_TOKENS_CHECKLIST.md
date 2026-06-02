# Design Tokens Checklist

Use this checklist before shipping new UI so the product stays visually consistent.

## Spacing
- Use a core rhythm: `8 / 16 / 24 / 40`.
- Prefer `gap-*` over ad-hoc margins for grouped controls.
- Keep section spacing consistent between sibling blocks.

## Radius
- Inputs/buttons/chips: `rounded-lg` or `rounded-xl`.
- Cards/panels: `rounded-2xl`.
- Full pills/badges: `rounded-full`.

## Typography
- Eyebrow text: uppercase, `text-[11px]`, wide tracking.
- Section heading: `text-2xl` to `text-3xl`, bold, tight tracking.
- Body copy: `text-sm` with relaxed line-height.
- Helper/caption: `text-xs` with subdued contrast.

## Status Semantics
- Success/live/done: accent tone.
- Info/in-progress: primary tone.
- Warning/pending/review: warning tone.
- Error/blocked: danger tone.
- Neutral/demo/offline: muted tone.

## Icons and Emoji
- Desktop nav: icon + label.
- Mobile nav: icon + emoji + label (recognition aid).
- Keep emoji meaning stable across pages.

## States
- Every empty state should include:
  - one line that explains why the section matters
  - one clear next action
- Loading states should include short plain-language text, not spinner only.
- Error states should include user-facing next step.

## Motion
- Keep transitions subtle (`150-250ms`).
- Avoid competing animations in the same viewport.
- Prioritize readability and state change over decoration.
