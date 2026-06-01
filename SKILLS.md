# Agent skills for SecureBroker

Cursor loads skills from [`.agents/skills/`](.agents/skills/) and [`.cursor/skills/`](.cursor/skills/). Invoke any skill with **`/skill-name`** in chat (e.g. `/ui-ux-pro-max`, `/impeccable polish`).

Install or refresh skills with the [skills CLI](https://github.com/vercel-labs/skills) when Node is available:

```bash
npx skills add nextlevelbuilder/ui-ux-pro-max-skill -a cursor
npx skills add emilkowalski/skill -a cursor
npx skills add pbakaus/impeccable -a cursor
npx skills add leonxlnx/taste-skill -a cursor
npx skills add hardikpandya/stop-slop -a cursor
npx skills add remotion-dev/skills -a cursor
npx skills add muratcankoylan/Agent-Skills-for-Context-Engineering -a cursor
```

After adding skills, **Developer: Reload Window** so Cursor picks them up.

## Core design & UX (requested)

| Skill | Folder | Use when |
|-------|--------|----------|
| **UI/UX Pro Max** | `ui-ux-pro-max` | Planning or building UI — palettes, typography, stacks, UX guidelines, shadcn patterns |
| **Emil Kowalski** | `emil-design-eng` | UI polish, motion, component feel, animation decisions |
| **Impeccable** | `impeccable` (+ [`.cursor/skills/impeccable`](.cursor/skills/impeccable)) | Design vocabulary: `/impeccable polish`, `audit`, `critique`, `bolder`, `quieter`, etc. Set design context in [`.impeccable.md`](.impeccable.md) when prompted |
| **Taste** | `design-taste-frontend`, `gpt-taste`, `stitch-design-taste` | Anti-generic UI; editorial typography, motion, layout discipline |
| **Marketing / brand** | `ckm-brand` (+ `ckm-banner-design`, `ckm-slides`) | Brand voice, messaging, banners, social/marketing assets |
| **Stop slop** | `stop-slop` | Humanize marketing copy and docs — remove AI writing tells |

## Video (optional)

| Skill | Folder | Use when |
|-------|--------|----------|
| **Remotion** | `remotion-best-practices` | Programmatic video in React — compositions, captions, charts, transitions |

## Context engineering

| Skill | Folder | Use when |
|-------|--------|----------|
| **Collection index** | `context-engineering-collection` | Overview and routing across context skills |
| **Fundamentals** | `context-fundamentals` | Context windows, budgeting, agent architecture |
| **Degradation** | `context-degradation` | Lost-in-middle, poisoning, debugging agent failures |
| **Compression** | `context-compression` | Long sessions, compaction, token reduction |
| **Optimization** | `context-optimization` | Masking, caching, efficient tool output |
| **Tool design** | `tool-design` | Designing tools agents can use reliably |
| **Multi-agent** | `multi-agent-patterns` | Coordinator/worker and peer patterns |
| **Memory** | `memory-systems` | Long-term and graph memory for agents |
| **Evaluation** | `evaluation`, `advanced-evaluation` | Measuring agent quality |
| **Harness** | `harness-engineering` | Reliable agent operating loops |

Additional skills from the same collection: `bdi-mental-states`, `filesystem-context`, `hosted-agents`, `latent-briefing`, `project-development`.

## Related skills already in repo

| Skill | Folder | Notes |
|-------|--------|-------|
| CKM design system | `ckm-design-system`, `ckm-ui-styling`, `ckm-design` | Tokens, shadcn, slides, logos |
| Redesign | `redesign-existing-projects`, `high-end-visual-design`, `minimalist-ui` | Upgrade existing pages |
| Image → code | `image-to-code`, `imagegen-frontend-web` | Reference-driven builds |
| Output quality | `full-output-enforcement` | Avoid truncated codegen |

Sources are tracked in [`skills-lock.json`](skills-lock.json).
