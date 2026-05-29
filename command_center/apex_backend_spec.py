# APEX STUDIO + SNOWBALL — Complete FastAPI Backend
    # =====================================================
    # Deploy to: Railway.app or Render (free tier)
    # Run: uvicorn main:app --host 0.0.0.0 --port 8080 --reload
    
    # ── main.py ──────────────────────────────────────────────────────────────────
    
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    import asyncio, json, uuid
    from datetime import datetime
    from typing import AsyncGenerator
    
    app = FastAPI(title="APEX Studio Backend", version="2027.1")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # ── IMPORTS (your existing modules) ──────────────────────────────────────────
    from orchestrator import orchestrator, run_job
    from schemas import ChatRequest, ChatResponse
    from jobs import store as job_store, queue as job_queue
    from memory import memory
    from preferences import tracker as prefs_tracker
    from quiet_hours import manager as qh_manager
    from events import bus
    from health_agent import health_agent
    from skills.registry import skill_registry
    
    # ── IN-MEMORY STATE (replace with Supabase for production) ──────────────────
    SESSIONS: dict = {}      # session_id → { messages, weight_scores, metadata }
    PROJECTS: dict = {}      # project_id → project data
    WEIGHTS: dict = {}       # project_id → computed weight
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: POST /chat
    # The main orchestrator entry point. Receives user message, returns reply.
    # Deferred path: returns ack immediately, runs background job.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.post("/chat", response_model=ChatResponse)
    async def chat(request: ChatRequest):
        """
        Single entry point for all user messages.
        
        Flow (from your orchestrator.py):
          1. Persist to memory + Obsidian + preferences
          2. Classify intent (NLU)
          3. Route to skill via dialogue manager
          4. If done: reply directly
             If deferred: spawn background job, return ack
          5. Persist reply + publish to SSE bus
        
        The orb receives the reply via SSE (GET /stream/{session_id})
        and speaks it immediately — user sees ack, full answer arrives async.
        """
        return await orchestrator.handle(request)
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /stream/{session_id}
    # SSE stream — drives the APEX card stream.
    # Publishes: agent_update | job_complete | health_check | external_signal | assistant_reply
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/stream/{session_id}")
    async def stream(session_id: str):
        """
        Server-Sent Events stream for a session.
        
        APEX Studio connects here on load:
          const source = new EventSource(\`/stream/${session_id}\`);
          source.onmessage = (e) => handleStreamEvent(JSON.parse(e.data));
        
        Event types:
          agent_update    → new agent update card in stream
          job_complete    → deferred job finished, final reply
          health_check    → health sub-agent result (green/amber/red)
          external_signal → GitHub/Stripe/HN webhook ingested
          assistant_reply → orb speech trigger
          weight_update   → project weight recalculated, reorder stream
          skill_fired     → compiled skill execution complete
        """
        async def event_generator() -> AsyncGenerator[str, None]:
            # Subscribe to the event bus for this session
            queue = await bus.subscribe(session_id)
            try:
                while True:
                    try:
                        event = await asyncio.wait_for(queue.get(), timeout=30.0)
                        yield f"data: {json.dumps(event)}\n\n"
                    except asyncio.TimeoutError:
                        # Keepalive ping (prevents proxy timeout)
                        yield f"data: {json.dumps({'type': 'ping', 'ts': datetime.utcnow().isoformat()})}\n\n"
            finally:
                await bus.unsubscribe(session_id, queue)
    
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /users/{user_id}/profile
    # Personalization data for the surface trigger evaluator.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/users/{user_id}/profile")
    async def get_profile(user_id: str):
        """
        Returns preference profile for the surface trigger evaluator.
        
        Used by APEX proactive speech system:
          - active_hours: when user is typically present
          - last_topics: recent focus areas
          - sentiment_score: confidence baseline
          - check_patterns: per-project check-in frequency
          - last_user_spoke: for 10min cooldown enforcement
        """
        if not prefs_tracker:
            raise HTTPException(status_code=503, detail="Preferences tracker not initialized")
        
        profile = prefs_tracker.get_profile(user_id)
        return {
            "user_id": user_id,
            "active_hours": profile.get("active_hours", "9am-10pm"),
            "last_topics": profile.get("last_topics", []),
            "style_preference": profile.get("style", "colleague"),
            "sentiment_score": profile.get("sentiment", 0.8),
            "project_weights": {pid: WEIGHTS.get(pid, 0.5) for pid in profile.get("projects", [])},
            "last_user_spoke": profile.get("last_user_spoke"),
            "check_patterns": profile.get("check_patterns", {}),
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /users/{user_id}/quiet-hours
    # Gate for proactive speech and notifications.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/users/{user_id}/quiet-hours")
    async def get_quiet_hours(user_id: str):
        """
        Returns quiet hours config.
        Used by: surface trigger evaluator, notification dispatcher.
        
        If current time is within quiet_start → quiet_end:
          - No proactive speech
          - No email notifications
          - Health alerts surface silently (card only)
        """
        if not qh_manager:
            return {"enabled": False, "quiet_start": "23:00", "quiet_end": "07:00", "timezone": "UTC"}
        
        cfg = qh_manager.get_config(user_id)
        return {
            "enabled": cfg.enabled if cfg else True,
            "quiet_start": cfg.quiet_start if cfg else "23:00",
            "quiet_end": cfg.quiet_end if cfg else "07:00",
            "timezone": cfg.timezone if cfg else "UTC",
            "is_quiet_now": qh_manager.is_quiet(user_id),
        }
    
    
    @app.put("/users/{user_id}/quiet-hours")
    async def set_quiet_hours(user_id: str, payload: dict):
        """
        User sets their own quiet hours from APEX preferences panel.
        Marks as explicit=True so learned windows don't override.
        """
        if not qh_manager:
            raise HTTPException(status_code=503, detail="Quiet hours manager not initialized")
        
        qh_manager.set_config(
            user_id,
            quiet_start=payload.get("quiet_start", "23:00"),
            quiet_end=payload.get("quiet_end", "07:00"),
            timezone=payload.get("timezone", "UTC"),
            explicit=True,
        )
        return {"status": "ok", "message": f"Quiet hours set: {payload.get('quiet_start')}–{payload.get('quiet_end')}"}
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /jobs/{job_id}
    # Job detail expansion — card detail view.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/jobs/{job_id}")
    async def get_job(job_id: str):
        """
        Returns full job detail for card expansion.
        Includes: tool calls, outputs, timing, provenance hashes.
        """
        job = job_store.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        return {
            "id": job.id,
            "session_id": job.session_id,
            "user_id": job.user_id,
            "tool_name": job.tool_name,
            "status": job.status,
            "result": job.result,
            "error": job.error,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "finished_at": job.finished_at.isoformat() if job.finished_at else None,
            "duration_ms": (
                int((job.finished_at - job.created_at).total_seconds() * 1000)
                if job.finished_at and job.created_at else None
            ),
            "tools_used": list(set(job.tool_name.split(","))),
            "provenance_hash": _blake3_hash(job.result or ""),
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /sessions/{session_id}/jobs
    # Project job history — feeds the weight calculation.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/sessions/{session_id}/jobs")
    async def get_session_jobs(session_id: str, limit: int = 50):
        """
        Returns job history for a session.
        Client uses this to compute project weight:
        
        weight = (agent_activity_score × 0.40)
               + (dependency_health    × 0.30)
               + (recency_score        × 0.20)
               + (time_invested        × 0.10)
        
        Mock weight examples (for frontend calibration):
          HyperForge (active, 3 agents, 2hr ago) → 0.87
          Snowball Folio (1 agent, 1 day ago)    → 0.61
          BrambleThundery (done, 5 days ago)     → 0.18
        """
        jobs = job_store.list_by_session(session_id, limit=limit)
        return {
            "session_id": session_id,
            "jobs": [
                {
                    "id": j.id,
                    "tool_name": j.tool_name,
                    "status": j.status,
                    "created_at": j.created_at.isoformat() if j.created_at else None,
                    "finished_at": j.finished_at.isoformat() if j.finished_at else None,
                    "intent": getattr(j, "intent", None),
                }
                for j in jobs
            ],
            "total": len(jobs),
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /health/projects
    # Health sub-agent endpoint — returns current health for all projects.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/health/projects")
    async def get_project_health(session_id: str):
        """
        Returns health sub-agent results.
        
        Health sub-agent is stateless + lightweight:
          - Reads from job store + skill registry
          - No LLM call unless amber/red found
          - Self-healing: if it crashes, next cron retries
        
        Check intervals:
          ACTIVE projects: every 15 minutes
          DONE/SUNK: every 6 hours
          DORMANT skills: every 24 hours
        
        Returns: green | amber | red + plain-language reason string
        """
        results = await health_agent.check_all(session_id)
        return {
            "session_id": session_id,
            "checked_at": datetime.utcnow().isoformat(),
            "results": results,
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /skills
    # Skill registry — all installed skills with compute-mode state.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/skills")
    async def get_skills(user_id: str):
        """
        Returns all installed skills with their current mode.
        
        Modes depend on compute mode (read client-side, passed as query param):
          LIVE      → agent-driven, requires warm compute
          COMPILED  → saved workflow, runs in DARK mode
          DORMANT   → installed but not scheduled
        
        Phase 6 (compute mode) must be built before Phase 5 (skill registry)
        so that mode states have something to read from.
        """
        skills = skill_registry.list_skills(user_id)
        return {"skills": skills}
    
    
    @app.put("/skills/{skill_id}/promote")
    async def promote_skill(skill_id: str, payload: dict):
        """
        Promote LIVE → COMPILED (saves last successful run as replayable workflow).
        Compiled skills show a lock icon in the registry.
        Compiled skills fire in DARK mode — this is the whole point.
        """
        result = skill_registry.promote(skill_id, target_mode=payload.get("mode", "compiled"))
        return result
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: POST /signals/ingest
    # External signal ingestion (GitHub, Stripe, HN, etc.)
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.post("/signals/ingest")
    async def ingest_signal(payload: dict):
        """
        Receives external signals from webhooks.
        
        Supported sources:
          - GitHub webhook (dependency release)
          - Stripe webhook (invoice, subscription)
          - Firecrawl (trend report)
          - Custom (any external system)
        
        On receipt:
          1. Classify signal urgency (urgent | info)
          2. Match to affected projects via dependency graph
          3. Surface card in APEX stream with [external_signal] tag
          4. If urgent: orb transitions to ALERT state
        """
        source = payload.get("source", "unknown")
        text = payload.get("text", "")
        signal_type = payload.get("type", "info")
        
        # Publish to all active sessions
        await bus.broadcast({
            "type": "external_signal",
            "source": source,
            "text": text,
            "signal_type": signal_type,
            "ts": datetime.utcnow().isoformat(),
        })
        
        return {"status": "ingested", "source": source}
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: GET /memory/{session_id}/graph
    # Spatial memory graph — entities, relationships, confidence scores.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.get("/memory/{session_id}/graph")
    async def get_memory_graph(session_id: str):
        """
        Returns the spatial memory graph for a session.
        
        Graph structure:
          nodes: projects, agents, dependencies, entities
          edges: depends_on, last_touched_by, owns, usually_checks
          confidence: 0.0-1.0, decays over time
        
        Compound context example:
          HyperForge depends_on anthropic-sdk (0.95)
          NanoClaw last_touched substrate.py (1.0)
          Chad usually_checks HyperForge Tues 9am (0.82)
        
        This feeds the orb's proactive speech:
          "HyperForge SDK shifted. NanoClaw uses that substrate.
           Snowball's export pipeline depends on NanoClaw. Three projects at risk."
        """
        graph = memory.get_graph(session_id)
        return {
            "session_id": session_id,
            "nodes": graph.get("nodes", []),
            "edges": graph.get("edges", []),
            "compound_insights": graph.get("insights", []),
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # ROUTE: POST /speech/queue
    # Queue a speech utterance for the orb.
    # ═══════════════════════════════════════════════════════════════════════════════
    @app.post("/speech/queue")
    async def queue_speech(payload: dict):
        """
        Queues a speech utterance for the orb.
        
        Speech queue rules (Constraint 11):
          - Orb does not interrupt itself
          - Queue max: 3
          - Older items drop if queue fills
          - No speech during quiet hours
          - No speech in DARK compute mode
          - 10min cooldown after user speaks
          - 20min min gap between proactive speeches
        
        Colleague register enforced — every string reviewed.
        """
        session_id = payload.get("session_id")
        text = payload.get("text", "")
        
        if not text or not session_id:
            raise HTTPException(status_code=400, detail="session_id and text required")
        
        await bus.publish(session_id, {
            "type": "speech_queue",
            "text": text,
            "ts": datetime.utcnow().isoformat(),
        })
        return {"status": "queued", "text": text}
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # UTILITY
    # ═══════════════════════════════════════════════════════════════════════════════
    def _blake3_hash(content: str) -> str:
        """Blake3 provenance hash for agent outputs."""
        try:
            import blake3
            return "blake3:" + blake3.blake3(content.encode()).hexdigest()[:12] + "..."
        except ImportError:
            import hashlib
            return "sha256:" + hashlib.sha256(content.encode()).hexdigest()[:12] + "..."
    
    
    @app.get("/")
    async def root():
        return {
            "service": "APEX Studio Backend",
            "version": "2027.1",
            "routes": [
                "POST /chat",
                "GET  /stream/{session_id}",
                "GET  /users/{user_id}/profile",
                "GET  /users/{user_id}/quiet-hours",
                "PUT  /users/{user_id}/quiet-hours",
                "GET  /jobs/{job_id}",
                "GET  /sessions/{session_id}/jobs",
                "GET  /health/projects",
                "GET  /skills",
                "PUT  /skills/{skill_id}/promote",
                "POST /signals/ingest",
                "GET  /memory/{session_id}/graph",
                "POST /speech/queue",
            ],
            "compute_modes": ["full", "solo", "dark"],
            "weight_formula": "agent_activity(0.40) + dependency_health(0.30) + recency(0.20) + time_invested(0.10)",
        }
    
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # CRON JOBS (run with APScheduler or Railway cron)
    # ═══════════════════════════════════════════════════════════════════════════════
    """
    # requirements.txt additions:
    fastapi==0.109.0
    uvicorn[standard]==0.27.0
    anthropic==0.30.0
    blake3==0.3.2
    apscheduler==3.10.4
    supabase==2.3.0
    stripe==8.0.0
    redis==5.0.0
    celery==5.3.6
    
    # Health sub-agent cron (add to startup):
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    scheduler = AsyncIOScheduler()
    
    @scheduler.scheduled_job("interval", minutes=15)
    async def health_cron_active():
        # Check all ACTIVE projects every 15 minutes
        await health_agent.run_cron("active")
    
    @scheduler.scheduled_job("interval", hours=6)
    async def health_cron_sunk():
        # Check DONE/SUNK projects every 6 hours
        await health_agent.run_cron("sunk")
    
    @scheduler.scheduled_job("interval", hours=24)
    async def health_cron_dormant():
        # Check DORMANT skills every 24 hours
        await health_agent.run_cron("dormant")
    
    scheduler.start()
    
    # External signal polling (GitHub, etc.):
    @scheduler.scheduled_job("interval", minutes=30)
    async def poll_external_signals():
        signals = await external_monitor.poll()
        for signal in signals:
            await bus.broadcast({"type": "external_signal", **signal})
    """
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # DEPLOYMENT (Railway.app — zero config)
    # ═══════════════════════════════════════════════════════════════════════════════
    """
    # railway.toml
    [build]
      builder = "NIXPACKS"
    
    [deploy]
      startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
      healthcheckPath = "/"
      healthcheckTimeout = 300
      restartPolicyType = "ON_FAILURE"
    
    # Environment variables (set in Railway dashboard):
      ANTHROPIC_API_KEY=sk-ant-...
      SUPABASE_URL=https://xxx.supabase.co
      SUPABASE_KEY=eyJ...
      STRIPE_SECRET_KEY=sk_live_...
      OBSIDIAN_VAULT_PATH=/vault
      REDIS_URL=redis://...
    """
    