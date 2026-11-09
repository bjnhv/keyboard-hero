/**
 * Counter-Strike Themed Tactical Bomb Defusal Audio Engine
 *
 * Provides authentic Counter-Strike audio cues with high-fidelity procedural fallbacks:
 * - Authentic radio dispatch: "The bomb has been planted" (bombpl.wav)
 * - Authentic C4 countdown digital beep (c4_beep1.wav)
 * - Authentic wire disarm sound (c4_disarm.wav)
 * - Authentic explosion rumble & detonation (c4_explode1.wav)
 * - Authentic victory calls: "Bomb has been defused" (bombdef.wav) & "Counter-Terrorists win" (ctwin.wav)
 * - Authentic defeat call: "Terrorists win" (terwin.wav)
 * - Procedural typo electric zap & alarm penalty
 */

const CS_AUDIO_FILES = {
  bombPlanted: '/sounds/cs/bombpl.wav',
  c4Beep: '/sounds/cs/c4_beep1.wav',
  wireCut: '/sounds/cs/c4_disarm.wav',
  explode: '/sounds/cs/c4_explode1.wav',
  defused: '/sounds/cs/bombdef.wav',
  ctWin: '/sounds/cs/ctwin.wav',
  terWin: '/sounds/cs/terwin.wav',
  letsGo: '/sounds/cs/letsgo.wav',
} as const;

type CsSoundKey = keyof typeof CS_AUDIO_FILES;

export class CsBombAudioSynth {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private audioBuffers: Map<CsSoundKey, AudioBuffer> = new Map();
  private isPreloading: boolean = false;

  constructor(enabled: boolean = true, volume: number = 0.5) {
    this.isEnabled = enabled;
    this.volume = volume;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && !this.isPreloading && this.audioBuffers.size === 0) {
      this.preload();
    }

    return this.ctx;
  }

  /**
   * Preloads all authentic CS sound assets into decoded audio buffers for zero latency.
   */
  public async preload(): Promise<void> {
    if (typeof window === 'undefined' || this.isPreloading) return;
    this.isPreloading = true;

    const ctx = this.initContext();
    if (!ctx) {
      this.isPreloading = false;
      return;
    }

    const entries = Object.entries(CS_AUDIO_FILES) as [CsSoundKey, string][];

    await Promise.all(
      entries.map(async ([key, url]) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const arrayBuf = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuf);
          this.audioBuffers.set(key, decoded);
        } catch {
          // Graceful fallback to procedural synthesis on load error
        }
      })
    );

    this.isPreloading = false;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Helper to play an authentic preloaded sound buffer, with custom procedural fallback.
   */
  private playSample(
    key: CsSoundKey,
    fallback: () => void,
    volumeMultiplier: number = 1.0
  ): boolean {
    if (!this.isEnabled) return false;
    const ctx = this.initContext();
    if (!ctx) return false;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) {
      fallback();
      return false;
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * volumeMultiplier, ctx.currentTime);

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return true;
    } catch {
      fallback();
      return false;
    }
  }

  /**
   * Radio walkie-talkie squelch / static click sound.
   */
  public playRadioClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms burst
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
    } catch {
      // Audio node error safety
    }
  }

  /**
   * Fallback speech radio dispatch when audio asset is not ready.
   */
  public speakRadio(text: string, onEnd?: () => void): void {
    if (!this.isEnabled) return;
    this.playRadioClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.85; // deep military commander tone
        utterance.volume = this.volume;

        const voices = window.speechSynthesis.getVoices();
        const enVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('David') || v.name.includes('Male') || v.name.includes('Natural'))
          ) || voices.find((v) => v.lang.startsWith('en'));

        if (enVoice) {
          utterance.voice = enVoice;
        }

        utterance.onend = () => {
          this.playRadioClick();
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }

  /**
   * At round start: "The bomb has been planted."
   */
  public playBombPlanted(): void {
    this.playSample('bombPlanted', () => {
      this.speakRadio('The bomb has been planted.');
    }, 1.2);
  }

  /**
   * Iconic Counter-Strike high-frequency C4 digital beep (c4_beep1.wav).
   */
  public playC4Beep(): void {
    this.playSample('c4Beep', () => {
      // Procedural 1760Hz sine pulse fallback
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);

      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    }, 1.0);
  }

  /**
   * Wire cutting / disarm sound.
   */
  public playWireCut(): void {
    this.playSample('wireCut', () => {
      // Procedural metallic snip fallback
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }, 0.9);
  }

  /**
   * Harsh electric short-circuit zap on typo mistake penalty.
   */
  public playTypoPenaltyZap(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Sawtooth harsh buzz
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.18);

      oscGain.gain.setValueAtTime(this.volume * 0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      // 2. High-pitch warning alarm pip
      const pip = ctx.createOscillator();
      const pipGain = ctx.createGain();
      pip.type = 'square';
      pip.frequency.setValueAtTime(880, now);
      pip.frequency.setValueAtTime(440, now + 0.08);

      pipGain.gain.setValueAtTime(this.volume * 0.3, now);
      pipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      pip.connect(pipGain);
      pipGain.connect(ctx.destination);
      pip.start(now);
      pip.stop(now + 0.18);
    } catch {
      // Audio node error safety
    }
  }

  /**
   * C4 Explosion on timeout detonation.
   */
  public playExplosion(): void {
    const hasSample = this.playSample('explode', () => {
      // Procedural explosion fallback
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 1.5);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + 1.4);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(this.volume * 0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      subGain.gain.setValueAtTime(this.volume * 0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.3);
    }, 1.3);

    // Follow up with "Terrorists win"
    setTimeout(() => {
      this.playSample('terWin', () => {
        this.speakRadio('Terrorists win.');
      }, 1.2);
    }, 1400);
  }

  /**
   * Victory dispatch: "Bomb has been defused. Counter-Terrorists win!"
   */
  public playDefusedVictory(): void {
    const playedSample = this.playSample('defused', () => {
      // Procedural chime fallback
      const ctx = this.initContext();
      if (ctx) {
        const now = ctx.currentTime;
        [587.33, 739.99, 880.0, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(this.volume * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
      }
    }, 1.2);

    // Follow up with "Counter-Terrorists win"
    setTimeout(() => {
      this.playSample('ctWin', () => {
        this.speakRadio('Bomb has been defused. Counter-Terrorists win!');
      }, 1.2);
    }, 1200);
  }
}

export const csAudio = new CsBombAudioSynth();
