LanguageSwitcher from frontend. Use via `window.SindicomUI.LanguageSwitcher` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

EN / FR / Kreol switcher for the public marketing site, mirroring the dashboard switcher.

## Props

```ts
interface LanguageSwitcherProps {
  /** When set, used for layout classes (e.g. nav on dark hero) */
  variant?: "default" | "onDark";
  className?: string;
}
```
