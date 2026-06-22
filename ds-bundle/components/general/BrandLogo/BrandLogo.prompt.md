BrandLogo from frontend. Use via `window.SindicomUI.BrandLogo` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

Sindicom logo from `public/brand/` (logo.svg → logo.png), with shield fallback.

## Props

```ts
interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  /** Accessible label; defaults to decorative (empty alt). */
  label?: string;
}
```
