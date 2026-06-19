WaveDivider from frontend. Use via `window.SindicomUI.WaveDivider` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface WaveDividerProps {
  topColor?: string;
  bottomColor?: string;
  flip?: boolean;
  height?: number;
}
```
