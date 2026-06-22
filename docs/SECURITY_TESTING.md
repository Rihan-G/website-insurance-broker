# Security testing guide

Practical steps for testing this app's security. Run these against a staging environment, not production.

---

## 1. Browser DevTools (no setup required)

- Open Chrome → F12 → **Lighthouse** tab → run a Security audit
- **Network** tab: confirm zero requests over plain HTTP
- **Application** → Cookies: every auth cookie must have `HttpOnly`, `Secure`, and `SameSite=Strict`

---

## 2. Security headers scan

Paste your deployed URL into **https://securityheaders.com** and check for:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS |
| `X-Frame-Options` | Prevents clickjacking |
| `Strict-Transport-Security` | Forces HTTPS |
| `Permissions-Policy` | Restricts browser features |

Cloudflare Pages sets some headers automatically — CSP usually needs manual configuration in `_headers` or `wrangler.toml`.

---

## 3. Supabase RLS audit

In Supabase Studio → **Authentication** → **Policies**: verify every table has RLS enabled and that clients cannot query other clients' rows.

Run this in the SQL editor to find any tables with RLS disabled:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies
);
```

Highest-risk tables to check: `payments`, `profiles`, `documents`, `quotes`.

---

## 4. Dependency audit

Run locally at any time:

```bash
pnpm audit
```

For a detailed report:

```bash
pnpm audit --json > audit-report.json
```

---

## 5. Automated scanners

| Tool | What it finds | Cost |
|------|--------------|------|
| **OWASP ZAP** (desktop) | XSS, CSRF, open redirects, insecure cookies | Free |
| **Mozilla Observatory** — observatory.mozilla.org | HTTP headers, TLS config | Free |
| **Snyk** — snyk.io | Vulnerable npm packages | Free tier |

For a thorough scan, run **OWASP ZAP Active Scan** against the staging URL while authenticated as a broker — it will spider the dashboard and test for the OWASP Top 10.

---

## 6. Manual checks specific to this codebase

### Authentication & roles

- Navigate to `/dashboard` without logging in — must redirect to `/login`
- Manually edit `role` in localStorage and refresh — Supabase RLS must reject the elevated role server-side
- Confirm `VITE_ALLOW_DEMO_LOGIN` is `false` (or unset) in the production build

### Payments

- Open DevTools → Network tab, submit the create-payment-link form, inspect the POST body
- Tamper the `amount` field in the request to a negative or zero value and confirm it is rejected
- Log in as a `client`-role account and confirm the "New Payment Link" button and form are not accessible

### File uploads

- Try uploading a `.html` or `.js` file as a document — it must not be served back with `text/html` content-type (which enables stored XSS)
- Confirm the Supabase Storage `documents` bucket is **private**, not public

### API key exposure

Confirm no secret keys ended up in the built JS:

```bash
grep -r "sk_\|service_role\|secret" frontend/dist/assets/
```

`VITE_SUPABASE_ANON_KEY` appearing is expected (it is the public key). `service_role` must never appear.

---

## 7. TLS / certificate check

Paste your domain into **https://www.ssllabs.com/ssltest/** — aim for an A or A+ rating. Cloudflare handles this automatically for Pages deployments.

---

## Checklist before going live

- [ ] `pnpm audit` returns no critical vulnerabilities
- [ ] Security headers score B or above on securityheaders.com
- [ ] All Supabase tables have RLS enabled
- [ ] `service_role` key is not in any `.env` file committed to git
- [ ] `VITE_ALLOW_DEMO_LOGIN` is not `true` in the production environment
- [ ] Storage bucket `documents` is private
- [ ] SSL Labs rating is A or A+
- [ ] Payment links can only be created by `admin` or `broker` roles
