'use client';

import React from 'react';
import { SUPPORTED_LAYOUTS, QWERTY_LAYOUT } from '@/core/layouts';
import { KeyCap } from './key-cap';
import { useTypingStore } from '@/stores/use-typing-store';

export const VirtualKeyboard: React.FC = () => {
  const keyboardLayout = useTypingStore((s) => s.keyboardLayout);
  const expectedKeyDef = useTypingStore((s) => s.expectedKeyDef);
  const pressedCode = useTypingStore((s) => s.physicallyPressedCode);
  const activeKeys = useTypingStore((s) => s.activeKeys);
  const activeKeysSet = React.useMemo(
    () => new Set(activeKeys.flatMap((k) => [k, k.toLowerCase()])),
    [activeKeys]
  );

  const currentLayout = SUPPORTED_LAYOUTS[keyboardLayout] ?? QWERTY_LAYOUT;

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl 3xl:max-w-6xl 2k:max-w-7xl p-1.5 sm:p-2.5 3xl:p-3 rounded-xl sm:rounded-2xl bg-card border border-border shadow-2xl flex flex-col gap-0.5 sm:gap-1 mx-auto shrink-0">
        {
          currentLayout.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex w-full justify-center">
              {row.map((keyDef) => {
                const isExpected =
                  expectedKeyDef !== null &&
                  (expectedKeyDef.code === keyDef.code ||
                expectedKeyDef.key.toLowerCase() === keyDef.key.toLowerCase() ||
                  expectedKeyDef.key === keyDef.key);

              const isPressed = pressedCode === keyDef.code;

              // Utility keys like Space, Backspace, Enter, Shift are always considered unlocked
              const isUnlocked =
              ['Space', 'Backspace', 'Enter', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Tab'].includes(
              keyDef.code
              ) ||
              activeKeysSet.has(keyDef.key) ||
              activeKeysSet.has(keyDef.key.toLowerCase()) ||
              (keyDef.shiftedKey && (activeKeysSet.has(keyDef.shiftedKey) || activeKeysSet.has(keyDef.shiftedKey.toLowerCase())));

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
          ))
        }
    </div>
  );
};

