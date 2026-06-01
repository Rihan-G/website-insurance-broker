# Cursor plugins for SecureBroker

Recommended plugins: [`.cursor-plugin/marketplace.json`](.cursor-plugin/marketplace.json). Agent skills: [SKILLS.md](SKILLS.md).

## Your install batch (12 plugins)

These are declared in `metadata.installBatch` in the marketplace file. **The agent cannot run `/add-plugin` for you** — enable each plugin in Cursor:

1. **Settings → Plugins** → search the name → **Add / Enable**, **or**
2. Send **one** `/add-plugin <name>` per chat message and confirm the install prompt.

| # | Command | MCP? | Notes |
|---|---------|------|-------|
| 1 | `/add-plugin supabase` | Yes | Already wired in [`.cursor/mcp.json`](.cursor/mcp.json) for project `stjycutmrkcfitebqpzx` |
| 2 | `/add-plugin shadcn` | Yes | Registry search, component install |
| 3 | `/add-plugin browse` | Yes | Browser automation; may need Browserbase auth |
| 4 | `/add-plugin cursor-team-kit` | No | CI, review, verify-this, smoke tests |
| 5 | `/add-plugin figma` | Yes | OAuth on first use; Figma URL also in `mcp.json` |
| 6 | `/add-plugin vercel` | Yes | Deployments, env vars, Vite guidance |
| 7 | `/add-plugin pstack` | No | `/how`, `/why`, `/unslop` workflows |
| 8 | `/add-plugin agent-compatibility` | No | Repo startup/docs audits |
| 9 | `/add-plugin continual-learning` | No | AGENTS.md memory updates |
| 10 | `/add-plugin docs-canvas` | No | Architecture canvases |
| 11 | `/add-plugin create-plugin` | No | Plugin scaffolding |
| 12 | `/add-plugin 1password` | Yes | Secret injection hooks |

After enabling all 12: **Developer: Reload Window**.

### Verify

- **Settings → Plugins** — all 12 listed and enabled.
- **Settings → MCP** — Supabase, Figma, shadcn, Browse, Vercel appear when their plugins are on.
- First MCP use: complete OAuth for Supabase, Figma, 1Password as prompted.

## Optional plugins (not in your batch)

```
/add-plugin cloudflare
/add-plugin cursor-sdk
/add-plugin tierzero
/add-plugin notion-workspace
/add-plugin vantage
/add-plugin huggingface-skills
/add-plugin forge-skills
```

## What each batch plugin adds

| Plugin | Purpose |
|--------|---------|
| `supabase` | Database, auth, storage, migrations, Edge Functions |
| `shadcn` | shadcn/ui registry, install, audits |
| `browse` | Local UI verification via browser MCP |
| `cursor-team-kit` | CI loops, PR review, verify-this, smoke tests |
| `figma` | Design-to-code, Figma MCP, Code Connect |
| `vercel` | Deployments, env vars, AI SDK patterns |
| `pstack` | Deep planning before coding |
| `agent-compatibility` | Repo compatibility scans |
| `continual-learning` | Keeps AGENTS.md in sync |
| `docs-canvas` | Documentation canvases |
| `create-plugin` | Plugin authoring |
| `1password` | Secure env / secret injection |

## Local plugin

- `securebroker-dev` — `~/.cursor/plugins/local/securebroker-dev/` (project rules from AGENTS.md)
