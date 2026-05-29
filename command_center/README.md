# SNOWBALL + APEX STUDIO — Complete Build
    ## 2027 Edition · Built by Chad Snowball
    
    ---
    
    ## FILE MANIFEST — EVERYTHING BUILT
    
    ### APEX STUDIO (Agent OS)
    | File | Description | Open In |
    |------|-------------|---------|
    | `apex_studio_v5.html` | **THE ONE** — Full 2027 build, 108KB. 3D morphable face, all panels, every 2027 feature | Chrome/Edge |
    | `apex_studio_v4.html` | V4 — Tony Stark OS with orchestrator panels | Chrome/Edge |
    | `apex_studio_v3.html` | V3 — Full command center | Chrome/Edge |
    | `apex_studio_v2.html` | V2 — 3D face introduced | Chrome/Edge |
    | `apex_studio.html` | V1 — Original sphere | Chrome/Edge |
    | `apex-face-states.js` | Standalone face state engine | Reusable module |
    
    ### SNOWBALL DESIGN INTELLIGENCE
    | File | Description |
    |------|-------------|
    | `snowball_flagship_v2.html` | Hero site — full 2027 version, all 8 archetypes, pricing, DFY |
    | `snowball_archetypes_all.html` | All 8 archetypes with component demos, token exports, copy register |
    | `snowball_marketplace.html` | Template marketplace — Stripe-ready product grid |
    | `marcello_archetype.html` | Marcello Dark Precision — full component library |
    
    ### BACKEND
    | File | Description |
    |------|-------------|
    | `apex_backend_spec.py` | Complete FastAPI backend — all 13 routes, SSE, jobs, health, skills |
    | `supabase_schema.sql` | Complete Postgres schema — 12 tables, RLS, weight function, pgvector |
    
    ---
    
    ## OPEN ORDER (browser)
    
    1. `apex_studio_v5.html` — The complete OS. Chrome/Edge required for Web Speech API.
    2. `snowball_flagship_v2.html` — The hero site.
    3. `snowball_archetypes_all.html` — All 8 archetypes with tokens.
    4. `snowball_marketplace.html` — The Stripe-ready product grid.
    
    ---
    
    ## APEX STUDIO V5 — EVERY 2027 FEATURE
    
    ### The 3D Face
    - Head, eyes (blink), brows (furrow), nose, mouth (lip sync)
    - 5 states: IDLE / ACTIVE / SPEAKING / ALERT / DARK
    - Gaze tracking — eyes follow your mouse cursor
    - Iris dilation by compute load (FULL CREW = dilated)
    - ALERT = asymmetric eye color (amber left, blue right)
    - Speaking rings (3-pool, organic fade)
    - Particle cloud (FULL CREW mode only)
    - Aura ring, rotating
    
    ### The OS Panels
    | Panel | Contents |
    |-------|----------|
    | MCP | 4 protocol servers, tool chips, latency, inspector log |
    | CRM | Pipeline stages, 4 contacts, hot/warm/cool signals |
    | SKILLS | LIVE/COMPILED🔒/DORMANT per compute mode |
    | SIGNALS | External signals (GitHub, Stripe, HN, Awwwards) |
    | MEMORY | Spatial memory graph — nodes, edges, confidence decay |
    | STREAM | Weight-sorted projects, all 5 card types, WHY tags, Blake3 hashes |
    | KANBAN | 5 columns, drag-and-drop, priority dots |
    | MSG BUS | Agent message stream, broadcast input |
    | ORCH | Live orchestrator flow, NLU bars, job queue |
    | PROVENANCE | Full Blake3 chain of custody per file |
    | REPLAY | Compiled skill step-by-step replay viewer |
    | AGENTS | 5 agents, running/idle, token counts |
    | HEALTH | Sub-agent feed, plain-language reasons |
    | SSE | Real-time event log |
    | OBSIDIAN | Role/intent/tools per message |
    | PREFS | Preference profile, 24h activity bar |
    | NEGOTIATION | Agent-to-agent protocol visibility |
    
    ### 2027 Features (all built)
    - [x] Gaze tracking (eyes follow mouse)
    - [x] Push-to-talk (SPACE key) + Web Speech API
    - [x] Wake word simulation (W key in demo)
    - [x] Ambient perception (tab focus, idle, scroll detection)
    - [x] Spatial memory graph (nodes, edges, confidence decay)
    - [x] Predictive weight surface (last-touched tiebreaker)
    - [x] External signal ingestion (GitHub, Stripe, HN, Awwwards)
    - [x] Agent-to-agent negotiation visibility panel
    - [x] Compiled skill replay viewer (step-by-step, $0.00 cost shown)
    - [x] Full provenance chain (Blake3, written by, verified by, last human)
    - [x] Compound context banner (relationship graph insights)
    - [x] Speech queue (max 3, no self-interrupt, drop oldest)
    - [x] 10min post-user-spoke cooldown
    - [x] DARK mode gate (no speech, no LLM, compiled skills only)
    - [x] SSE mock at 15s (corrected from 8s)
    - [x] Proactive speech at 30s mock intervals
    - [x] Mode transition overlay ("Spinning down crew...")
    
    ---
    
    ## BACKEND DEPLOYMENT
    
    ### Railway.app (recommended)
    ```bash
    # 1. Push to GitHub
    git init && git add . && git commit -m "APEX Studio 2027"
    git remote add origin https://github.com/yourusername/apex-studio
    git push -u origin main
    
    # 2. Connect Railway to GitHub repo
    # 3. Set environment variables in Railway dashboard
    # 4. Deploy — zero config, auto-detects FastAPI
    
    # Environment variables needed:
    ANTHROPIC_API_KEY=sk-ant-...
    SUPABASE_URL=https://xxx.supabase.co
    SUPABASE_KEY=eyJ...
    STRIPE_SECRET_KEY=sk_live_...
    REDIS_URL=redis://...
    PORT=8080
    ```
    
    ### Supabase setup
    ```bash
    # 1. Create project at supabase.com
    # 2. Run supabase_schema.sql in SQL Editor
    # 3. Enable pgvector extension
    # 4. Copy URL + anon key to Railway env vars
    ```
    
    ---
    
    ## COMMERCIALIZATION — NEXT STEPS
    
    ### This week (first dollar)
    1. Domain: snowball.design or snwbl.io
    2. Deploy snowball_flagship_v2.html to Vercel
    3. Create Stripe products (all prices in spec)
    4. Add real Stripe links to snowball_marketplace.html
    5. Post APEX Studio screen capture on X/Twitter
    
    ### Month 1 (first $2,500)
    1. First DFY client — Snowball Starter at $2,500
    2. One template on Gumroad at $497
    3. 10 beta subscribers at $49/mo (waitlist)
    
    ### Month 2-3 (MRR target: $1,490)
    1. All 8 archetypes live
    2. 10 Studio subscribers = $1,490/mo MRR
    3. ProductHunt launch
    
    ### Month 6 ($10K MRR target)
    1. Agency licenses ($4,997 × 3 = $14,991 one-time)
    2. 30 SaaS subscribers = $4,470/mo recurring
    3. 2 DFY/month = $9,000/mo
    
    ---
    
    ## CONSTRAINTS CONFIRMED
    
    1. Scroll is the only navigation — no tabs in stream
    2. Orb (face) always visible — never scrolls
    3. Colleague register only — reviewed every string
    4. Compiled skills fire in DARK mode — the whole point
    5. Projects sink, never delete — system memory persists
    6. Health sub-agent: stateless, lightweight, no LLM unless amber/red
    7. No localStorage, no sessionStorage — state in memory or backend
    8. Mock mode feels alive from first load — 15s SSE, 30s speech
    9. Blake3 hashes on code cards — provenance, not decoration
    10. Single artifact — no build step required
    11. Speech queue max 3 — no self-interrupt, drop oldest
    
    ---
    
    *Built in SuperCool · Chad Snowball · 2027*
    