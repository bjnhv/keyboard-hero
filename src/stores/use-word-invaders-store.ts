import { create } from 'zustand';
import {
  InvaderDifficulty,
  INVADER_TIERS,
  getInvaderWords,
  getUfoWord,
} from '@/core/arcade/invaders-words';
import { invadersAudio } from '@/core/audio/invaders-audio';
import { KeyboardLayoutType } from '@/types/keyboard';
import { persistArcadeScore } from '@/local-db';

export interface InvaderEntity {
  id: string;
  word: string;
  typed: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  row: number;
  col: number;
  type: 'squid' | 'crab' | 'octopus';
  points: number;
  isAlive: boolean;
}

export interface UfoEntity {
  id: string;
  word: string;
  typed: string;
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  points: number;
}

export interface LaserBeam {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  createdAt: number;
}

export interface ExplosionParticle {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  color: string;
}

export type InvadersGameStatus = 'ready' | 'running' | 'paused' | 'won' | 'gameover';

export interface WordInvadersState {
  status: InvadersGameStatus;
  difficulty: InvaderDifficulty;
  keyboardLayout: KeyboardLayoutType;
  wave: number;
  score: number;
  highScore: number;
  shields: number;
  maxShields: number;
  invaders: InvaderEntity[];
  ufo: UfoEntity | null;
  targetId: string | null;
  activeLasers: LaserBeam[];
  explosions: ExplosionParticle[];
  cannonX: number;
  soundEnabled: boolean;
  screenShake: boolean;

  // Fleet marching state
  fleetDirection: 1 | -1;
  marchStep: 0 | 1 | 2 | 3;
  lastStepTime: number;
  lastUfoSpawnTime: number;

  // Performance metrics
  totalKeystrokes: number;
  totalErrors: number;
  wordsDestroyed: number;
  combo: number;
  maxCombo: number;
  startTime: number;
  elapsedSeconds: number;

  // Actions
  setDifficulty: (tier: InvaderDifficulty) => void;
  setLayout: (layout: KeyboardLayoutType) => void;
  toggleSound: () => void;
  startGame: () => void;
  resetGame: () => void;
  handleInputKey: (key: string) => void;
  tickGameLoop: (deltaSeconds: number) => void;
}

const ROWS = 3;
const COLS = 4;

function generateFleet(
  difficulty: InvaderDifficulty,
  layout: KeyboardLayoutType,
  wave: number
): InvaderEntity[] {
  const words = getInvaderWords(difficulty, layout, ROWS * COLS);
  const invaders: InvaderEntity[] = [];

  // 3 rows: Top = Squid (row 0), Middle = Crab (row 1), Bottom = Octopus (row 2)
  const types: ('squid' | 'crab' | 'octopus')[] = ['squid', 'crab', 'octopus'];
  const basePoints = [30, 20, 10];

  let wordIdx = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const type = types[r] ?? 'crab';
      const word = words[wordIdx++] ?? (type === 'squid' ? 'star' : 'ship');
      // Horizontal spacing centered across 15% to 85%
      const x = 20 + c * 18;
      // Vertical spacing starting around 12% + wave offset
      const y = 14 + r * 11;

      invaders.push({
        id: `invader-${r}-${c}-${wave}-${Date.now()}`,
        word,
        typed: '',
        x,
        y,
        row: r,
        col: c,
        type,
        points: (basePoints[r] ?? 10) * wave,
        isAlive: true,
      });
    }
  }

  return invaders;
}

