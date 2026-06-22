RoleGuard from frontend. Use via `window.SindicomUI.RoleGuard` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<MemoryRouter>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "broker" | "client")[];
  fallback?: string;
}
```
