DashboardAccessSentinel from frontend. Use via `window.SindicomUI.DashboardAccessSentinel` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

- **Unified** (default): clients cannot open staff dashboard segments (same origin).
- **Client portal host**: any signed-in user hitting a staff URL is sent to `VITE_STAFF_PORTAL_URL` + path when set.
- **Staff portal host**: anyone hitting a client-only segment (e.g. my-policies) is sent to `VITE_CLIENT_PORTAL_URL` + path when set.

## Props

```ts
interface DashboardAccessSentinelProps {
  children: React.ReactNode;
}
```
