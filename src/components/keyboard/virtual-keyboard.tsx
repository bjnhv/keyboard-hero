'use client';

import React from 'react';
import { QWERTY_LAYOUT } from '@/core/layouts';
import { KeyCap } from './key-cap';
import { useTypingStore } from '@/stores/use-typing-store';

export const VirtualKeyboard: React.FC = () => {
  const expectedKeyDef = useTypingStore((s) => s.expectedKeyDef);
  const pressedCode = useTypingStore((s) => s.physicallyPressedCode);
  const activeKeys = useTypingStore((s) => s.activeKeys);
  const activeKeysSet = React.useMemo(() => new Set(activeKeys.map((k) => k.toLowerCase())), [activeKeys]);

  return (
    <div className="w-full max-w-4xl p-2 sm:p-4 rounded-xl bg-card border border-border shadow-2xl flex flex-col gap-1 mx-auto">
      {QWERTY_LAYOUT.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full justify-center">
          {row.map((keyDef) => {
            const isExpected =
              expectedKeyDef !== null &&
              (expectedKeyDef.code === keyDef.code ||
                expectedKeyDef.key.toLowerCase() === keyDef.key.toLowerCase());

            const isPressed = pressedCode === keyDef.code;

            // Utility keys like Space, Backspace, Enter, Shift are always considered unlocked
            const isUnlocked =
              ['Space', 'Backspace', 'Enter', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Tab'].includes(
                keyDef.code
              ) ||
              activeKeysSet.has(keyDef.key.toLowerCase()) ||
              (keyDef.shiftedKey && activeKeysSet.has(keyDef.shiftedKey.toLowerCase()));

            return (
              <KeyCap
                key={keyDef.code}
                keyDef={keyDef}
                isExpected={Boolean(isExpected)}
                isPressed={isPressed}
                isUnlocked={Boolean(isUnlocked)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

