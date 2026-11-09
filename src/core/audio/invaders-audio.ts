/**
 * Authentic 1978 Space Invaders Arcade Audio Engine
 *
 * Implements original nostalgic arcade audio cues with high-fidelity procedural Web Audio fallbacks:
 * - Original Fast Invader 4-note marching heartbeat (fastinvader1.wav - fastinvader4.wav)
 * - Original Player Cannon laser blast (shoot.wav)
 * - Original Invader vaporize / crunchy explosion (invaderkilled.wav)
 * - Original Mystery Flying Saucer (UFO) warble siren (ufo_highpitch.wav)
 * - Original UFO direct hit explosion (ufo_lowpitch.wav)
 * - Original Base / Cannon destruction explosion (explosion.wav)
 * - Procedural 8-bit Victory / Wave Clear Fanfare
 */

const INVADER_AUDIO_FILES = {
  fastinvader1: '/sounds/invaders/fastinvader1.wav',
  fastinvader2: '/sounds/invaders/fastinvader2.wav',
  fastinvader3: '/sounds/invaders/fastinvader3.wav',
  fastinvader4: '/sounds/invaders/fastinvader4.wav',
  shoot: '/sounds/invaders/shoot.wav',
  invaderkilled: '/sounds/invaders/invaderkilled.wav',
  explosion: '/sounds/invaders/explosion.wav',
  ufoHigh: '/sounds/invaders/ufo_highpitch.wav',
  ufoLow: '/sounds/invaders/ufo_lowpitch.wav',
} as const;

type InvaderSoundKey = keyof typeof INVADER_AUDIO_FILES;

export class SpaceInvadersAudioSynth {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private audioBuffers: Map<InvaderSoundKey, AudioBuffer> = new Map();
  private isPreloading: boolean = false;
  private ufoSourceNode: AudioBufferSourceNode | null = null;
  private ufoProceduralOsc: OscillatorNode | null = null;
  private ufoProceduralGain: GainNode | null = null;
  private ufoProceduralLfo: OscillatorNode | null = null;

  constructor(enabled: boolean = true, volume: number = 0.5) {
    this.isEnabled = enabled;
    this.volume = volume;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Preloads all WAV sound files into memory for zero-latency instant playback.
   */
  public async preload(): Promise<void> {
    if (typeof window === 'undefined' || this.isPreloading) return;
    this.isPreloading = true;

    const ctx = this.initContext();
    if (!ctx) return;

    const loadSound = async (key: InvaderSoundKey, url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        this.audioBuffers.set(key, audioBuf);
      } catch {
        // Fallback silently to procedural synthesis
      }
    };

    await Promise.all(
      Object.entries(INVADER_AUDIO_FILES).map(([k, u]) =>
        loadSound(k as InvaderSoundKey, u)
      )
    );
    this.isPreloading = false;
  }

  /**
   * Plays a preloaded audio buffer with instant low-latency trigger.
   */
  private playBuffer(
    key: InvaderSoundKey,
    volumeMul: number = 1.0,
    pitchRate: number = 1.0
  ): boolean {
    if (!this.isEnabled) return false;
    const ctx = this.initContext();
    if (!ctx) return false;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) return false;

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = pitchRate;

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, this.volume * volumeMul));

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Plays the iconic 4-note descending alien marching heartbeat sound.
   * step: 0, 1, 2, 3 corresponding to fastinvader1 through fastinvader4.
   */
  public playMarch(step: number = 0): void {
    if (!this.isEnabled) return;
    const soundKeys: InvaderSoundKey[] = [
      'fastinvader1',
      'fastinvader2',
      'fastinvader3',
      'fastinvader4',
    ];
    const key = soundKeys[step % 4] ?? 'fastinvader1';

    if (this.playBuffer(key, 0.75)) return;

    // Procedural Fallback: Exact original arcade march pitch step
    const ctx = this.initContext();
    if (!ctx) return;

    const freqs = [105, 95, 88, 80];
    const freq = freqs[step % 4] ?? 105;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(this.volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Plays the player cannon laser shot (sharp downwards frequency sweep).
   */
  public playShoot(): void {
    if (!this.isEnabled) return;
    if (this.playBuffer('shoot', 0.65)) return;

    // Procedural Fallback: Downward laser frequency sweep
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Plays the classic crunchy white-noise alien vaporize sound.
   */
  public playInvaderKilled(): void {
    if (!this.isEnabled) return;
    if (this.playBuffer('invaderkilled', 0.8)) return;

    // Procedural Fallback: Filtered noise explosion burst
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.22);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  /**
   * Starts the continuous mysterious UFO flying saucer siren warble.
   */
  public startUfo(): void {
    if (!this.isEnabled) return;
    this.stopUfo();

    const ctx = this.initContext();
    if (!ctx) return;

    const buffer = this.audioBuffers.get('ufoHigh');
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = this.volume * 0.45;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        this.ufoSourceNode = source;
        return;
      } catch {}
    }

    // Procedural Fallback: LFO modulated siren
    const now = ctx.currentTime;
    const carrier = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'triangle';
    carrier.frequency.setValueAtTime(520, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(7.5, now); // 7.5 Hz warble rate

    lfoGain.gain.setValueAtTime(140, now); // modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    mainGain.gain.setValueAtTime(this.volume * 0.35, now);

    carrier.connect(mainGain);
    mainGain.connect(ctx.destination);

    carrier.start(now);
    lfo.start(now);

    this.ufoProceduralOsc = carrier;
    this.ufoProceduralLfo = lfo;
    this.ufoProceduralGain = mainGain;
  }

  /**
   * Stops the UFO flying saucer audio.
   */
  public stopUfo(): void {
    if (this.ufoSourceNode) {
      try {
        this.ufoSourceNode.stop();
        this.ufoSourceNode.disconnect();
      } catch {}
      this.ufoSourceNode = null;
    }

    if (this.ufoProceduralOsc) {
      try {
        this.ufoProceduralOsc.stop();
        this.ufoProceduralOsc.disconnect();
      } catch {}
      this.ufoProceduralOsc = null;
    }

    if (this.ufoProceduralLfo) {
      try {
        this.ufoProceduralLfo.stop();
        this.ufoProceduralLfo.disconnect();
      } catch {}
      this.ufoProceduralLfo = null;
    }
  }

  /**
   * Plays the UFO destruction bonus sound.
   */
  public playUfoHit(): void {
    this.stopUfo();
    if (!this.isEnabled) return;
    if (this.playBuffer('ufoLow', 0.9)) return;

    this.playExplosion();
  }

  /**
   * Plays base/cannon destruction explosion.
   */
  public playExplosion(): void {
    if (!this.isEnabled) return;
    if (this.playBuffer('explosion', 0.9)) return;

    // Procedural Fallback: Low bass rumble explosion
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.55);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.95, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
  }

  /**
   * Plays a typo penalty zap.
   */
  public playTypoZap(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Plays retro 8-bit Victory / Wave Clear Fanfare.
   */
  public playVictory(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const noteDuration = 0.09;
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      gain.gain.setValueAtTime(this.volume * 0.5, now + idx * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * noteDuration);
      osc.stop(now + (idx + 1) * noteDuration);
    });
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) this.stopUfo();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

export const invadersAudio = new SpaceInvadersAudioSynth();

