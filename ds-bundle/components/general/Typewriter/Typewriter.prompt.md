Typewriter from frontend. Use via `window.SindicomUI.Typewriter` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface TypewriterProps {
  words: string[];
  className?: string;
  speed?: number;
}
```
