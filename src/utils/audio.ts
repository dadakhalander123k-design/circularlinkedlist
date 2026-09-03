// =========================================================================
// HASH QUEST — Precision Mechanical UI Sound Effects Engine
// Web Audio API Synthesis: Zero Latency, Pure Procedural, Tactile & Minimal
// =========================================================================

const STORAGE_SOUND_ENABLED_KEY = 'hashQuestSoundEnabled';
const STORAGE_LEGACY_MUTE_KEY = 'hash_quest_audio_muted';

class SoundEffectsController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastSoundTimestamps: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedEnabled = localStorage.getItem(STORAGE_SOUND_ENABLED_KEY);
        if (storedEnabled !== null) {
          this.isMuted = storedEnabled === 'false';
        } else {
          const storedLegacyMute = localStorage.getItem(STORAGE_LEGACY_MUTE_KEY);
          this.isMuted = storedLegacyMute === 'true';
        }
      } catch {
        this.isMuted = false;
      }
    }
  }

  /**
   * Initializes or resumes the Web Audio Context upon user interaction.
   */
  private initCtx(): boolean {
    if (this.isMuted) return false;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Handled silently until next user gesture
      });
    }
    return !!this.ctx && this.ctx.state !== 'closed';
  }

  /**
   * Prevents rapid duplicate audio firings (e.g. pointerdown + click).
   */
  private shouldThrottle(soundKey: string, intervalMs = 25): boolean {
    const now = performance.now();
    const last = this.lastSoundTimestamps.get(soundKey) || 0;
    if (now - last < intervalMs) {
      return true;
    }
    this.lastSoundTimestamps.set(soundKey, now);
    return false;
  }

  /**
   * Micro-pitch variation (0.97 to 1.03) to prevent robotic sound fatigue.
   */
  private getPitchVariance(range = 0.03): number {
    return 1 + (Math.random() * (range * 2) - range);
  }

  // =========================================================================
  // VOLUME & MUTE STATE MANAGEMENT
  // =========================================================================
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_SOUND_ENABLED_KEY, String(!muted));
        localStorage.setItem(STORAGE_LEGACY_MUTE_KEY, String(muted));
      } catch {
        // Ignore storage access errors
      }
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  // =========================================================================
  // 1. STANDARD MECHANICAL BUTTON CLICK (Volume: 0.10, Duration: ~35ms)
  // Short, dry, crisp tactile switch click
  // =========================================================================
  public playClick() {
    if (!this.initCtx() || this.shouldThrottle('click', 25)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance();
      const osc = this.ctx!.createOscillator();
      const noise = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(220 * pitch, now + 0.028);

      noise.type = 'triangle';
      noise.frequency.setValueAtTime(1100 * pitch, now);
      noise.frequency.exponentialRampToValueAtTime(300 * pitch, now + 0.016);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      noise.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.035);
      noise.stop(now + 0.035);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 2. PRIMARY BUTTON CLICK (Volume: 0.12, Duration: ~45ms)
  // Richer mechanical click with a subtle digital confirmation body
  // =========================================================================
  public playPrimaryClick() {
    if (!this.initCtx() || this.shouldThrottle('primaryClick', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance(0.02);
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(540 * pitch, now);
      osc1.frequency.exponentialRampToValueAtTime(780 * pitch, now + 0.035);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200 * pitch, now);
      osc2.frequency.exponentialRampToValueAtTime(380 * pitch, now + 0.02);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.045);
      osc2.stop(now + 0.045);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 3. SECONDARY BUTTON CLICK (Volume: 0.09, Duration: ~30ms)
  // Simple tactile click, slightly softer than primary
  // =========================================================================
  public playSecondaryClick() {
    if (!this.initCtx() || this.shouldThrottle('secondaryClick', 25)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance();
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(280 * pitch, now + 0.025);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.030);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.030);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 4. NAVIGATION / TAB SELECTION TICK (Volume: 0.08, Duration: ~25ms)
  // Light, crisp tactile tick for nav tabs, chapters, pills, and questions
  // =========================================================================
  public playNav() {
    if (!this.initCtx() || this.shouldThrottle('nav', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance();
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.022);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Safe fallback
    }
  }

  public playNavigation() {
    this.playNav();
  }

  public playTab() {
    this.playNav();
  }

  public playSelect() {
    this.playNav();
  }

  public playOption() {
    this.playNav();
  }

  public playTick() {
    this.playNav();
  }

  public playLevelSelect() {
    this.playNav();
  }

  // =========================================================================
  // 5. TOGGLE SWITCH (Volume: 0.09, Duration: ~35ms)
  // ON: Soft mechanical click + tick | OFF: Slightly deeper click
  // =========================================================================
  public playToggle(isOn = true) {
    if (!this.initCtx() || this.shouldThrottle('toggle', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      if (isOn) {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.032);
      } else {
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.032);
      }

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 6. DROPDOWN OPEN / SELECT (Volume: 0.08)
  // =========================================================================
  public playDropdown(isOpen = true) {
    if (!this.initCtx() || this.shouldThrottle('dropdown', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isOpen ? 620 : 480, now);
      osc.frequency.exponentialRampToValueAtTime(isOpen ? 480 : 620, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 7. DRAG & DROP INTERACTIONS
  // =========================================================================
  // Drag Start: subtle mechanical lift/pickup (Vol: 0.08, Dur: ~40ms)
  public playDragStart() {
    if (!this.initCtx() || this.shouldThrottle('dragStart', 50)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.038);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.040);
    } catch {
      // Safe fallback
    }
  }

  // Drag Enter Target Slot: tiny magnetic tick (Vol: 0.06, Dur: ~18ms)
  public playDragTarget() {
    if (!this.initCtx() || this.shouldThrottle('dragTarget', 80)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.016);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.018);
    } catch {
      // Safe fallback
    }
  }

  // Successful Drop: soft mechanical snap + short digital confirmation (Vol: 0.12)
  public playDropSuccess() {
    if (!this.initCtx() || this.shouldThrottle('dropSuccess', 45)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(460, now);
      osc1.frequency.exponentialRampToValueAtTime(780, now + 0.045);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(820, now + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.055);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(now);
      osc1.stop(now + 0.050);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.065);
    } catch {
      // Safe fallback
    }
  }

  public playDrop() {
    this.playDropSuccess();
  }

  public playPlacement() {
    this.playDropSuccess();
  }

  // Invalid Drop / Location: soft mechanical reject / low muted tick (Vol: 0.08)
  public playDropInvalid() {
    if (!this.initCtx() || this.shouldThrottle('dropInvalid', 60)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.040);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Safe fallback
    }
  }

  public playInvalidDrop() {
    this.playDropInvalid();
  }

  // =========================================================================
  // 8. HASH TABLE INSERTION (Volume: 0.13, Duration: ~70ms)
  // Satisfying mechanical insertion snap ("click -> snap")
  // =========================================================================
  public playInsert() {
    if (!this.initCtx() || this.shouldThrottle('insert', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.04);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(700, now + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(980, now + 0.065);

      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.070);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(now);
      osc1.stop(now + 0.045);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.070);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 9. HASH TABLE COLLISION (Volume: 0.11, Duration: ~90ms)
  // Distinct subtle double tick ("tick-tick" mechanical knock, not failure)
  // =========================================================================
  public playCollision() {
    if (!this.initCtx() || this.shouldThrottle('collision', 60)) return;
    try {
      const now = this.ctx!.currentTime;
      [0, 0.045].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + offset;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.030);

        gain.gain.setValueAtTime(0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.038);
      });
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 10. COLLISION RESOLUTION / PROBING
  // =========================================================================
  // Probing Step / Jump tick (Vol: 0.09, Dur: ~35ms)
  public playProbeStep() {
    if (!this.initCtx() || this.shouldThrottle('probe', 25)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance();
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(680 * pitch, now + 0.030);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Safe fallback
    }
  }

  public playStep() {
    this.playProbeStep();
  }

  public playProbeJump() {
    this.playProbeStep();
  }

  // Collision Resolution confirmed (Vol: 0.13, Dur: ~75ms)
  public playResolution() {
    if (!this.initCtx() || this.shouldThrottle('resolution', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.055);

      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // Safe fallback
    }
  }

  public playResolutionSuccess() {
    this.playResolution();
  }

  public playCalcSuccess() {
    this.playResolution();
  }

  // Chaining Link / Snap (Vol: 0.10, Dur: ~50ms)
  public playChain() {
    if (!this.initCtx() || this.shouldThrottle('chain', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      [0, 0.020].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + offset;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620 + offset * 400, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.022);

        gain.gain.setValueAtTime(0.10, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.025);
      });
    } catch {
      // Safe fallback
    }
  }

  public playChainLink() {
    this.playChain();
  }

  // =========================================================================
  // 11. DELETE & POP OPERATIONS
  // =========================================================================
  // Delete: soft mechanical release (Vol: 0.10, Dur: ~65ms)
  public playDelete() {
    if (!this.initCtx() || this.shouldThrottle('delete', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.055);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // Safe fallback
    }
  }

  public playRemoval() {
    this.playDelete();
  }

  // Pop: technical soft pop + mechanical click (Vol: 0.10, Dur: ~40ms)
  public playPop() {
    if (!this.initCtx() || this.shouldThrottle('pop', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.linearRampToValueAtTime(620, now + 0.015);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.038);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.040);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 12. SEARCH OPERATIONS
  // =========================================================================
  // Search Scan tick (Vol: 0.09, Dur: ~50ms)
  public playSearch() {
    if (!this.initCtx() || this.shouldThrottle('search', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.042);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.050);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.050);
    } catch {
      // Safe fallback
    }
  }

  // Search Found Confirmation (Vol: 0.12, Dur: ~140ms)
  public playSearchSuccess() {
    if (!this.initCtx() || this.shouldThrottle('searchSuccess', 50)) return;
    try {
      const now = this.ctx!.currentTime;
      [659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.11);
      });
    } catch {
      // Safe fallback
    }
  }

  public playConfirmation() {
    this.playSearchSuccess();
  }

  // Search Not Found (Vol: 0.08, Dur: ~80ms)
  public playSearchFailure() {
    if (!this.initCtx() || this.shouldThrottle('searchFail', 50)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 13. QUIZ INTERACTIONS & FEEDBACK
  // =========================================================================
  public playQuizSelect() {
    this.playNav();
  }

  public playQuizOption() {
    this.playNav();
  }

  // Correct: Elegant 3-micro-note harmonic chime (Vol: 0.14, Dur: ~350ms)
  public playCorrect() {
    if (!this.initCtx() || this.shouldThrottle('correct', 80)) return;
    try {
      const now = this.ctx!.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.26);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // Safe fallback
    }
  }

  public playSuccess() {
    this.playCorrect();
  }

  public playQuizCorrect() {
    this.playCorrect();
  }

  // Incorrect / Error: Gentle low soft click / digital reject (Vol: 0.09, non-punishing)
  public playError() {
    if (!this.initCtx() || this.shouldThrottle('error', 80)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.10);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(170, now);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.10);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } catch {
      // Safe fallback
    }
  }

  public playWrong() {
    this.playError();
  }

  public playQuizWrong() {
    this.playError();
  }

  public playNextQuestion() {
    this.playNav();
  }

  public playPrevQuestion() {
    this.playNav();
  }

  // =========================================================================
  // 14. RESET & CLEAR
  // =========================================================================
  // Reset: Click + soft downward tick <140ms (Vol: 0.10)
  public playReset() {
    if (!this.initCtx() || this.shouldThrottle('reset', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(680, now);
      osc1.frequency.exponentialRampToValueAtTime(240, now + 0.05);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(420, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(now);
      osc1.stop(now + 0.06);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.14);
    } catch {
      // Safe fallback
    }
  }

  // Clear: Soft mechanical sweep (Vol: 0.11, Dur: ~80ms)
  public playClear() {
    if (!this.initCtx() || this.shouldThrottle('clear', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Safe fallback
    }
  }

  // Random: Subtle generation tick (Vol: 0.09)
  public playRandom() {
    if (!this.initCtx() || this.shouldThrottle('random', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const pitch = this.getPitchVariance(0.05);
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(1060 * pitch, now + 0.035);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.040);
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 15. LEVEL & MILESTONE COMPLETIONS
  // =========================================================================
  // Level Complete Chime: Ascending warm arpeggio (Vol: 0.16, Dur: ~400ms)
  public playLevelComplete() {
    if (!this.initCtx() || this.shouldThrottle('levelComplete', 150)) return;
    try {
      const now = this.ctx!.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.065;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Safe fallback
    }
  }

  public playComplete() {
    this.playLevelComplete();
  }

  public playQuizComplete() {
    this.playLevelComplete();
  }

  public playLevelVictory() {
    this.playLevelComplete();
  }

  // Module / Progress Saved (Vol: 0.13, Dur: ~280ms)
  public playModuleComplete() {
    if (!this.initCtx() || this.shouldThrottle('moduleComplete', 120)) return;
    try {
      const now = this.ctx!.currentTime;
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.13, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // Safe fallback
    }
  }

  public playTheoryComplete() {
    this.playModuleComplete();
  }

  // Level Unlock Chime (Vol: 0.14, Dur: ~250ms)
  public playLevelUnlock() {
    if (!this.initCtx() || this.shouldThrottle('unlock', 120)) return;
    try {
      const now = this.ctx!.currentTime;
      const notes = [587.33, 783.99, 1174.66]; // D5, G5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 16. PANELS, ACCORDIONS & MODALS
  // =========================================================================
  public playPanelOpen() {
    if (!this.initCtx() || this.shouldThrottle('panelOpen', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.032);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Safe fallback
    }
  }

  public playPanelClose() {
    if (!this.initCtx() || this.shouldThrottle('panelClose', 30)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.032);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Safe fallback
    }
  }

  public playModalOpen() {
    this.playPanelOpen();
  }

  public playModalClose() {
    this.playPanelClose();
  }

  // Key Appearance in Game
  public playKeyAppear() {
    if (!this.initCtx() || this.shouldThrottle('appear', 35)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.045);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Safe fallback
    }
  }

  // 100% Curriculum Completion Celebration Fanfare
  public play100PercentFanfare() {
    if (!this.initCtx()) return;
    try {
      const now = this.ctx!.currentTime;
      const melody = [
        { f: 523.25, t: 0.0 },
        { f: 659.25, t: 0.07 },
        { f: 783.99, t: 0.14 },
        { f: 1046.50, t: 0.21 },
        { f: 1318.51, t: 0.32 },
        { f: 1567.98, t: 0.45 },
      ];

      melody.forEach(({ f, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + t;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0.17, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.40);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.40);
      });
    } catch {
      // Safe fallback
    }
  }

  // =========================================================================
  // 17. VIDEO PLAYER MECHANICAL SOUND EFFECTS
  // =========================================================================
  public playVideoPlay() {
    if (!this.initCtx() || this.shouldThrottle('vPlay', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Safe fallback
    }
  }

  public playVideoPause() {
    if (!this.initCtx() || this.shouldThrottle('vPause', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.038);
    } catch {
      // Safe fallback
    }
  }

  public playVideoSeek() {
    if (!this.initCtx() || this.shouldThrottle('vSeek', 50)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(940, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.018);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.022);
    } catch {
      // Safe fallback
    }
  }

  public playVideoSpeed() {
    if (!this.initCtx() || this.shouldThrottle('vSpeed', 40)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.025);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch {
      // Safe fallback
    }
  }

  public playVideoFullscreen(enter: boolean) {
    if (!this.initCtx() || this.shouldThrottle('vFull', 50)) return;
    try {
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      if (enter) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      } else {
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Safe fallback
    }
  }

  public playVideoComplete() {
    if (!this.initCtx() || this.shouldThrottle('vComplete', 100)) return;
    try {
      const now = this.ctx!.currentTime;
      const notes = [659.25, 987.77]; // E5, B5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.20);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.20);
      });
    } catch {
      // Safe fallback
    }
  }
}

export const soundManager = new SoundEffectsController();
export const soundFx = soundManager;
export default soundManager;
