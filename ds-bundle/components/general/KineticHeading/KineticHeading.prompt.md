KineticHeading from frontend. Use via `window.SindicomUI.KineticHeading` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface KineticHeadingProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  delay?: number;
}
```
