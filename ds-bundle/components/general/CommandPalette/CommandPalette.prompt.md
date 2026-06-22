CommandPalette from frontend. Use via `window.SindicomUI.CommandPalette` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```
