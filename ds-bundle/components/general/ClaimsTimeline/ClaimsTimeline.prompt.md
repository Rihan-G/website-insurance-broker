ClaimsTimeline from frontend. Use via `window.SindicomUI.ClaimsTimeline` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ClaimsTimelineProps {
  status: string;
  createdAt: string;
}
```
