/**
     * SNOWBALL FACE ENGINE v1.0
     * Original procedural 3D avatar face — no copyright, no asset dependencies.
     * Built entirely from Three.js primitives + custom geometry.
     * 
     * Architecture:
     *   SnowballFace(container, options) → constructs and mounts the face
     *   face.setState(state)             → transitions to a named expression state
     *   face.speak(text, onEnd)          → triggers lip sync + SPEAKING state
     *   face.stopSpeaking()              → ends lip sync
     *   face.setComputeMode(mode)        → FULL_CREW | SOLO | DARK surface changes
     *   face.destroy()                   → cleanup
     *
     * STATES:
     *   IDLE | ACTIVE | SPEAKING | ALERT | DARK
     *
     * EXPRESSIONS (mapped to states):
     *   IDLE     → neutral, slow blink, soft glow
     *   ACTIVE   → eyes wider, slight forward lean, warm tone
     *   SPEAKING → mouth animates, eyes track forward, rings emit
     *   ALERT    → brow furrow, amber pulse, asymmetric eye
     *   DARK     → eyes nearly closed, cold, minimal motion
     *
     * FACE ANATOMY (all procedural Three.js geometry):
     *   - Head: SphereGeometry, slightly flattened on Z
     *   - Eyes: Two ellipsoid geometries (irises + pupils + sclera layers)
     *   - Brows: Two thin BoxGeometry arcs, rotation-controlled
     *   - Nose bridge: Subtle cylindrical ridge
     *   - Mouth: Parametric curve geometry, morphs open/closed
     *   - Inner glow: Additive blended inner sphere
     *   - Aura ring: Torus, state-colored
     *   - Particle field: Points geometry around face (compute mode indicator)
     */
    
    const SnowballFaceModule = (() => {
    
      // ─── CONSTANTS ────────────────────────────────────────────────────────────
      const STATES = { IDLE: 'IDLE', ACTIVE: 'ACTIVE', SPEAKING: 'SPEAKING', ALERT: 'ALERT', DARK: 'DARK' };
      const COMPUTE = { FULL_CREW: 'FULL_CREW', SOLO: 'SOLO', DARK: 'DARK' };
    
      const PALETTE = {
        IDLE:     { primary: 0x4a9eff, glow: 0x1a4a8a, brow: 0x8888aa, skin: 0x1a1a2e, eye: 0x4a9eff },
        ACTIVE:   { primary: 0xf59e0b, glow: 0x92400e, brow: 0xccaa44, skin: 0x1f1a10, eye: 0xfbbf24 },
        SPEAKING: { primary: 0x60efff, glow: 0x0a5a6a, brow: 0x44aacc, skin: 0x0a1a2a, eye: 0x60efff },
        ALERT:    { primary: 0xf59e0b, glow: 0x7f1d1d, brow: 0xcc4444, skin: 0x1f0f0f, eye: 0xf87171 },
        DARK:     { primary: 0x1a2a3a, glow: 0x050a0f, brow: 0x333344, skin: 0x0a0a12, eye: 0x223344 },
      };
    
      // ─── LERP UTILITIES ───────────────────────────────────────────────────────
      function lerp(a, b, t) { return a + (b - a) * t; }
      function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
      function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
    
      // ─── MAIN CLASS ───────────────────────────────────────────────────────────
      class SnowballFace {
        constructor(container, opts = {}) {
          this.container = container;
          this.opts = Object.assign({ width: 200, height: 200, pixelRatio: window.devicePixelRatio || 1 }, opts);
          this.state = STATES.IDLE;
          this.computeMode = COMPUTE.SOLO;
          this.speaking = false;
          this.blinkTimer = 0;
          this.blinkState = 0; // 0=open, going to 1=closed
          this.blinkTarget = 0;
          this.breathPhase = 0;
          this.mouthOpen = 0;
          this.mouthTarget = 0;
          this.lipPhase = 0;
          this.browL_rot = 0;
          this.browR_rot = 0;
          this.browTarget = 0;
          this.eyeScaleY = 1;
          this.eyeScaleTarget = 1;
          this.alertPulse = 0;
          this.transitionProgress = 1;
          this.transitionFrom = STATES.IDLE;
          this.particlePhase = 0;
          this.ringScale = 0;
          this.rings = [];
          this.speechInterval = null;
          this.onEnd = null;
          this._init();
          this._animate();
        }
    
        _init() {
          const { width, height, pixelRatio } = this.opts;
    
          // Renderer
          this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          this.renderer.setPixelRatio(pixelRatio);
          this.renderer.setSize(width, height);
          this.renderer.setClearColor(0x000000, 0);
          this.container.appendChild(this.renderer.domElement);
    
          // Scene + Camera
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
          this.camera.position.set(0, 0, 5);
    
          // Lighting
          const ambient = new THREE.AmbientLight(0x112244, 0.6);
          this.scene.add(ambient);
          this.keyLight = new THREE.PointLight(0x4a9eff, 2.5, 20);
          this.keyLight.position.set(2, 3, 4);
          this.scene.add(this.keyLight);
          this.rimLight = new THREE.PointLight(0x1a3a6a, 1.5, 15);
          this.rimLight.position.set(-3, -1, 2);
          this.scene.add(this.rimLight);
          this.fillLight = new THREE.PointLight(0x000000, 0, 10);
          this.fillLight.position.set(0, -2, 3);
          this.scene.add(this.fillLight);
    
          this._buildFace();
          this._buildParticles();
          this._buildAuraRing();
        }
    
        _buildFace() {
          this.faceGroup = new THREE.Group();
          this.scene.add(this.faceGroup);
    
          // ── HEAD ──────────────────────────────────────────────────────────────
          const headGeo = new THREE.SphereGeometry(1.0, 64, 48);
          // Flatten Z slightly for a face-forward feel
          headGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 1.05, 0.82));
          this.headMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e, roughness: 0.7, metalness: 0.1,
            emissive: 0x050510, emissiveIntensity: 0.3,
          });
          this.head = new THREE.Mesh(headGeo, this.headMat);
          this.faceGroup.add(this.head);
    
          // ── INNER GLOW (additive inner sphere) ────────────────────────────────
          const glowGeo = new THREE.SphereGeometry(0.85, 32, 24);
          this.glowMat = new THREE.MeshBasicMaterial({
            color: 0x1a4a8a, transparent: true, opacity: 0.12,
            side: THREE.BackSide,
          });
          this.innerGlow = new THREE.Mesh(glowGeo, this.glowMat);
          this.faceGroup.add(this.innerGlow);
    
          // ── EYES ──────────────────────────────────────────────────────────────
          this.eyeLeft  = this._buildEye(-0.32, 0.18, 1);
          this.eyeRight = this._buildEye( 0.32, 0.18, -1);
          this.faceGroup.add(this.eyeLeft.group);
          this.faceGroup.add(this.eyeRight.group);
    
          // ── BROWS ─────────────────────────────────────────────────────────────
          this.browLeft  = this._buildBrow(-0.32, 0.44, 1);
          this.browRight = this._buildBrow( 0.32, 0.44, -1);
          this.faceGroup.add(this.browLeft);
          this.faceGroup.add(this.browRight);
    
          // ── NOSE BRIDGE ───────────────────────────────────────────────────────
          const noseGeo = new THREE.CapsuleGeometry(0.025, 0.18, 4, 8);
          const noseMat = new THREE.MeshStandardMaterial({ color: 0x161626, roughness: 0.9 });
          this.nose = new THREE.Mesh(noseGeo, noseMat);
          this.nose.position.set(0, 0.0, 0.79);
          this.faceGroup.add(this.nose);
    
          // ── MOUTH ─────────────────────────────────────────────────────────────
          this.mouthGroup = new THREE.Group();
          this.mouthGroup.position.set(0, -0.28, 0.78);
          this.faceGroup.add(this.mouthGroup);
          this._buildMouth();
        }
    
        _buildEye(x, y, side) {
          const group = new THREE.Group();
          group.position.set(x, y, 0.76);
    
          // Sclera (white of eye)
          const scleraGeo = new THREE.SphereGeometry(0.115, 24, 18);
          scleraGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.1, 0.75, 0.6));
          const scleraMat = new THREE.MeshStandardMaterial({ color: 0x0a0a18, roughness: 0.3 });
          const sclera = new THREE.Mesh(scleraGeo, scleraMat);
          group.add(sclera);
    
          // Iris
          const irisGeo = new THREE.CircleGeometry(0.065, 32);
          const irisMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.95 });
          const iris = new THREE.Mesh(irisGeo, irisMat);
          iris.position.z = 0.07;
          group.add(iris);
    
          // Pupil
          const pupilGeo = new THREE.CircleGeometry(0.032, 24);
          const pupilMat = new THREE.MeshBasicMaterial({ color: 0x010106 });
          const pupil = new THREE.Mesh(pupilGeo, pupilMat);
          pupil.position.z = 0.072;
          group.add(pupil);
    
          // Eye glow (point light per eye)
          const eyeGlow = new THREE.PointLight(0x4a9eff, 0.4, 0.8);
          eyeGlow.position.z = 0.1;
          group.add(eyeGlow);
    
          // Eyelid (upper — used for blink, closes down)
          const lidGeo = new THREE.SphereGeometry(0.118, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          lidGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.12, 0.8, 0.62));
          const lidMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.6 });
          const lid = new THREE.Mesh(lidGeo, lidMat);
          lid.rotation.x = Math.PI; // starts open (rotated away)
          lid.position.y = 0.0;
          lid.position.z = -0.01;
          group.add(lid);
    
          return { group, iris, irisMat, pupil, eyeGlow, lid, sclera };
        }
    
        _buildBrow(x, y, side) {
          const geo = new THREE.CapsuleGeometry(0.018, 0.18, 4, 8);
          const mat = new THREE.MeshStandardMaterial({ color: 0x8888aa, roughness: 0.8, emissive: 0x223344, emissiveIntensity: 0.2 });
          const brow = new THREE.Mesh(geo, mat);
          brow.position.set(x, y, 0.74);
          brow.rotation.z = side * 0.12; // slight natural angle
          brow.userData = { mat, side };
          return brow;
        }
    
        _buildMouth() {
          // Upper lip curve
          const points = [];
          for (let i = 0; i <= 20; i++) {
            const t = (i / 20) * Math.PI;
            const x = Math.cos(t) * 0.13;
            const y = Math.sin(t) * 0.04;
            points.push(new THREE.Vector3(x, y, 0));
          }
          const upperCurve = new THREE.CatmullRomCurve3(points);
          const upperGeo = new THREE.TubeGeometry(upperCurve, 20, 0.015, 6, false);
          this.upperLipMat = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.7, emissive: 0x112233, emissiveIntensity: 0.3 });
          this.upperLip = new THREE.Mesh(upperGeo, this.upperLipMat);
          this.mouthGroup.add(this.upperLip);
    
          // Lower lip (flat line by default, opens for speech)
          const lowerPoints = [];
          for (let i = 0; i <= 20; i++) {
            const t = (i / 20) * Math.PI;
            const x = Math.cos(t) * 0.11;
            const y = -Math.sin(t) * 0.02;
            lowerPoints.push(new THREE.Vector3(x, y, 0));
          }
          this.lowerCurve3 = lowerPoints;
          const lowerCurve = new THREE.CatmullRomCurve3(lowerPoints);
          const lowerGeo = new THREE.TubeGeometry(lowerCurve, 20, 0.013, 6, false);
          this.lowerLipMat = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.7 });
          this.lowerLip = new THREE.Mesh(lowerGeo, this.lowerLipMat);
          this.mouthGroup.add(this.lowerLip);
    
          // Mouth opening plane (dark inner, shown when speaking)
          const openGeo = new THREE.PlaneGeometry(0.22, 0.0);
          this.mouthOpenMat = new THREE.MeshBasicMaterial({ color: 0x000008, transparent: true, opacity: 0.0 });
          this.mouthOpenPlane = new THREE.Mesh(openGeo, this.mouthOpenMat);
          this.mouthOpenPlane.position.z = -0.01;
          this.mouthGroup.add(this.mouthOpenPlane);
        }
    
        _buildParticles() {
          const count = 180;
          const geo = new THREE.BufferGeometry();
          const pos = new Float32Array(count * 3);
          const phases = new Float32Array(count);
          for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = 1.2 + Math.random() * 0.5;
            pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
            pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i*3+2] = r * Math.cos(phi);
            phases[i]  = Math.random() * Math.PI * 2;
          }
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          this.particlePhases = phases;
          this.particlePositions = pos;
          this.particleGeo = geo;
          this.particleMat = new THREE.PointsMaterial({ color: 0x4a9eff, size: 0.022, transparent: true, opacity: 0.0 });
          this.particles = new THREE.Points(geo, this.particleMat);
          this.faceGroup.add(this.particles);
        }
    
        _buildAuraRing() {
          const geo = new THREE.TorusGeometry(1.18, 0.012, 8, 80);
          this.auraMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.0 });
          this.auraRing = new THREE.Mesh(geo, this.auraMat);
          this.auraRing.rotation.x = Math.PI / 2;
          this.faceGroup.add(this.auraRing);
    
          // Speaking rings pool
          this.speakRings = [];
          for (let i = 0; i < 3; i++) {
            const rGeo = new THREE.TorusGeometry(1.0, 0.008, 6, 60);
            const rMat = new THREE.MeshBasicMaterial({ color: 0x60efff, transparent: true, opacity: 0 });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { active: false, progress: 0 };
            this.faceGroup.add(ring);
            this.speakRings.push(ring);
          }
        }
    
        // ─── STATE MACHINE ────────────────────────────────────────────────────────
        setState(newState) {
          if (newState === this.state) return;
          this.transitionFrom = this.state;
          this.transitionProgress = 0;
          this.state = newState;
          this._applyStateTargets(newState);
        }
    
        _applyStateTargets(state) {
          const pal = PALETTE[state] || PALETTE.IDLE;
          // Lights
          this.keyLight.color.setHex(pal.primary);
    
          switch (state) {
            case STATES.IDLE:
              this.browTarget = 0;
              this.eyeScaleTarget = 1.0;
              this.mouthTarget = 0;
              break;
            case STATES.ACTIVE:
              this.browTarget = 0.08;
              this.eyeScaleTarget = 1.15;
              this.mouthTarget = 0;
              break;
            case STATES.SPEAKING:
              this.browTarget = 0.05;
              this.eyeScaleTarget = 1.1;
              // mouth handled by lip sync
              break;
            case STATES.ALERT:
              this.browTarget = -0.18; // furrow
              this.eyeScaleTarget = 0.85;
              this.mouthTarget = 0;
              break;
            case STATES.DARK:
              this.browTarget = -0.05;
              this.eyeScaleTarget = 0.45; // nearly closed
              this.mouthTarget = 0;
              break;
          }
        }
    
        // ─── SPEAK ────────────────────────────────────────────────────────────────
        speak(text, onEnd) {
          this.speaking = true;
          this.onEnd = onEnd || null;
          this.setState(STATES.SPEAKING);
          this.lipPhase = 0;
          if (this.speechInterval) clearInterval(this.speechInterval);
          this.speechInterval = setInterval(() => {
            this.mouthTarget = 0.3 + Math.random() * 0.5;
            setTimeout(() => { if (this.speaking) this.mouthTarget = 0.05 + Math.random() * 0.2; }, 80);
          }, 160);
        }
    
        stopSpeaking(returnState) {
          this.speaking = false;
          if (this.speechInterval) { clearInterval(this.speechInterval); this.speechInterval = null; }
          this.mouthTarget = 0;
          this.setState(returnState || STATES.IDLE);
          if (this.onEnd) { this.onEnd(); this.onEnd = null; }
        }
    
        setComputeMode(mode) {
          this.computeMode = mode;
          // Particle visibility driven by mode
        }
    
        // ─── ANIMATION LOOP ───────────────────────────────────────────────────────
        _animate() {
          this._rafId = requestAnimationFrame(() => this._animate());
          const dt = 0.016;
          this._tick(dt);
          this.renderer.render(this.scene, this.camera);
        }
    
        _tick(dt) {
          const t = performance.now() * 0.001;
          const state = this.state;
          const pal = PALETTE[state] || PALETTE.IDLE;
    
          // ── BREATHING / IDLE PULSE ────────────────────────────────────────────
          let breathFreq = state === STATES.DARK ? 0.08 : state === STATES.ACTIVE ? 0.7 : 0.3;
          let breathAmp  = state === STATES.DARK ? 0.008 : state === STATES.ALERT ? 0.028 : 0.018;
          this.breathPhase += dt * breathFreq * Math.PI * 2;
          const breath = Math.sin(this.breathPhase) * breathAmp;
          const alertWobble = state === STATES.ALERT ? Math.sin(t * 7.3) * 0.012 : 0;
          this.faceGroup.scale.setScalar(1.0 + breath + alertWobble);
    
          // ── HEAD SKIN COLOR ───────────────────────────────────────────────────
          const tc = new THREE.Color(pal.skin);
          this.headMat.color.lerp(tc, 0.04);
          this.headMat.emissive.lerp(new THREE.Color(pal.glow), 0.04);
    
          // ── INNER GLOW ────────────────────────────────────────────────────────
          const glowTarget = state === STATES.DARK ? 0.04 : state === STATES.SPEAKING ? 0.28 : 0.14;
          this.glowMat.opacity += (glowTarget - this.glowMat.opacity) * 0.05;
          this.glowMat.color.lerp(new THREE.Color(pal.primary), 0.05);
    
          // ── BROW ANIMATION ────────────────────────────────────────────────────
          this.browL_rot += (this.browTarget - this.browL_rot) * 0.08;
          // Alert: asymmetric brow (more menacing)
          const alertAsym = state === STATES.ALERT ? Math.sin(t * 2.1) * 0.04 : 0;
          this.browR_rot = this.browL_rot + alertAsym;
          this.browLeft.rotation.z  =  this.browLeft.userData.side  * 0.12 + this.browL_rot;
          this.browRight.rotation.z = this.browRight.userData.side * 0.12 - this.browR_rot;
          // Brow color
          const bc = new THREE.Color(pal.brow);
          this.browLeft.userData.mat.color.lerp(bc, 0.06);
          this.browRight.userData.mat.color.lerp(bc, 0.06);
    
          // ── EYE SCALE (open/close) ────────────────────────────────────────────
          this.eyeScaleY += (this.eyeScaleTarget - this.eyeScaleY) * 0.08;
    
          // ── BLINK ─────────────────────────────────────────────────────────────
          this.blinkTimer -= dt;
          if (this.blinkTimer <= 0 && state !== STATES.DARK) {
            this.blinkTimer = 2.5 + Math.random() * 4;
            this._doBlink();
          }
    
          // Apply eye scale to both eyes
          [this.eyeLeft, this.eyeRight].forEach(eye => {
            eye.group.scale.y = this.eyeScaleY * (this.blinkState > 0 ? clamp(1 - this.blinkState * 2, 0.05, 1) : 1);
          });
          if (this.blinkState > 0) this.blinkState -= dt * 6;
          if (this.blinkState < 0) this.blinkState = 0;
    
          // Eye iris color
          const ec = new THREE.Color(pal.eye);
          [this.eyeLeft, this.eyeRight].forEach(eye => {
            eye.irisMat.color.lerp(ec, 0.06);
            eye.eyeGlow.color.lerp(ec, 0.06);
            // Eye glow intensity
            const gi = state === STATES.DARK ? 0.1 : state === STATES.SPEAKING ? 0.8 : 0.4;
            eye.eyeGlow.intensity += (gi - eye.eyeGlow.intensity) * 0.05;
          });
    
          // ── MOUTH / LIP SYNC ─────────────────────────────────────────────────
          this.mouthOpen += (this.mouthTarget - this.mouthOpen) * 0.18;
          this._updateMouth(this.mouthOpen);
    
          // ── SPEAKING RINGS ────────────────────────────────────────────────────
          if (state === STATES.SPEAKING) {
            this.speakRings.forEach((ring, i) => {
              if (!ring.userData.active && Math.random() < 0.012) {
                ring.userData.active = true;
                ring.userData.progress = 0;
              }
              if (ring.userData.active) {
                ring.userData.progress += dt * 0.7;
                const p = ring.userData.progress;
                ring.scale.setScalar(1 + p * 0.9);
                ring.material.opacity = Math.max(0, 0.6 - p * 0.7);
                if (p >= 1) { ring.userData.active = false; ring.material.opacity = 0; ring.scale.setScalar(1); }
              }
            });
          } else {
            this.speakRings.forEach(r => { r.material.opacity = 0; r.userData.active = false; r.scale.setScalar(1); });
          }
    
          // ── AURA RING ────────────────────────────────────────────────────────
          const auraTarget = state === STATES.ALERT ? 0.7 : state === STATES.ACTIVE ? 0.35 : 0.0;
          this.auraMat.opacity += (auraTarget - this.auraMat.opacity) * 0.04;
          this.auraMat.color.lerp(new THREE.Color(pal.primary), 0.05);
          this.auraRing.rotation.z = t * 0.3;
    
          // ── PARTICLES (compute mode) ──────────────────────────────────────────
          const pTarget = this.computeMode === COMPUTE.FULL_CREW ? 0.55 : 0.0;
          this.particleMat.opacity += (pTarget - this.particleMat.opacity) * 0.03;
          this.particleMat.color.lerp(new THREE.Color(pal.primary), 0.04);
          if (this.computeMode === COMPUTE.FULL_CREW) {
            for (let i = 0; i < this.particlePhases.length; i++) {
              this.particlePhases[i] += dt * (0.3 + (i % 5) * 0.1);
              const wobble = Math.sin(this.particlePhases[i]) * 0.06;
              const idx = i * 3;
              const x0 = this.particlePositions[idx];
              const y0 = this.particlePositions[idx+1];
              const z0 = this.particlePositions[idx+2];
              const r = Math.sqrt(x0*x0 + y0*y0 + z0*z0);
              const scale = (r + wobble) / r;
              this.particleGeo.attributes.position.array[idx]   = x0 * scale;
              this.particleGeo.attributes.position.array[idx+1] = y0 * scale;
              this.particleGeo.attributes.position.array[idx+2] = z0 * scale;
            }
            this.particleGeo.attributes.position.needsUpdate = true;
          }
    
          // ── SUBTLE HEAD NOD (alive feel) ──────────────────────────────────────
          if (state !== STATES.DARK) {
            this.faceGroup.rotation.y = Math.sin(t * 0.11) * 0.04;
            this.faceGroup.rotation.x = Math.sin(t * 0.07) * 0.02;
          } else {
            this.faceGroup.rotation.y *= 0.98;
            this.faceGroup.rotation.x *= 0.98;
          }
    
          // ── ALERT PULSE (red flash) ───────────────────────────────────────────
          if (state === STATES.ALERT) {
            this.alertPulse = (Math.sin(t * 3.1) + 1) * 0.5;
            const alertCol = new THREE.Color(0xf59e0b).lerp(new THREE.Color(0xf87171), this.alertPulse * 0.5);
            this.keyLight.color.copy(alertCol);
            this.keyLight.intensity = 2.5 + this.alertPulse * 1.5;
          } else {
            this.keyLight.intensity += (2.5 - this.keyLight.intensity) * 0.04;
          }
        }
    
        _doBlink() {
          this.blinkState = 1.0;
        }
    
        _updateMouth(open) {
          // Rebuild lower lip to open downward
          const pts = [];
          for (let i = 0; i <= 20; i++) {
            const t = (i / 20) * Math.PI;
            const x = Math.cos(t) * 0.11;
            const y = -Math.sin(t) * 0.02 - open * 0.1;
            pts.push(new THREE.Vector3(x, y, 0));
          }
          const curve = new THREE.CatmullRomCurve3(pts);
          const geo = new THREE.TubeGeometry(curve, 20, 0.013, 6, false);
          this.lowerLip.geometry.dispose();
          this.lowerLip.geometry = geo;
          // Show inner mouth opening
          const h = open * 0.12;
          const openGeo = new THREE.PlaneGeometry(0.19, h);
          this.mouthOpenPlane.geometry.dispose();
          this.mouthOpenPlane.geometry = openGeo;
          this.mouthOpenMat.opacity = open > 0.05 ? 0.85 : 0;
          this.mouthOpenPlane.position.y = -h * 0.5 - 0.01;
        }
    
        destroy() {
          cancelAnimationFrame(this._rafId);
          if (this.speechInterval) clearInterval(this.speechInterval);
          this.renderer.dispose();
          if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
          }
        }
      }
    
      return { SnowballFace, STATES, COMPUTE, PALETTE };
    })();
    
    // Export for use as module or global
    if (typeof module !== 'undefined') module.exports = SnowballFaceModule;
    else window.SnowballFaceModule = SnowballFaceModule;
    