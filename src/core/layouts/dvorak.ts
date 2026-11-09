import { KeyboardLayout } from '@/types/keyboard';

export const DVORAK_LAYOUT: KeyboardLayout = {
  id: 'dvorak',
  name: 'Dvorak',
  description: 'Ergonomic layout designed for reduced finger travel and vowel clustering on home row',
  direction: 'ltr',
  rows: [
    // Row 0: Number & Symbol Row
    [
      { key: '`', shiftedKey: '~', display: '`', code: 'Backquote', finger: 'left-pinky', row: 0 },
      { key: '1', shiftedKey: '!', display: '1', code: 'Digit1', finger: 'left-pinky', row: 0 },
      { key: '2', shiftedKey: '@', display: '2', code: 'Digit2', finger: 'left-ring', row: 0 },
      { key: '3', shiftedKey: '#', display: '3', code: 'Digit3', finger: 'left-middle', row: 0 },
      { key: '4', shiftedKey: '$', display: '4', code: 'Digit4', finger: 'left-index', row: 0 },
      { key: '5', shiftedKey: '%', display: '5', code: 'Digit5', finger: 'left-index', row: 0 },
      { key: '6', shiftedKey: '^', display: '6', code: 'Digit6', finger: 'right-index', row: 0 },
      { key: '7', shiftedKey: '&', display: '7', code: 'Digit7', finger: 'right-index', row: 0 },
      { key: '8', shiftedKey: '*', display: '8', code: 'Digit8', finger: 'right-middle', row: 0 },
      { key: '9', shiftedKey: '(', display: '9', code: 'Digit9', finger: 'right-ring', row: 0 },
      { key: '0', shiftedKey: ')', display: '0', code: 'Digit0', finger: 'right-pinky', row: 0 },
      { key: '[', shiftedKey: '{', display: '[', code: 'Minus', finger: 'right-pinky', row: 0 },
      { key: ']', shiftedKey: '}', display: ']', code: 'Equal', finger: 'right-pinky', row: 0 },
      { key: 'Backspace', display: '⌫', code: 'Backspace', finger: 'right-pinky', row: 0, widthRatio: 2.0 },
    ],
    // Row 1: Top Row
    [
      { key: 'Tab', display: 'Tab', code: 'Tab', finger: 'left-pinky', row: 1, widthRatio: 1.5 },
      { key: "'", shiftedKey: '"', display: "'", code: 'KeyQ', finger: 'left-pinky', row: 1 },
      { key: ',', shiftedKey: '<', display: ',', code: 'KeyW', finger: 'left-ring', row: 1 },
      { key: '.', shiftedKey: '>', display: '.', code: 'KeyE', finger: 'left-middle', row: 1 },
      { key: 'p', shiftedKey: 'P', display: 'P', code: 'KeyR', finger: 'left-index', row: 1 },
      { key: 'y', shiftedKey: 'Y', display: 'Y', code: 'KeyT', finger: 'left-index', row: 1 },
      { key: 'f', shiftedKey: 'F', display: 'F', code: 'KeyY', finger: 'right-index', row: 1 },
      { key: 'g', shiftedKey: 'G', display: 'G', code: 'KeyU', finger: 'right-index', row: 1 },
      { key: 'c', shiftedKey: 'C', display: 'C', code: 'KeyI', finger: 'right-middle', row: 1 },
      { key: 'r', shiftedKey: 'R', display: 'R', code: 'KeyO', finger: 'right-ring', row: 1 },
      { key: 'l', shiftedKey: 'L', display: 'L', code: 'KeyP', finger: 'right-pinky', row: 1 },
      { key: '/', shiftedKey: '?', display: '/', code: 'BracketLeft', finger: 'right-pinky', row: 1 },
      { key: '=', shiftedKey: '+', display: '=', code: 'BracketRight', finger: 'right-pinky', row: 1 },
      { key: '\\', shiftedKey: '|', display: '\\', code: 'Backslash', finger: 'right-pinky', row: 1, widthRatio: 1.5 },
    ],
    // Row 2: Home Row (Vowels on Left Hand, Consonants on Right Hand)
    [
      { key: 'CapsLock', display: 'Caps', code: 'CapsLock', finger: 'left-pinky', row: 2, widthRatio: 1.75 },
      { key: 'a', shiftedKey: 'A', display: 'A', code: 'KeyA', finger: 'left-pinky', row: 2 },
      { key: 'o', shiftedKey: 'O', display: 'O', code: 'KeyS', finger: 'left-ring', row: 2 },
      { key: 'e', shiftedKey: 'E', display: 'E', code: 'KeyD', finger: 'left-middle', row: 2 },
      { key: 'u', shiftedKey: 'U', display: 'U', code: 'KeyF', finger: 'left-index', row: 2, hasHomingBump: true },
      { key: 'i', shiftedKey: 'I', display: 'I', code: 'KeyG', finger: 'left-index', row: 2 },
      { key: 'd', shiftedKey: 'D', display: 'D', code: 'KeyH', finger: 'right-index', row: 2 },
      { key: 'h', shiftedKey: 'H', display: 'H', code: 'KeyJ', finger: 'right-index', row: 2, hasHomingBump: true },
      { key: 't', shiftedKey: 'T', display: 'T', code: 'KeyK', finger: 'right-middle', row: 2 },
      { key: 'n', shiftedKey: 'N', display: 'N', code: 'KeyL', finger: 'right-ring', row: 2 },
      { key: 's', shiftedKey: 'S', display: 'S', code: 'Semicolon', finger: 'right-pinky', row: 2 },
      { key: '-', shiftedKey: '_', display: '-', code: 'Quote', finger: 'right-pinky', row: 2 },
      { key: 'Enter', display: 'Enter', code: 'Enter', finger: 'right-pinky', row: 2, widthRatio: 2.25 },
    ],
    // Row 3: Bottom Row
    [
      { key: 'ShiftLeft', display: 'Shift', code: 'ShiftLeft', finger: 'left-pinky', row: 3, widthRatio: 2.25 },
      { key: ';', shiftedKey: ':', display: ';', code: 'KeyZ', finger: 'left-pinky', row: 3 },
      { key: 'q', shiftedKey: 'Q', display: 'Q', code: 'KeyX', finger: 'left-ring', row: 3 },
      { key: 'j', shiftedKey: 'J', display: 'J', code: 'KeyC', finger: 'left-middle', row: 3 },
      { key: 'k', shiftedKey: 'K', display: 'K', code: 'KeyV', finger: 'left-index', row: 3 },
      { key: 'x', shiftedKey: 'X', display: 'X', code: 'KeyB', finger: 'left-index', row: 3 },
      { key: 'b', shiftedKey: 'B', display: 'B', code: 'KeyN', finger: 'right-index', row: 3 },
      { key: 'm', shiftedKey: 'M', display: 'M', code: 'KeyM', finger: 'right-index', row: 3 },
      { key: 'w', shiftedKey: 'W', display: 'W', code: 'Comma', finger: 'right-middle', row: 3 },
      { key: 'v', shiftedKey: 'V', display: 'V', code: 'Period', finger: 'right-ring', row: 3 },
      { key: 'z', shiftedKey: 'Z', display: 'Z', code: 'Slash', finger: 'right-pinky', row: 3 },
      { key: 'ShiftRight', display: 'Shift', code: 'ShiftRight', finger: 'right-pinky', row: 3, widthRatio: 2.75 },
    ],
    // Row 4: Space Row
    [
      { key: 'ControlLeft', display: 'Ctrl', code: 'ControlLeft', finger: 'left-pinky', row: 4, widthRatio: 1.5 },
      { key: 'AltLeft', display: 'Alt', code: 'AltLeft', finger: 'thumb', row: 4, widthRatio: 1.25 },
      { key: ' ', display: 'Space', code: 'Space', finger: 'thumb', row: 4, widthRatio: 6.25 },
      { key: 'AltRight', display: 'Alt', code: 'AltRight', finger: 'thumb', row: 4, widthRatio: 1.25 },
      { key: 'ControlRight', display: 'Ctrl', code: 'ControlRight', finger: 'right-pinky', row: 4, widthRatio: 1.5 },
    ],
  ],
};

