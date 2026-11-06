import { create } from 'zustand';
import { arcadeAudio } from '@/core/audio/arcade-audio';
import { persistArcadeScore } from '@/local-db';

export type RedlineDifficulty = 'amateur' | 'sport' | 'supercar' | 'hypercar';

export interface DifficultyConfig {
  id: RedlineDifficulty;
  name: string;
  vehicleName: string;
  targetWpm: number;
  requiredHoldSeconds: number;
  color: string;
}

export const REDLINE_TIERS: Record<RedlineDifficulty, DifficultyConfig> = {
  amateur: {
    id: 'amateur',
    name: 'Amateur',
    vehicleName: 'Street Tuner',
    targetWpm: 35,
    requiredHoldSeconds: 10,
    color: 'text-sky-400',
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    vehicleName: 'GT Coupe',
    targetWpm: 50,
    requiredHoldSeconds: 15,
    color: 'text-amber-400',
  },
  supercar: {
    id: 'supercar',
    name: 'Supercar',
    vehicleName: 'V12 Prototype',
    targetWpm: 75,
    requiredHoldSeconds: 20,
    color: 'text-rose-400',
  },
  hypercar: {
    id: 'hypercar',
    name: 'Hypercar',
    vehicleName: 'Formula Electric',
    targetWpm: 100,
    requiredHoldSeconds: 25,
    color: 'text-emerald-400',
  },
};

const RACING_WORDS = [
  'turbo', 'boost', 'speed', 'engine', 'velocity', 'asphalt', 'throttle', 'gearbox',
  'drift', 'clutch', 'piston', 'torque', 'horsepower', 'exhaust', 'cylinder', 'apex',
  'drive', 'circuit', 'overdrive', 'needle', 'rpm', 'fast', 'sprint', 'chassis',
  'braking', 'drafting', 'racing', 'quarter', 'mile', 'supercharged', 'rev', 'fuel',
  'traction', 'flywheel', 'manifold', 'intercooler', 'combustion', 'redline', 'shift',
  'tires', 'smooth', 'rhythm', 'cadence', 'pedal', 'accel', 'cruising', 'highway',
];

function generateRacingStream(wordCount: number = 60): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(RACING_WORDS[Math.floor(Math.random() * RACING_WORDS.length)]);
  }
  return words.join(' ');
}

interface RedlineStoreState {
  status: 'ready' | 'running' | 'won' | 'lost';
  difficulty: RedlineDifficulty;
  textStream: string;
  charIndex: number;
  currentRollingWpm: number;
  peakWpm: number;
  holdSeconds: number;
  isRedlining: boolean;
  totalKeystrokes: number;
  totalErrors: number;
  elapsedSeconds: number;

  // Actions
  setDifficulty: (tier: RedlineDifficulty) => void;
  startGame: () => void;
  resetGame: () => void;
  handleInputKey: (key: string) => void;
  tickTimer: () => void;
}

