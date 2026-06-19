ParticleField from frontend. Use via `window.SindicomUI.ParticleField` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ParticleFieldProps {
  count?: number;
  variant?: "rise" | "drift";
  className?: string;
  /** Shorter duration range for gentler but visible motion */
  pace?: "default" | "brisk";
}
```
