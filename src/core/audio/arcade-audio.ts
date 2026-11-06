/**
 * Arcade Audio Synthesizer (Web Audio API)
 *
 * Procedurally generates dynamic arcade audio cues without external assets:
 * - Engine RPM rev pitch-bending proportional to typing speed
 * - Turbo blow-off pressure release
 * - Redline threshold alert & downshift warning
 * - Victory fanfare arpeggio
 * - Bomb defusal countdown tick & detonation burst
 */

export class ArcadeAudioSynth {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3;

  constructor(enabled: boolean = true, volume: number = 0.3) {
    this.isEnabled = enabled;
    this.volume = volume;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      this.ctx = new window.AudioContext();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Engine RPM rev sound whose pitch scales with current WPM.
   */
  public playEngineRev(wpm: number): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Map WPM (0 to 120) to frequency range 80Hz - 380Hz
    const baseFreq = 80 + Math.min(300, (wpm / 120) * 300);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Turbo blow-off valve pressure release sound when exceeding redline.
   */
  public playTurboBlowOff(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Warning downshift alarm when falling below the redline.
   */
  public playDownshiftWarning(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.setValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Victory fanfare arpeggio (C5 -> E5 -> G5 -> C6).
   */
  public playVictoryFanfare(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = startTime + index * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.volume * 0.5, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Bomb defusal digital countdown tick.
   */
  public playBombTick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const arcadeAudio = new ArcadeAudioSynth();
