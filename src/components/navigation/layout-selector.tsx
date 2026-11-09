'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTypingStore } from '@/stores/use-typing-store';
import { KeyboardLayoutType } from '@/types/keyboard';
import { SUPPORTED_LAYOUTS } from '@/core/layouts';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LayoutOption {
  id: KeyboardLayoutType;
  name: string;
  nativeName?: string;
  badge: string;
  description: string;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'qwerty',
    name: 'QWERTY',
    badge: 'Standard',
    description: 'Classic universal English layout',
  },
  {
    id: 'dvorak',
    name: 'Dvorak',
    badge: 'Ergonomic',
    description: 'Vowels on home row, reduced travel',
  },
  {
    id: 'colemak',
    name: 'Colemak',
    badge: 'Modern',
    description: 'Smooth home row rolls, preserves shortcuts',
  },
  {
    id: 'hebrew',
    name: 'Hebrew',
    nativeName: 'עברית',
    badge: 'RTL',
    description: 'Standard SI-1452 right-to-left layout',
  },
];

export const LayoutSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const keyboardLayout = useTypingStore((s) => s.keyboardLayout);
  const setLayout = useTypingStore((s) => s.setLayout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentOption = LAYOUT_OPTIONS.find((opt) => opt.id === (mounted ? keyboardLayout : 'qwerty')) || LAYOUT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (layoutId: KeyboardLayoutType) => {
    setLayout(layoutId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Keyboard Layout"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono">{currentOption.nativeName ?? currentOption.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 sm:w-64 rounded-xl bg-card border border-border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-border/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Keyboard Layout
          </div>

          <div className="p-1 space-y-0.5">
            {LAYOUT_OPTIONS.map((opt) => {
              const isSelected = keyboardLayout === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{opt.name}</span>
                      {opt.nativeName && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          ({opt.nativeName})
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-secondary border border-border text-muted-foreground">
                        {opt.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {opt.description}
                    </span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

