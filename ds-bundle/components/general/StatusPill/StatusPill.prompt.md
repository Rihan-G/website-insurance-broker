StatusPill from frontend. Use via `window.SindicomUI.StatusPill` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface StatusPillProps {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
}
```