export const useWordInvadersStore = create<WordInvadersState>((set, get) => ({
  status: 'ready',
  difficulty: 'commander',
  keyboardLayout: 'qwerty',
  wave: 1,
  score: 0,
  highScore: 0,
  shields: 3,
  maxShields: 3,
  invaders: [],
  ufo: null,
  targetId: null,
  activeLasers: [],
  explosions: [],
  cannonX: 50,
  soundEnabled: true,
  screenShake: false,

  fleetDirection: 1,
  marchStep: 0,
  lastStepTime: 0,
  lastUfoSpawnTime: 0,

  totalKeystrokes: 0,
  totalErrors: 0,
  wordsDestroyed: 0,
  combo: 0,
  maxCombo: 0,
  startTime: 0,
  elapsedSeconds: 0,

  setDifficulty: (difficulty) => {
    const tierConfig = INVADER_TIERS[difficulty];
    set({
      difficulty,
      shields: tierConfig.initialShields,
      maxShields: tierConfig.initialShields,
    });
    if (get().status === 'ready') {
      get().resetGame();
    }
  },

  setLayout: (layout) => {
    set({ keyboardLayout: layout });
    if (get().status === 'ready') {
      get().resetGame();
    }
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    invadersAudio.setEnabled(next);
    set({ soundEnabled: next });
  },

  startGame: () => {
    const { difficulty, keyboardLayout } = get();
    const tierConfig = INVADER_TIERS[difficulty];
    const fleet = generateFleet(difficulty, keyboardLayout, 1);
    const now = Date.now();

    invadersAudio.preload().catch(() => { });

    set({
      status: 'running',
      wave: 1,
      score: 0,
      shields: tierConfig.initialShields,
      maxShields: tierConfig.initialShields,
      invaders: fleet,
      ufo: null,
      targetId: null,
      activeLasers: [],
      explosions: [],
      fleetDirection: 1,
      marchStep: 0,
      lastStepTime: now,
      lastUfoSpawnTime: now,
      totalKeystrokes: 0,
      totalErrors: 0,
      wordsDestroyed: 0,
      combo: 0,
      maxCombo: 0,
      startTime: now,
      elapsedSeconds: 0,
      screenShake: false,
    });
  },

  resetGame: () => {
    invadersAudio.stopUfo();
    const { difficulty, keyboardLayout } = get();
    const tierConfig = INVADER_TIERS[difficulty];
    const fleet = generateFleet(difficulty, keyboardLayout, 1);

    set({
      status: 'ready',
      wave: 1,
      score: 0,
      shields: tierConfig.initialShields,
      maxShields: tierConfig.initialShields,
      invaders: fleet,
      ufo: null,
      targetId: null,
      activeLasers: [],
      explosions: [],
      cannonX: 50,
      fleetDirection: 1,
      marchStep: 0,
      lastStepTime: 0,
      lastUfoSpawnTime: 0,
      totalKeystrokes: 0,
      totalErrors: 0,
      wordsDestroyed: 0,
      combo: 0,
      maxCombo: 0,
      startTime: 0,
      elapsedSeconds: 0,
      screenShake: false,
    });
  },

  handleInputKey: (key: string) => {
    const { status, invaders, ufo, targetId, cannonX, difficulty, combo, maxCombo, score, wave, keyboardLayout } = get();
    if (status !== 'running') return;

    const tierConfig = INVADER_TIERS[difficulty];
    const now = Date.now();
    const isHebrew = keyboardLayout === 'hebrew';

    // Normalize comparison: case-insensitive for Latin, exact for Hebrew
    const normalize = (ch: string) => (isHebrew ? ch : ch.toLowerCase());
    const inputChar = normalize(key);

    // 1. If NO target locked: find candidate starting with key
    if (!targetId) {
      // Check UFO first
      if (ufo && normalize(ufo.word[0]) === inputChar) {
        const nextTyped = ufo.word[0];
        invadersAudio.playShoot();

        const laser: LaserBeam = {
          id: `laser-${now}`,
          fromX: cannonX,
          fromY: 90,
          toX: ufo.x,
          toY: ufo.y,
          createdAt: now,
        };

        const isCompleted = nextTyped.length >= ufo.word.length;
        if (isCompleted) {
          invadersAudio.playUfoHit();
          const bonusPts = Math.round(250 * tierConfig.pointsMultiplier);
          set({
            score: score + bonusPts,
            ufo: null,
            targetId: null,
            cannonX: ufo.x,
            activeLasers: [laser],
            totalKeystrokes: get().totalKeystrokes + 1,
            combo: combo + 1,
            maxCombo: Math.max(maxCombo, combo + 1),
          });
          return;
        }

        set({
          targetId: ufo.id,
          ufo: { ...ufo, typed: nextTyped },
          cannonX: ufo.x,
          activeLasers: [laser],
          totalKeystrokes: get().totalKeystrokes + 1,
          combo: combo + 1,
          maxCombo: Math.max(maxCombo, combo + 1),
        });
        return;
      }

      // Check alive invaders (prioritize lowest Y - closest to shields)
      const aliveInvaders = invaders.filter((inv) => inv.isAlive);
      const candidates = aliveInvaders.filter(
        (inv) => normalize(inv.word[0]) === inputChar
      );

      if (candidates.length === 0) {
        // Miss / Typo with no active target
        invadersAudio.playTypoZap();
        set({
          totalErrors: get().totalErrors + 1,
          combo: 0,
          screenShake: true,
        });
        setTimeout(() => set({ screenShake: false }), 120);
        return;
      }

      // Pick the lowest invader on screen (maximum Y value)
      candidates.sort((a, b) => b.y - a.y);
      const chosen = candidates[0];

      invadersAudio.playShoot();
      const nextTyped = chosen.word[0];
      const laser: LaserBeam = {
        id: `laser-${now}`,
        fromX: cannonX,
        fromY: 90,
        toX: chosen.x,
        toY: chosen.y,
        createdAt: now,
      };

      const isCompleted = nextTyped.length >= chosen.word.length;

      if (isCompleted) {
        // Destroyed immediately (1-letter word)
        invadersAudio.playInvaderKilled();
        const earned = Math.round(chosen.points * tierConfig.pointsMultiplier + combo * 5);
        const updatedInvaders = invaders.map((inv) =>
          inv.id === chosen.id ? { ...inv, isAlive: false, typed: nextTyped } : inv
        );
        const explosion: ExplosionParticle = {
          id: `expl-${now}`,
          x: chosen.x,
          y: chosen.y,
          createdAt: now,
          color: chosen.type === 'squid' ? '#f43f5e' : chosen.type === 'crab' ? '#06b6d4' : '#a855f7',
        };

        const remainingAlive = updatedInvaders.filter((inv) => inv.isAlive).length;
        if (remainingAlive === 0) {
          // Wave complete!
          invadersAudio.playVictory();
          const nextWave = wave + 1;
          const newFleet = generateFleet(difficulty, keyboardLayout, nextWave);
          set({
            score: score + earned + wave * 300,
            wave: nextWave,
            invaders: newFleet,
            targetId: null,
            cannonX: chosen.x,
            activeLasers: [laser],
            explosions: [...get().explosions, explosion],
            wordsDestroyed: get().wordsDestroyed + 1,
            totalKeystrokes: get().totalKeystrokes + 1,
            combo: combo + 1,
            maxCombo: Math.max(maxCombo, combo + 1),
          });
          return;
        }

        set({
          score: score + earned,
          invaders: updatedInvaders,
          targetId: null,
          cannonX: chosen.x,
          activeLasers: [laser],
          explosions: [...get().explosions, explosion],
          wordsDestroyed: get().wordsDestroyed + 1,
          totalKeystrokes: get().totalKeystrokes + 1,
          combo: combo + 1,
          maxCombo: Math.max(maxCombo, combo + 1),
        });
        return;
      }

      // Target locked!
      const updatedInvaders = invaders.map((inv) =>
        inv.id === chosen.id ? { ...inv, typed: nextTyped } : inv
      );

      set({
        targetId: chosen.id,
        invaders: updatedInvaders,
        cannonX: chosen.x,
        activeLasers: [laser],
        totalKeystrokes: get().totalKeystrokes + 1,
        combo: combo + 1,
        maxCombo: Math.max(maxCombo, combo + 1),
      });
      return;
    }

    // 2. Target IS LOCKED
    // Check if locked target is the UFO
    if (ufo && targetId === ufo.id) {
      const expectedChar = normalize(ufo.word[ufo.typed.length]);
      if (inputChar === expectedChar) {
        const nextTyped = ufo.typed + ufo.word[ufo.typed.length];
        invadersAudio.playShoot();

        const laser: LaserBeam = {
          id: `laser-${now}`,
          fromX: cannonX,
          fromY: 90,
          toX: ufo.x,
          toY: ufo.y,
          createdAt: now,
        };

        if (nextTyped.length >= ufo.word.length) {
          invadersAudio.playUfoHit();
          const bonusPts = Math.round(300 * tierConfig.pointsMultiplier);
          set({
            score: score + bonusPts,
            ufo: null,
            targetId: null,
            activeLasers: [laser],
            totalKeystrokes: get().totalKeystrokes + 1,
            combo: combo + 1,
            maxCombo: Math.max(maxCombo, combo + 1),
          });
          return;
        }

        set({
          ufo: { ...ufo, typed: nextTyped },
          activeLasers: [laser],
          totalKeystrokes: get().totalKeystrokes + 1,
          combo: combo + 1,
          maxCombo: Math.max(maxCombo, combo + 1),
        });
        return;
      }

      // Typo on UFO
      invadersAudio.playTypoZap();
      set({
        totalErrors: get().totalErrors + 1,
        combo: 0,
        screenShake: true,
      });
      setTimeout(() => set({ screenShake: false }), 120);
      return;
    }

    // Locked target is an invader
    const target = invaders.find((inv) => inv.id === targetId && inv.isAlive);
    if (!target) {
      set({ targetId: null });
      return;
    }

    const expectedChar = normalize(target.word[target.typed.length]);
    if (inputChar === expectedChar) {
      const nextTyped = target.typed + target.word[target.typed.length];
      invadersAudio.playShoot();

      const laser: LaserBeam = {
        id: `laser-${now}`,
        fromX: cannonX,
        fromY: 90,
        toX: target.x,
        toY: target.y,
        createdAt: now,
      };

      if (nextTyped.length >= target.word.length) {
        // Invader completely destroyed!
        invadersAudio.playInvaderKilled();
        const earned = Math.round(target.points * tierConfig.pointsMultiplier + combo * 5);
        const updatedInvaders = invaders.map((inv) =>
          inv.id === target.id ? { ...inv, isAlive: false, typed: nextTyped } : inv
        );
        const explosion: ExplosionParticle = {
          id: `expl-${now}`,
          x: target.x,
          y: target.y,
          createdAt: now,
          color: target.type === 'squid' ? '#f43f5e' : target.type === 'crab' ? '#06b6d4' : '#a855f7',
        };

        const remainingAlive = updatedInvaders.filter((inv) => inv.isAlive).length;
        if (remainingAlive === 0) {
          // Wave complete!
          invadersAudio.playVictory();
          const nextWave = wave + 1;
          const newFleet = generateFleet(difficulty, keyboardLayout, nextWave);
          set({
            score: score + earned + wave * 300,
            wave: nextWave,
            invaders: newFleet,
            targetId: null,
            cannonX: target.x,
            activeLasers: [laser],
            explosions: [...get().explosions, explosion],
            wordsDestroyed: get().wordsDestroyed + 1,
            totalKeystrokes: get().totalKeystrokes + 1,
            combo: combo + 1,
            maxCombo: Math.max(maxCombo, combo + 1),
          });
          return;
        }

        set({
          score: score + earned,
          invaders: updatedInvaders,
          targetId: null,
          cannonX: target.x,
          activeLasers: [laser],
          explosions: [...get().explosions, explosion],
          wordsDestroyed: get().wordsDestroyed + 1,
          totalKeystrokes: get().totalKeystrokes + 1,
          combo: combo + 1,
          maxCombo: Math.max(maxCombo, combo + 1),
        });
        return;
      }

      // Next char matched in word
      const updatedInvaders = invaders.map((inv) =>
        inv.id === target.id ? { ...inv, typed: nextTyped } : inv
      );
      set({
        invaders: updatedInvaders,
        activeLasers: [laser],
        totalKeystrokes: get().totalKeystrokes + 1,
        combo: combo + 1,
        maxCombo: Math.max(maxCombo, combo + 1),
      });
      return;
    }

    // Typo on active target
    invadersAudio.playTypoZap();
    set({
      totalErrors: get().totalErrors + 1,
      combo: 0,
      screenShake: true,
    });
    setTimeout(() => set({ screenShake: false }), 120);
  },

  tickGameLoop: (deltaSeconds: number) => {
    const {
      status,
      difficulty,
      invaders,
      ufo,
      fleetDirection,
      marchStep,
      lastStepTime,
      lastUfoSpawnTime,
      shields,
      score,
      totalKeystrokes,
      totalErrors,
      startTime,
      keyboardLayout,
    } = get();

    if (status !== 'running') return;

    const now = Date.now();
    const tierConfig = INVADER_TIERS[difficulty];
    const aliveInvaders = invaders.filter((inv) => inv.isAlive);

    // Clean old lasers and explosions
    const activeLasers = get().activeLasers.filter((l) => now - l.createdAt < 220);
    const explosions = get().explosions.filter((e) => now - e.createdAt < 450);

    // Calculate dynamic march step interval based on alive invaders count
    const aliveRatio = aliveInvaders.length / (ROWS * COLS);
    const dynamicStepInterval =
      tierConfig.minStepIntervalMs +
      (tierConfig.baseStepIntervalMs - tierConfig.minStepIntervalMs) * Math.max(0.1, aliveRatio);

    let nextInvaders = invaders;
    let nextDirection = fleetDirection;
    let nextMarchStep = marchStep;
    let nextLastStepTime = lastStepTime;
    let nextShields = shields;
    let nextStatus: InvadersGameStatus = status;

    // Execute fleet march step if interval elapsed
    if (now - lastStepTime >= dynamicStepInterval && aliveInvaders.length > 0) {
      nextLastStepTime = now;
      nextMarchStep = ((marchStep + 1) % 4) as 0 | 1 | 2 | 3;
      invadersAudio.playMarch(nextMarchStep);

      // Check if any invader will hit horizontal boundary
      const stepX = 2.4 * fleetDirection;
      const minX = Math.min(...aliveInvaders.map((inv) => inv.x));
      const maxX = Math.max(...aliveInvaders.map((inv) => inv.x));

      const willHitRight = maxX + stepX > 88;
      const willHitLeft = minX + stepX < 12;

      if (willHitRight || willHitLeft) {
        // Reverse and drop down 1 step
        nextDirection = (fleetDirection * -1) as 1 | -1;
        const dropY = 4.2;
        nextInvaders = invaders.map((inv) =>
          inv.isAlive ? { ...inv, y: inv.y + dropY } : inv
        );

        // Check if any invader touched the defense ground (y >= 80)
        const breached = nextInvaders.some((inv) => inv.isAlive && inv.y >= 80);
        if (breached) {
          invadersAudio.playExplosion();
          nextShields = Math.max(0, nextShields - 1);

          // Vaporize the invaders that breached
          nextInvaders = nextInvaders.map((inv) =>
            inv.isAlive && inv.y >= 80 ? { ...inv, isAlive: false } : inv
          );

          if (nextShields <= 0) {
            // Fleet reached Earth! Game over
            nextStatus = 'gameover';
            invadersAudio.stopUfo();
            invadersAudio.playExplosion();

            // Persist high score
            const elapsedMin = Math.max(0.1, (now - startTime) / 60000);
            const wpm = Math.round((totalKeystrokes / 5) / elapsedMin);
            const accuracy =
              totalKeystrokes > 0
                ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100)
                : 100;

            persistArcadeScore({
              id: `invaders-${now}`,
              gameId: 'invaders',
              difficulty,
              score,
              wpm,
              accuracy,
              achievedAt: new Date().toISOString(),
            }).catch(() => { });
          }
        }
      } else {
        // Normal horizontal step
        nextInvaders = invaders.map((inv) =>
          inv.isAlive ? { ...inv, x: inv.x + stepX } : inv
        );
      }
    }

    // UFO Management
    let nextUfo = ufo;
    let nextLastUfoSpawn = lastUfoSpawnTime;

    if (!ufo && (now - lastUfoSpawnTime) / 1000 >= tierConfig.ufoIntervalSeconds) {
      // Spawn UFO
      nextLastUfoSpawn = now;
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      const startX = dir === 1 ? 5 : 95;
      const bonusWord = getUfoWord(difficulty, keyboardLayout);

      nextUfo = {
        id: `ufo-${now}`,
        word: bonusWord,
        typed: '',
        x: startX,
        y: 6.5,
        speed: 18 * dir,
        direction: dir,
        points: 300,
      };

      invadersAudio.startUfo();
    } else if (ufo) {
      const newX = ufo.x + ufo.speed * deltaSeconds;
      if (newX < 0 || newX > 100) {
        // UFO escaped offscreen
        invadersAudio.stopUfo();
        nextUfo = null;
        if (get().targetId === ufo.id) {
          set({ targetId: null });
        }
      } else {
        nextUfo = { ...ufo, x: newX };
      }
    }

    set({
      invaders: nextInvaders,
      ufo: nextUfo,
      fleetDirection: nextDirection,
      marchStep: nextMarchStep,
      lastStepTime: nextLastStepTime,
      lastUfoSpawnTime: nextLastUfoSpawn,
      shields: nextShields,
      status: nextStatus,
      activeLasers,
      explosions,
      elapsedSeconds: (now - startTime) / 1000,
    });
  },
}));