import { create } from 'zustand';
import { csAudio } from '@/core/audio/cs-audio';
import { persistArcadeScore } from '@/local-db';

export type DefusalDifficulty = 'recruit' | 'agent' | 'special_forces' | 'impossible';

export interface DefusalTierConfig {
  id: DefusalDifficulty;
  name: string;
  badge: string;
  startingSeconds: number;
  typoPenaltySeconds: number;
  wireCount: number;
  description: string;
  color: string;
}

export const DEFUSAL_TIERS: Record<DefusalDifficulty, DefusalTierConfig> = {
  recruit: {
    id: 'recruit',
    name: 'Recruit',
    badge: 'Trainee',
    startingSeconds: 45.0,
    typoPenaltySeconds: 1.5,
    wireCount: 3,
    description: 'Lowercase tactical passphrases. Generous 45s timer.',
    color: 'text-emerald-400',
  },
  agent: {
    id: 'agent',
    name: 'Agent',
    badge: 'Field Ops',
    startingSeconds: 30.0,
    typoPenaltySeconds: 3.0,
    wireCount: 4,
    description: 'Alpha-numeric disarm codes & relay triggers. -3.0s typo penalty.',
    color: 'text-amber-400',
  },
  special_forces: {
    id: 'special_forces',
    name: 'Special Forces',
    badge: 'Elite CT',
    startingSeconds: 22.0,
    typoPenaltySeconds: 4.0,
    wireCount: 5,
    description: 'Mixed casing, hex registers & punctuation. Strict 22s timer.',
    color: 'text-rose-400',
  },
  impossible: {
    id: 'impossible',
    name: 'Impossible',
    badge: 'Global Elite',
    startingSeconds: 15.0,
    typoPenaltySeconds: 5.0,
    wireCount: 6,
    description: 'Cryptographic hashes & brackets. -5.0s penalty. Brutal crisis.',
    color: 'text-purple-400',
  },
};

export interface DefusalPhase {
  id: number;
  wireColor: 'yellow' | 'cyan' | 'red' | 'green' | 'purple' | 'orange';
  wireName: string;
  text: string;
  isCut: boolean;
}

const TIER_PHRASES: Record<DefusalDifficulty, Array<{ color: DefusalPhase['wireColor']; name: string; text: string }>> = {
  recruit: [
    { color: 'yellow', name: 'Yellow Ground Wire', text: 'authorize override delta-7' },
    { color: 'cyan', name: 'Cyan Relay Lead', text: 'defusal sequence 7355608' },
    { color: 'red', name: 'Red Primary Detonator', text: 'cut primary capacitor wire' },
  ],
  agent: [
    { color: 'yellow', name: 'Yellow Fuse Line', text: 'c4 armed: bypass code 7355608' },
    { color: 'cyan', name: 'Cyan Clock Trace', text: 'decouple circuit relay-94' },
    { color: 'green', name: 'Green Data Bus', text: 'cut wire: terminal-frequency' },
    { color: 'red', name: 'Red Core Igniter', text: 'sys.defuse_payload(true)' },
  ],
  special_forces: [
    { color: 'yellow', name: 'Yellow Battery Line', text: 'AUTHENTICATE: defuse-protocol#82' },
    { color: 'cyan', name: 'Cyan Shunt Cable', text: 'snip wire[0x4F]: amber-pulse' },
    { color: 'purple', name: 'Purple Logic Gate', text: 'OVERRIDE: cipher_key = 7355608;' },
    { color: 'green', name: 'Green Telemetry Lead', text: 'cut_ground_bus(pin: 12);' },
    { color: 'red', name: 'Red Blasting Cap', text: 'detonate = false; abort_sequence();' },
  ],
  impossible: [
    { color: 'yellow', name: 'Yellow Primary Core', text: 'C4_PAYLOAD::disarm(code="7355608")' },
    { color: 'cyan', name: 'Cyan Microcontroller', text: 'snip_wire(0xFA, color="CRIMSON")' },
    { color: 'purple', name: 'Purple Cryptographic Chip', text: 'crypto.verify_hash(salt="cs_dust2")' },
    { color: 'orange', name: 'Orange Relay Bus', text: 'for (let i = 0; i < 4; i++) bypass();' },
    { color: 'green', name: 'Green Voltage Regulator', text: 'override.force_cutoff(voltage=0.0);' },
    { color: 'red', name: 'Red Detonator Trigger', text: 'TERMINATE_DETONATOR: SUCCESS_200_OK' },
  ],
};

