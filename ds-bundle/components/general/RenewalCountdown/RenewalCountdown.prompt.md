RenewalCountdown from frontend. Use via `window.SindicomUI.RenewalCountdown` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

Compact chip showing days-to-renewal with the same urgency tiers used across the portal.

## Props

```ts
interface RenewalCountdownProps {
  endDate: string;
}
```
