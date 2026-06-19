QuoteComparePanel from frontend. Use via `window.SindicomUI.QuoteComparePanel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface QuoteComparePanelProps {
  quotes: QuoteCompareRow[];
}
```
