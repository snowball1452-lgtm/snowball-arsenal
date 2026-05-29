/**
     * APEX FACE STATES v1.0
     * Maps APEX STUDIO system events → SnowballFace expression states
     * Bridge between the agent command center logic and the avatar face.
     */
    
    const ApexFaceStates = (() => {
    
      const { STATES, COMPUTE } = window.SnowballFaceModule;
    
      // ─── STATE MAP ────────────────────────────────────────────────────────────
      // Maps APEX system events to face states + optional overrides
      const EVENT_MAP = {
        // System lifecycle
        'system:boot':         { state: STATES.ACTIVE,   duration: 3000,  returnTo: STATES.IDLE },
        'system:idle':         { state: STATES.IDLE },
        'system:dark':         { state: STATES.DARK },
    
        // Agent events
        'agent:running':       { state: STATES.ACTIVE },
        'agent:finished':      { state: STATES.ACTIVE,   duration: 2000,  returnTo: STATES.IDLE },
        'agent:error':         { state: STATES.ALERT,    duration: 5000,  returnTo: STATES.IDLE },
    
        // Health events
        'health:green':        { state: STATES.IDLE },
        'health:amber':        { state: STATES.ALERT,    duration: 8000,  returnTo: STATES.ACTIVE },
        'health:red':          { state: STATES.ALERT },
    
        // Conversation
        'user:spoke':          { state: STATES.ACTIVE },
        'orb:speaking':        { state: STATES.SPEAKING },
        'orb:done':            { state: STATES.IDLE },
    
        // Compute mode
        'mode:full_crew':      { computeMode: COMPUTE.FULL_CREW },
        'mode:solo':           { computeMode: COMPUTE.SOLO },
        'mode:dark':           { computeMode: COMPUTE.DARK,  state: STATES.DARK },
    
        // Project events
        'project:resurfaced':  { state: STATES.ALERT,    duration: 4000,  returnTo: STATES.ACTIVE },
        'project:completed':   { state: STATES.ACTIVE,   duration: 3000,  returnTo: STATES.IDLE },
    
        // Skill events
        'skill:compiled':      { state: STATES.ACTIVE,   duration: 2000,  returnTo: STATES.IDLE },
        'skill:error':         { state: STATES.ALERT,    duration: 4000,  returnTo: STATES.IDLE },
      };
    
      // ─── EXPRESSION REGISTRY ─────────────────────────────────────────────────
      // Named expressions beyond basic state transitions
      // These are micro-expressions fired on specific events
      const MICRO_EXPRESSIONS = {
        'curious':   { browTarget: 0.15, eyeScaleTarget: 1.25, duration: 1500 },
        'skeptical': { browTarget: -0.1, eyeScaleTarget: 0.9,  duration: 2000, asymmetric: true },
        'pleased':   { browTarget: 0.1,  eyeScaleTarget: 1.2,  duration: 1800 },
        'focused':   { browTarget: 0.08, eyeScaleTarget: 0.95, duration: 2500 },
        'surprised': { browTarget: 0.25, eyeScaleTarget: 1.4,  duration: 800  },
        'tired':     { browTarget: -0.08, eyeScaleTarget: 0.6, duration: 3000 },
      };
    
      // ─── COLLEAGUE PHRASES ────────────────────────────────────────────────────
      // All in colleague register — not assistant register
      const PHRASES = {
        boot:            ["Apex online.", "Systems up.", "Back online."],
        agent_done:      ["{project} job finished.", "{project} wrapped.", "Agent done on {project}."],
        agent_error:     ["{project} hit an error.", "Check {project}.", "{project} needs attention."],
        health_amber:    ["{project} flagged amber.", "Amber on {project}.", "{project} health drifted."],
        health_red:      ["{project} is red.", "Red flag — {project}.", "{project} down."],
        resurfaced:      ["{project} came back. {reason}.", "Resurfaced — {project}. {reason}."],
        idle_checkin:    ["Haven't touched {project} in {days} days. Checkpoint still valid.", "{project} still sitting. Everything looks clean."],
        job_queue:       ["Three tasks queued.", "Queue is building up.", "{count} jobs waiting."],
        dependency:      ["Dependency shifted on {project}.", "{project} has a dep drift."],
        compiled:        ["{skill} compiled clean.", "{skill} saved as workflow."],
        mode_full:       ["Full crew up.", "All agents active.", "Running full crew."],
        mode_solo:       ["Solo mode.", "Reserve agent only.", "Spinning down to solo."],
        mode_dark:       ["Going dark.", "Dark mode. Compiled skills only.", "Lights out."],
        proactive_tips: [
          "HyperForge dependency shifted.",
          "Snowball Folio build finished. Ink engine compiled clean.",
          "Haven't touched HyperForge in four days. Checkpoint still valid.",
          "Three tasks queued. NanoClaw flagged a drift in the substrate.",
          "BrambleThundery health check came back clean.",
          "Two new files from the Snowball agent.",
        ],
      };
    
      function pickPhrase(key, vars = {}) {
        const pool = PHRASES[key];
        if (!pool) return '';
        let phrase = pool[Math.floor(Math.random() * pool.length)];
        Object.entries(vars).forEach(([k, v]) => { phrase = phrase.replace(`{${k}}`, v); });
        return phrase;
      }
    
      // ─── CONTROLLER ──────────────────────────────────────────────────────────
      class FaceController {
        constructor(face) {
          this.face = face;
          this.pendingReturn = null;
          this.returnTimer = null;
        }
    
        dispatch(event, data = {}) {
          const mapping = EVENT_MAP[event];
          if (!mapping) return;
    
          // Compute mode change
          if (mapping.computeMode) {
            this.face.setComputeMode(mapping.computeMode);
          }
    
          // State change
          if (mapping.state) {
            if (this.returnTimer) { clearTimeout(this.returnTimer); this.returnTimer = null; }
            this.face.setState(mapping.state);
    
            // Auto-return after duration
            if (mapping.duration && mapping.returnTo) {
              this.returnTimer = setTimeout(() => {
                this.face.setState(mapping.returnTo);
              }, mapping.duration);
            }
          }
        }
    
        microExpress(name) {
          const expr = MICRO_EXPRESSIONS[name];
          if (!expr || !this.face) return;
          // Apply directly to face internals
          if (expr.browTarget !== undefined) this.face.browTarget = expr.browTarget;
          if (expr.eyeScaleTarget !== undefined) this.face.eyeScaleTarget = expr.eyeScaleTarget;
          if (expr.duration) {
            setTimeout(() => {
              this.face._applyStateTargets(this.face.state);
            }, expr.duration);
          }
        }
    
        speak(text, onEnd) {
          this.face.speak(text, onEnd);
        }
    
        stopSpeaking(returnState) {
          this.face.stopSpeaking(returnState);
        }
      }
    
      return { FaceController, PHRASES, pickPhrase, MICRO_EXPRESSIONS, EVENT_MAP, STATES };
    })();
    
    window.ApexFaceStates = ApexFaceStates;
    