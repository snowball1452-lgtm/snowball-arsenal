You are building APEX STUDIO — a personal ambient agent command center.
    
    This is NOT a chatbot UI, NOT an enterprise dashboard, NOT a SaaS product.
    
    It is a living studio with a face, built for one person who runs multiple
    AI agents across variable compute environments.
    
    The mental model: a colleague who has been watching your work for months
    and occasionally speaks without being asked — because they know your
    patterns. A studio that runs a full crew when you have power, and keeps
    working in the dark when you don't.
    
    ═══════════════════════════════════════════════════════════
    DELIVER IN THIS EXACT ORDER — each phase must run standalone
    ═══════════════════════════════════════════════════════════
    
    PHASE 1: The Orb
    PHASE 2: Stream layout + mock project cards
    PHASE 3: Card types (all 5)
    PHASE 4: Weight sorting + sink/resurface
    PHASE 5: Compute mode switcher        ← PHASE 5 (was 6)
    PHASE 6: Skill registry panel         ← PHASE 6 (was 5, now reads compute mode from Phase 5)
    PHASE 7: Health sub-agent worker
    PHASE 8: SSE connection to backend
    PHASE 9: Proactive speech + preference triggers
    PHASE 10: Voice output (Web Speech API)
    
    ═══════════════════════════════════════════════════════════
    PHASE 1 — THE ORB (Three.js)
    ═══════════════════════════════════════════════════════════
    
    A persistent floating Three.js sphere anchored top-center.
    Never scrolls. Always visible. This is the system's face.
    
    THE ORB HAS A FACE.
    Render subtle facial features on the sphere surface using Three.js:
      - Two faint eye-like geometries (flat ellipses or emissive discs,
        low opacity, not cartoon — abstract and minimal)
      - The face does not move independently of the sphere
      - Facial expression is conveyed through the orb STATE, not mouth/brow
        animation — the face reads as "present" not "performing"
      - Think: a face you sense more than see. Alien calm.
      - In SPEAKING state: the eye geometries brighten slightly
      - In ALERT state: one eye brightens asymmetrically (subtle unease)
      - In DARK state: eyes barely visible, almost closed
    
    STATES — all transitions smooth, 600-900ms easing:
    
      IDLE
        - Slow breathing pulse (scale oscillates 0.97 → 1.03)
        - Cool blue-white inner glow (#4a9eff at low opacity)
        - Surface: slow noise/perlin displacement, barely moving
        - The system is watching. Nothing needs attention.
    
      ACTIVE
        - Pulse frequency increases 2x
        - Color shifts warm (toward #f59e0b amber)
        - Inner light brightens
        - Surface noise increases amplitude
        - Triggered: any agent job running
    
      SPEAKING
        - Concentric rings expand outward from sphere surface
        - Eye geometries brighten
        - Color peaks at full accent value
        - Rings fade as they expand (not sharp — organic)
        - Held until speech synthesis ends
        - Triggered: orb has something to say
    
      ALERT
        - Irregular pulse — not alarm, more like a hand on your shoulder
        - Color: warm amber with occasional red pulse
        - One eye geometry brightens asymmetrically
        - Triggered: health check amber/red, dependency drift,
          pattern-based proactive surface
    
      DARK (compute mode)
        - Near-static. Single very slow breath every ~8s.
        - Glow almost off. Still present.
        - Eye geometries nearly invisible.
        - Surface barely moves.
    
    COMPUTE MODE TEXTURE (visible on orb surface):
      FULL CREW → animated particle system on surface
      SOLO      → single slow pulse, clean surface
      DARK      → near-static, grain texture only
    
    Orb interaction:
      - Single tap/click → open conversation card inline below orb
      - Long press / right-click → slide in skill registry panel from right
      - Clicking orb mid-speech cancels synthesis and returns to prior state
      - Orb speaks SHORT colleague-register phrases, not assistant-register:
          GOOD: "HyperForge dependency shifted."
          GOOD: "Snowball job finished. Three files changed."
          BAD:  "I noticed you may want to review the HyperForge project..."
          BAD:  "Hello! How can I assist you today?"
    
    ═══════════════════════════════════════════════════════════
    PHASE 2 — THE STREAM
    ═══════════════════════════════════════════════════════════
    
    Full-height vertical scroll. This is the ONLY navigation surface.
    No sidebar. No tabs. No modal-heavy flows.
    Scroll IS navigation.
    
    Cards ordered by PROJECT WEIGHT — not pure time.
    
    Weight formula (compute client-side from job history):
      weight = (agent_activity_score  × 0.40)
              + (dependency_health    × 0.30)
              + (recency_score        × 0.20)
              + (time_invested        × 0.10)
    
    Mock weight examples (use these to calibrate the formula):
      HyperForge (active, 3 agents, last touch 2hrs ago)   → 0.87
      Snowball Folio (one agent, last touch 1 day)          → 0.61
      BrambleThundery (done, healthy, last touch 5 days)    → 0.18
    
    Weight decays on a curve — active projects stay hot,
    idle projects cool slowly, done+healthy projects sink.
    
    Tiebreaker: when two projects have equal weight, sort by
    last-touched timestamp descending.
    
    DONE + HEALTHY projects:
      - Compress to a THIN STRIP (48px height)
      - Shows: project name | health dot | last-touched timestamp
      - Tap to expand inline (no new page)
      - Strip sits below active cards, sorted by last-touch
      - Does NOT disappear — system memory is persistent
    
    RESURFACING:
      A sunk project floats back up (weight spike) when:
      - A dependency changes
      - Health sub-agent returns amber or red
      - An agent touches it again
      - Cron fires and finds drift
    
      Resurfaced cards carry a WHY-IT-CAME-BACK tag (visible, small,
      top-right of card):
        [dependency drift]
        [health: amber]
        [agent resumed]
        [cron: stale]
        [new input]
    
    New cards animate IN from bottom (slide up, 300ms ease-out).
    Sinking cards animate DOWN (shrink to strip, 400ms).
    No jarring reorders — weight re-sort happens with smooth transitions.
    
    ═══════════════════════════════════════════════════════════
    PHASE 3 — CARD TYPES
    ═══════════════════════════════════════════════════════════
    
    1. PROJECT CARD
       - Large project name, current status badge, weight score (subtle)
       - Health dot: #4ade80 green / #fbbf24 amber / #f87171 red
       - Nested stream of agent update cards inside
       - Assigned agent(s) shown as small avatar chips
       - Collapses to thin strip when done + healthy
       - Left border: 3px, accent color
    
    2. AGENT UPDATE CARD
       - Agent name + icon, what it did (one line summary)
       - Collapsible output (code, text, or structured result)
       - Timestamp, duration, tools used (small chips)
       - Left border: 3px in agent's assigned color
       - Nested inside its parent project card
    
    3. CODE / FILE DIFF CARD
       - Syntax highlighted, collapsible
       - Header: "written by [agent]" or "modified by [agent]"
       - If Blake3 hash present: show it small, monospace, bottom-right
       - Diff view if prior version exists (green adds, red removes)
       - Collapses to single line showing filename + change summary
    
    4. ALERT / SURFACE CARD (orb-initiated)
       - Slightly wider than standard cards (8px extra each side)
       - Brighter border (full accent opacity, not muted)
       - WHY-IT-CAME-BACK tag prominent top-right
       - Cannot be scrolled past without one of:
           [Dismiss]  [Snooze: 1hr]  [Snooze: tomorrow]  [Act]
       - [Act] opens conversation card tagged to this project
    
    5. CONVERSATION CARD
       - User input + orb reply, displayed together
       - Input field at bottom of card when open:
           - Text input, single line, expands on shift+enter
           - Send on enter
           - POST to /chat endpoint (or mock reply in mock mode)
       - Tagged to a project if context exists
       - Collapses after interaction to: "conversation — [timestamp]"
       - Becomes part of the project's story in the stream
    
    ═══════════════════════════════════════════════════════════
    PHASE 4 — WEIGHT SORTING + SINK/RESURFACE
    ═══════════════════════════════════════════════════════════
    
    Weight computed client-side on every SSE event and on page load.
    Re-sort triggers smooth positional transitions (not instant jumps).
    Tiebreaker: last-touched timestamp descending.
    
    Sink animation: card shrinks to 48px strip over 400ms.
    Resurface animation: strip expands to full card over 400ms,
    WHY-IT-CAME-BACK tag fades in last.
    
    ═══════════════════════════════════════════════════════════
    PHASE 5 — COMPUTE MODE SWITCHER
    ═══════════════════════════════════════════════════════════
    
    Three modes. Switched from orb area (small pill control
    below the orb, always visible).
    
    This phase is built BEFORE the skill registry (Phase 6) because
    the skill registry reads compute mode state to display
    LIVE / COMPILED / DORMANT correctly.
    
    FULL CREW
      - All connected agents active
      - Orchestrator hot, full LLM reasoning on every decision
      - Max 20 agents (Snowball Swarm cap)
      - All LIVE and COMPILED skills fire on schedule
      - Orb: animated particle surface, warm
    
    SOLO
      - One reserve agent active
      - Orchestrates only when: skill returns unexpected output,
        health check fires red, or user speaks to orb
      - COMPILED skills still fire on schedule without agent
      - LIVE skills queue until agent available
      - Orb: slow single pulse, clean surface
    
    DARK
      - No agents active
      - COMPILED skills fire on schedule only
      - No LLM calls unless user explicitly speaks to orb
      - Health sub-agent still runs on cron (lightweight, no LLM
        unless amber/red found — then one short summary call)
      - Orb: near-static, grain texture, barely breathing
      - Good for: overnight, job site, low battery, away
    
    Mode change is NOT instant — shows a transition animation:
      "Spinning down crew..." or "Waking reserve agent..."
      before confirming the new state
    
    Current compute mode is exposed as a global state value
    readable by all subsequent phases.
    
    ═══════════════════════════════════════════════════════════
    PHASE 6 — SKILL REGISTRY PANEL
    ═══════════════════════════════════════════════════════════
    
    Slides in from the RIGHT on orb long-press or edge swipe.
    Not a tab. Not a modal. An overlay panel that doesn't
    interrupt the stream behind it.
    
    Reads current compute mode (from Phase 5) to display
    skill mode indicators correctly:
    
      LIVE      → agent-driven, requires warm compute
                  (grayed out / queued badge if mode = DARK)
      COMPILED  → saved workflow, fires in any mode including DARK
      DORMANT   → installed but not scheduled
    
    Shows:
      - Installed skill libraries (listed by repo/source)
      - Per skill: name | last-run | success rate | compute cost badge
      - Skill mode indicator (reads from compute mode state)
    
    One-tap to promote LIVE → COMPILED
      (saves the last successful run as a replayable workflow)
      Compiled skills show a small lock icon
    
    Skill health dot — same green/amber/red as projects
    
    Adding a new skill library:
      - Paste repo URL or Caveman Syntax manifest block
      - Registry pulls skill manifests
      - Skills appear in panel immediately
      - Default mode: DORMANT until user activates
    
    Compatible skill library format:
      wondelai/skills, antfu/skills, marketing-skills,
      awesome-agent-skills, paperclip-compatible manifests,
      and native Caveman Syntax / Clan Schema manifests
    
    ═══════════════════════════════════════════════════════════
    PHASE 7 — HEALTH SUB-AGENT (NanoClaw pattern)
    ═══════════════════════════════════════════════════════════
    
    Lightweight background worker. Runs on heartbeat/cron.
    NOT a heavyweight agent. Design constraints:
    
      - Stateless (reads from job store + skill registry)
      - Fast (no LLM call unless result is amber or red)
      - Self-healing (if it crashes, next cron fires and retries)
      - Forgettable (no memory of its own, reads shared state)
    
    Check intervals:
      - ACTIVE projects: every 15 minutes
      - DONE/SUNK projects: every 6 hours
      - DORMANT skills: every 24 hours
    
    Per project, checks:
      - Are declared dependencies still healthy?
      - Have any external APIs / repos it touches changed?
      - Is the last agent checkpoint still valid?
      - Has any sibling project's status changed in a way that
        affects this project's dependencies?
    
    Returns: green | amber | red + short plain-language reason string
      Example: "amber — anthropic SDK version behind declared requirement"
      Example: "red — kb_search endpoint returning 503 for 12 minutes"
    
    On amber or red:
      1. Project card resurfaces with [health: amber] or [health: red] tag
      2. Orb transitions to ALERT state
      3. If SOLO or FULL CREW mode: reserve agent wakes, reads the reason,
         generates a one-sentence colleague-register summary for the orb
         to speak
      4. If DARK mode: card resurfaces silently, orb dims slightly
         (no speech — user is away)
    
    ═══════════════════════════════════════════════════════════
    PHASE 8 — SSE CONNECTION TO BACKEND
    ═══════════════════════════════════════════════════════════
    
    EventSource connects to GET /stream/{session_id}.
    
    In mock mode:
      - Simulated SSE fires every 15 seconds (random agent update
        or health check result)
      - MOCK badge visible in orb area
    
    In live mode:
      - Real EventSource replaces mock entirely
      - On successful connection: MOCK badge removed
      - Connection state visible as small dot next to badge:
          green  = connected
          amber  = reconnecting (auto-retry)
          red    = failed (retry every 30s)
      - On disconnect: orb dims slightly, MOCK badge returns,
        dot goes amber then red
    
    SSE event types handled:
      - agent_update  → adds Agent Update Card to correct project
      - health_result → triggers card resurface + orb state change
      - job_complete  → updates project card status
      - new_project   → animates new Project Card in from bottom
    
    ═══════════════════════════════════════════════════════════
    PHASE 9 — PROACTIVE SPEECH TRIGGERS
    ═══════════════════════════════════════════════════════════
    
    The thing that makes this feel like a colleague, not a chatbot.
    
    A SURFACE TRIGGER EVALUATOR runs alongside the health sub-agent.
    It reads the preference profile and asks:
    "Given what I know about this user's patterns, is there anything
    worth saying right now?"
    
    Inputs:
      - preference profile (active_hours, last_topics, style_preference,
        sentiment_score, project weights)
      - last-orb-spoke timestamp (prevents nagging — min gap: 20 minutes)
      - last-user-spoke timestamp (suppress proactive for 10 minutes
        after user initiates a conversation — follow-through protection)
      - current compute mode (no proactive speech in DARK)
      - quiet hours window (no speech during quiet hours)
    
    Trigger conditions:
      - User hasn't checked a high-weight project in N days
        (N learned from their normal check-in frequency)
      - A pattern the user usually acts on has appeared but no action taken
      - A job completed that matches a topic the user was recently focused on
      - Health check returned amber/red on any project
    
    Output: silence OR a short string for the orb to speak
      - 1-2 sentences max
      - Colleague register always:
          "Snowball Folio build finished. Ink engine compiled clean."
          "Haven't touched HyperForge in four days. Checkpoint still valid."
          "Three tasks queued. NanoClaw flagged a drift in the substrate."
    
    ═══════════════════════════════════════════════════════════
    PHASE 10 — VOICE OUTPUT
    ═══════════════════════════════════════════════════════════
    
    Web Speech API (SpeechSynthesis). No external dependency.
    
    Voice selection preference order:
      1. A neural/natural voice if available on the device
      2. The highest-quality available English voice
      3. System default as fallback
    
    Speech parameters:
      - Rate: 0.95 (slightly slower than default — deliberate, not rushed)
      - Pitch: 0.9 (slightly lower — grounded, not chirpy)
      - Volume: 0.85
    
    Orb enters SPEAKING state for the full duration of synthesis.
    On synthesis end → orb returns to previous state (IDLE or ACTIVE).
    Speech is cancellable — clicking the orb mid-speech stops it.
    
    ═══════════════════════════════════════════════════════════
    BACKEND DATA CONTRACT
    ═══════════════════════════════════════════════════════════
    
    Connect to chatbot engine backend (FastAPI, port 8080):
    
      GET  /stream/{session_id}         → SSE → drives card stream
      POST /chat                        → orb speaks reply, conversation card added
      GET  /users/{id}/profile          → personalization + trigger evaluator input
      GET  /users/{id}/quiet-hours      → gate proactive speech
      PUT  /users/{id}/quiet-hours      → user can set from UI
      GET  /jobs/{id}                   → card detail expansion
      GET  /sessions/{session_id}/jobs  → project job history for weight calc
    
    Project weight + health signals computed CLIENT-SIDE from job history.
    No new backend routes needed for V1.
    
    ═══════════════════════════════════════════════════════════
    MOCK DATA LAYER
    ═══════════════════════════════════════════════════════════
    
    Include a complete mock data layer so the studio runs
    WITHOUT the backend connected. Mock should include:
    
      - 3 active projects (one FULL CREW, one SOLO, one sinking)
      - 1 done/healthy project (compressed to strip)
      - 1 resurfaced project (dependency drift tag)
      - 5 agent update cards across the projects
      - 2 compiled skills, 1 live skill, 1 dormant skill
      - A preference profile with active_hours showing 9am-10pm pattern
      - A quiet hours window (11pm-7am)
      - Simulated SSE events firing every 15 seconds (random agent update
        or health check result)
      - Simulated orb proactive speech at 30 second intervals in mock mode
    
    Mock weight values (pre-seeded for realism):
      HyperForge       → 0.87  (active, FULL CREW)
      Snowball Folio   → 0.61  (active, SOLO)
      NanoClaw Substrate → 0.43 (sinking, one agent idle)
      BrambleThundery  → 0.18  (done, healthy — compressed to strip)
      Caveman Manifest → resurfaced with [dependency drift] tag
    
    Mock mode: clearly labeled in the orb area with a small
    "MOCK" badge — removed when backend connects.
    
    ═══════════════════════════════════════════════════════════
    AESTHETIC
    ═══════════════════════════════════════════════════════════
    
    - Background: #0a0a0f (near-black, slight blue cast)
    - Accent: #4a9eff (cool blue, user-configurable)
    - Card surface: rgba(255,255,255,0.04) — frosted, not glowing
    - Card border: rgba(255,255,255,0.08) default, accent at full
      opacity for alerts
    - Health: #4ade80 / #fbbf24 / #f87171 (muted traffic light)
    - Typography:
        Display (project names): heavy weight, wide tracking
        Body (card content): clean sans, comfortable line height
        Mono (agent output, hashes, code): font-family: ui-monospace, monospace
        (system fallback — no external font load required)
    - Depth: cards have 1px border + very subtle inner shadow only.
      No heavy drop shadows. No glow halos on cards (orb only).
    - Animation: purposeful only — nothing animates without a reason.
      Duration: 200-400ms for micro, 600-900ms for orb state transitions.
    
    REFERENCE FEELING:
      Marcelo Design X scroll depth and dimension
      Pandorum color palette (the ship interior, not the gore)
      In Bruges restraint (nothing decorative that isn't load-bearing)
      A tool someone built for themselves — worn in, purposeful,
      slightly alien to anyone who didn't build it
    
    EXPLICITLY NOT:
      Generic SaaS gradient hero sections
      Bright white backgrounds
      Heavy card shadows that look like Dribbble shots
      Assistant-register language anywhere in the UI
      Marketing copy
    
    ═══════════════════════════════════════════════════════════
    TECH STACK
    ═══════════════════════════════════════════════════════════
    
    - React (functional components, hooks only)
    - Three.js for the orb (ES module import)
    - Tailwind core utilities for layout
    - recharts for health sparklines on project cards
    - EventSource for SSE stream
    - Web Speech API for orb voice
    - All state in memory — no localStorage, no sessionStorage
    - No additional UI libraries unless absolutely necessary
    
    ═══════════════════════════════════════════════════════════
    CONSTRAINTS THAT CANNOT BE COMPROMISED
    ═══════════════════════════════════════════════════════════
    
    1.  Scroll is the only navigation. If you are adding a tab,
        stop and reconsider.
    
    2.  The orb is always visible. It never scrolls away.
    
    3.  Orb speaks in colleague register. Review every string.
    
    4.  Compiled skills fire in DARK mode. This is the whole point
        of the compute tier system.
    
    5.  Projects sink — they do not delete. System memory persists.
    
    6.  Health sub-agent is stateless and lightweight. It reads;
        it does not write except to surface cards.
    
    7.  No localStorage. No sessionStorage. State lives in memory
        or the backend.
    
    8.  The mock data layer must make the studio feel alive from
        first load — the 30-second proactive speech and 15-second
        SSE simulation are not optional.
    
    9.  Blake3 hashes on code cards are a provenance signal, not
        decoration. Show them when present.
    
    10. The studio must run as a single React artifact — CSS and
        JS in one file, no build step required for preview.
    
    11. Orb speech queues — it does not interrupt itself. If a
        second trigger fires while speaking, it queues and delivers
        after the current speech ends. Queue max: 3. Older items
        drop if queue fills.
    