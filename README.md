# Snowball Arsenal

Full design intelligence + agency + IP payload. 281 files, ~499MB.

## Directories

| Dir | Files | What's Inside |
|-----|-------|-------------|
| `design_studio/` | 41 | Snowball Design sites (Vortex, Prism, Aurora, Oracle, Apex, Forma), SaaS tool, pitch decks, blueprints, client contract/proposal |
| `command_center/` | 29 | Apex Studio v1-v5 (agent OS), Snowball flagship, 8 archetypes, face.js, Supabase schema, backend spec |
| `money_strat/` | 59 | Arbitrage Agency verticals: NexusLogix (logistics), VaultEdge (FinTech/SaaS), MedCore (healthcare), LexBridge (legal). Landing pages, PPTX decks, compliance PDFs, video assets |
| `ucg_suite/` | 15 | UGC ad scripts (100+), 2026 benchmarks, full playbook, PDFs |
| `void_ip/` | 134 | Void Ascendant universe: complete manuscripts, series bibles, chapter outlines, expansion bibles, illustrations |
| `_ai/` | 4 | Lyra companion HTML, speech audio, generated art |

## Why Static HTML?

These sites are **static HTML files** — open any `.html` file in a browser and it works immediately. No build step, no framework, no npm install. In 2026 this is the move:

- **Sub-second load times** — no hydration, no framework JS, no SSR lag
- **Zero hosting cost** — deploy on GitHub Pages, Netlify, Vercel, or any static host for free
- **GEO-ready** — clean HTML, structured data, AI search engines can parse them instantly
- **Client-ready** — show a prospect a working site in 5 minutes, close them same day
- **Composable** — each file is a self-contained template, remix into new combinations instantly

## Architecture (What Needs Wiring)

The HTML sites are 80% production-ready. The remaining 20%:

1. **Backend** — FastAPI or PocketBase for auth, sessions, real data (see `command_center/supabase_schema.sql` and `command_center/apex_backend_spec.py`)
2. **Domain** — point snowball.design or snwbl.io at the static host
3. **Payments** — Stripe integration for SaaS tiers ($149/$499/$999/mo)
4. **Database** — PocketBase (replacing Supabase per current stack)

## Wolf Pack Setup

This repo is part of the Wolf Pack agent system. To set up your own:

```bash
# Clone the core
git clone https://github.com/snowball1452-lgtm/wolfpack-core.git
git clone https://github.com/snowball1452-lgtm/hermes-agent.git
git clone https://github.com/snowball1452-lgtm/hrim-arsenal.git
git clone https://github.com/snowball1452-lgtm/alfred-intel.git
git clone https://github.com/snowball1452-lgtm/copaw-brain.git
git clone https://github.com/snowball1452-lgtm/snowball-arsenal.git  # this repo
```

Each wolf-pack agent has its own SOUL.md and config. See `wolfpack-core` for shared primitives (Redis bus, model router, comms).

## License

MPL-2.0 — use it, fork it, build on it. Freedom > monetization.