export const useRedlineStore = create<RedlineStoreState>((set, get) => {
  let keystrokeTimestamps: number[] = [];
  let wasPreviouslyRedlining = false;

  return {
    status: 'ready',
    difficulty: 'sport',
    textStream: generateRacingStream(80),
    charIndex: 0,
    currentRollingWpm: 0,
    peakWpm: 0,
    holdSeconds: 0,
    isRedlining: false,
    totalKeystrokes: 0,
    totalErrors: 0,
    elapsedSeconds: 0,

    setDifficulty: (tier: RedlineDifficulty) => {
      set({ difficulty: tier });
      get().resetGame();
    },

    startGame: () => {
      keystrokeTimestamps = [];
      wasPreviouslyRedlining = false;
      set({
        status: 'running',
        charIndex: 0,
        currentRollingWpm: 0,
        peakWpm: 0,
        holdSeconds: 0,
        isRedlining: false,
        totalKeystrokes: 0,
        totalErrors: 0,
        elapsedSeconds: 0,
        textStream: generateRacingStream(80),
      });
    },

    resetGame: () => {
      keystrokeTimestamps = [];
      wasPreviouslyRedlining = false;
      set({
        status: 'ready',
        charIndex: 0,
        currentRollingWpm: 0,
        peakWpm: 0,
        holdSeconds: 0,
        isRedlining: false,
        totalKeystrokes: 0,
        totalErrors: 0,
        elapsedSeconds: 0,
        textStream: generateRacingStream(80),
      });
    },

    handleInputKey: (key: string) => {
      const state = get();
      if (state.status !== 'running') {
        if (state.status === 'ready') {
          get().startGame();
        } else {
          return;
        }
      }

      const expectedChar = state.textStream[state.charIndex];
      const now = performance.now();

      if (key === expectedChar) {
        // Correct character typed
        keystrokeTimestamps.push(now);

        // Calculate rolling WPM over sliding 2.5s window
        const windowMs = 2500;
        const validTimestamps = keystrokeTimestamps.filter((t) => t >= now - windowMs);
        keystrokeTimestamps = validTimestamps;

        const rollingWpm = Math.round((validTimestamps.length / 5) / (windowMs / 60000));
        const newPeak = Math.max(state.peakWpm, rollingWpm);

        // Audio engine rev proportional to speed
        arcadeAudio.playEngineRev(rollingWpm);

        // Next character index (extend stream if running low)
        let newStream = state.textStream;
        if (state.charIndex + 20 >= state.textStream.length) {
          newStream += ' ' + generateRacingStream(40);
        }

        set({
          charIndex: state.charIndex + 1,
          totalKeystrokes: state.totalKeystrokes + 1,
          currentRollingWpm: rollingWpm,
          peakWpm: newPeak,
          textStream: newStream,
        });
      } else if (key.length === 1) {
        // Mistake penalty
        set((s) => ({
          totalErrors: s.totalErrors + 1,
          totalKeystrokes: s.totalKeystrokes + 1,
        }));
      }
    },

    tickTimer: () => {
      const state = get();
      if (state.status !== 'running') return;

      const now = performance.now();
      const config = REDLINE_TIERS[state.difficulty];

      // Prune old keystroke timestamps (> 2.5s)
      const windowMs = 2500;
      const validTimestamps = keystrokeTimestamps.filter((t) => t >= now - windowMs);
      keystrokeTimestamps = validTimestamps;

      const rollingWpm =
        validTimestamps.length > 0
          ? Math.round((validTimestamps.length / 5) / (windowMs / 60000))
          : 0;

      const isOverRedline = rollingWpm >= config.targetWpm;

      if (isOverRedline && !wasPreviouslyRedlining) {
        arcadeAudio.playTurboBlowOff();
      } else if (!isOverRedline && wasPreviouslyRedlining) {
        arcadeAudio.playDownshiftWarning();
      }
      wasPreviouslyRedlining = isOverRedline;

      // Adjust hold duration
      let newHold = state.holdSeconds;
      if (isOverRedline) {
        newHold = Math.min(config.requiredHoldSeconds, state.holdSeconds + 0.1);
      } else {
        // Rapid decay when falling below redline
        newHold = Math.max(0, state.holdSeconds - 0.2);
      }

      // Check for victory condition!
      if (newHold >= config.requiredHoldSeconds) {
        arcadeAudio.playVictoryFanfare();
        const finalAccuracy =
          state.totalKeystrokes > 0
            ? Math.round(
                ((state.totalKeystrokes - state.totalErrors) / state.totalKeystrokes) * 100
              )
            : 100;

        // Persist high score in Dexie
        persistArcadeScore({
          id: `redline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          gameId: 'redline',
          difficulty: state.difficulty,
          score: Math.round(state.peakWpm),
          wpm: Math.round(state.peakWpm),
          accuracy: finalAccuracy,
          achievedAt: new Date().toISOString(),
        }).catch(() => {});

        set({
          status: 'won',
          holdSeconds: config.requiredHoldSeconds,
          isRedlining: true,
          currentRollingWpm: rollingWpm,
        });
        return;
      }

      set({
        currentRollingWpm: rollingWpm,
        isRedlining: isOverRedline,
        holdSeconds: Math.round(newHold * 10) / 10,
        elapsedSeconds: Math.round((state.elapsedSeconds + 0.1) * 10) / 10,
      });
    },
  };
});