function generatePhases(tier: DefusalDifficulty): DefusalPhase[] {
  return TIER_PHRASES[tier].map((item, idx) => ({
    id: idx + 1,
    wireColor: item.color,
    wireName: item.name,
    text: item.text,
    isCut: false,
  }));
}

interface DefusalStoreState {
  status: 'ready' | 'running' | 'defused' | 'detonated';
  difficulty: DefusalDifficulty;
  phases: DefusalPhase[];
  currentPhaseIndex: number;
  charIndex: number;
  remainingSeconds: number;
  totalKeystrokes: number;
  totalErrors: number;
  penaltyFlash: number | null;
  screenShake: boolean;
  soundEnabled: boolean;
  score: number;
  wpm: number;
  accuracy: number;

  // Actions
  setDifficulty: (tier: DefusalDifficulty) => void;
  toggleSound: () => void;
  startGame: () => void;
  resetGame: () => void;
  handleInputKey: (key: string) => void;
  tick: (deltaSeconds: number) => void;
}

export const useBombDefusalStore = create<DefusalStoreState>((set, get) => {
  let lastBeepTime = 0;
  let startTime = 0;

  return {
    status: 'ready',
    difficulty: 'agent',
    phases: generatePhases('agent'),
    currentPhaseIndex: 0,
    charIndex: 0,
    remainingSeconds: DEFUSAL_TIERS['agent'].startingSeconds,
    totalKeystrokes: 0,
    totalErrors: 0,
    penaltyFlash: null,
    screenShake: false,
    soundEnabled: true,
    score: 0,
    wpm: 0,
    accuracy: 100,

    setDifficulty: (tier) => {
      set({
        difficulty: tier,
        phases: generatePhases(tier),
        remainingSeconds: DEFUSAL_TIERS[tier].startingSeconds,
        currentPhaseIndex: 0,
        charIndex: 0,
        status: 'ready',
        totalKeystrokes: 0,
        totalErrors: 0,
        penaltyFlash: null,
        screenShake: false,
      });
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      csAudio.setEnabled(next);
      set({ soundEnabled: next });
    },

    startGame: () => {
      const { difficulty } = get();
      startTime = Date.now();
      lastBeepTime = 0;

      // Play iconic Counter-Strike "The bomb has been planted" announcement
      csAudio.playBombPlanted();

      set({
        status: 'running',
        phases: generatePhases(difficulty),
        currentPhaseIndex: 0,
        charIndex: 0,
        remainingSeconds: DEFUSAL_TIERS[difficulty].startingSeconds,
        totalKeystrokes: 0,
        totalErrors: 0,
        penaltyFlash: null,
        screenShake: false,
        score: 0,
        wpm: 0,
        accuracy: 100,
      });
    },

    resetGame: () => {
      const { difficulty } = get();
      set({
        status: 'ready',
        phases: generatePhases(difficulty),
        currentPhaseIndex: 0,
        charIndex: 0,
        remainingSeconds: DEFUSAL_TIERS[difficulty].startingSeconds,
        totalKeystrokes: 0,
        totalErrors: 0,
        penaltyFlash: null,
        screenShake: false,
      });
    },

    handleInputKey: (key: string) => {
      const state = get();
      if (state.status !== 'running') return;

      const currentPhase = state.phases[state.currentPhaseIndex];
      if (!currentPhase) return;

      const targetChar = currentPhase.text[state.charIndex];

      // Ignore modifiers or non-character keys
      if (key.length > 1 && key !== 'Backspace') return;

      if (key === 'Backspace') {
        if (state.charIndex > 0) {
          set({ charIndex: state.charIndex - 1 });
        }
        return;
      }

      set({ totalKeystrokes: state.totalKeystrokes + 1 });

      if (key === targetChar) {
        // Correct character typed
        const nextCharIndex = state.charIndex + 1;

        if (nextCharIndex >= currentPhase.text.length) {
          // Phase Cleared! Snip the wire!
          csAudio.playWireCut();

          const updatedPhases = [...state.phases];
          updatedPhases[state.currentPhaseIndex].isCut = true;

          const nextPhaseIndex = state.currentPhaseIndex + 1;

          if (nextPhaseIndex >= state.phases.length) {
            // ALL WIRES CUT! BOMB DEFUSED!
            const totalElapsedMs = Math.max(1, Date.now() - startTime);
            const totalElapsedMins = totalElapsedMs / 60000;
            const wpm = Math.round((state.totalKeystrokes / 5) / totalElapsedMins);
            const accuracy = Math.round(
              ((state.totalKeystrokes - state.totalErrors) / Math.max(1, state.totalKeystrokes)) * 100
            );
            const timeBonus = Math.round(state.remainingSeconds * 100);
            const finalScore = Math.max(100, timeBonus + wpm * 10);

            csAudio.playDefusedVictory();

            // Persist score in background to IndexedDB
            persistArcadeScore({
              id: `defuse-${Date.now()}`,
              gameId: 'defuse',
              difficulty: state.difficulty,
              score: finalScore,
              wpm,
              accuracy,
              achievedAt: new Date().toISOString(),
            }).catch(() => {});

            set({
              status: 'defused',
              phases: updatedPhases,
              currentPhaseIndex: nextPhaseIndex,
              charIndex: 0,
              score: finalScore,
              wpm,
              accuracy,
            });
            return;
          }

          set({
            phases: updatedPhases,
            currentPhaseIndex: nextPhaseIndex,
            charIndex: 0,
          });
        } else {
          set({ charIndex: nextCharIndex });
        }
      } else {
        // TYPO / MISTAKE: SEVERE TIME DEDUCTION PENALTY!
        const penalty = DEFUSAL_TIERS[state.difficulty].typoPenaltySeconds;
        const newRemaining = Math.max(0, state.remainingSeconds - penalty);

        csAudio.playTypoPenaltyZap();

        set({
          totalErrors: state.totalErrors + 1,
          remainingSeconds: newRemaining,
          penaltyFlash: penalty,
          screenShake: true,
        });

        setTimeout(() => set({ screenShake: false }), 350);
        setTimeout(() => set({ penaltyFlash: null }), 600);

        if (newRemaining <= 0) {
          // BOMB DETONATED FROM TYPO PENALTY
          csAudio.playExplosion();
          set({ status: 'detonated', remainingSeconds: 0 });
        }
      }
    },

    tick: (deltaSeconds: number) => {
      const state = get();
      if (state.status !== 'running') return;

      const nextRemaining = Math.max(0, state.remainingSeconds - deltaSeconds);

      // Accelerating C4 beep interval matching Counter-Strike
      let beepInterval = 1.0;
      if (nextRemaining < 2.0) {
        beepInterval = 0.08;
      } else if (nextRemaining < 5.0) {
        beepInterval = 0.15;
      } else if (nextRemaining < 10.0) {
        beepInterval = 0.28;
      } else if (nextRemaining < 20.0) {
        beepInterval = 0.5;
      }

      const now = Date.now();
      if (now - lastBeepTime >= beepInterval * 1000) {
        lastBeepTime = now;
        csAudio.playC4Beep();
      }

      if (nextRemaining <= 0) {
        // DETONATION!
        csAudio.playExplosion();
        set({
          status: 'detonated',
          remainingSeconds: 0,
        });
        return;
      }

      set({ remainingSeconds: nextRemaining });
    },
  };
});
