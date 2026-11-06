import React from 'react';
import { KeyDefinition } from '@/types/keyboard';
import { getFingerColorTheme } from '@/core/layouts';

interface KeyCapProps {
  keyDef: KeyDefinition;
  isExpected: boolean;
  isPressed: boolean;
  isUnlocked: boolean;
}

export const KeyCap: React.FC<KeyCapProps> = ({
  keyDef,
  isExpected,
  isPressed,
  isUnlocked,
}) => {
  const theme = getFingerColorTheme(keyDef.finger);
  const widthRatio = keyDef.widthRatio ?? 1.0;

  // Base flex-grow / min-width calculation for responsive keyboards
  const flexStyle = {
    flexGrow: widthRatio * 10,
    flexBasis: `${widthRatio * 2.5}rem`,
  };

  let dynamicClasses = 'bg-secondary/70 border-border text-foreground/80 hover:border-muted-foreground/30';

  if (!isUnlocked) {
    dynamicClasses = 'bg-background/40 border-border/40 text-muted-foreground/30';
  } else if (isExpected) {
    dynamicClasses = `${theme.bg} ${theme.border} ${theme.text} shadow-md shadow-${theme.dot}/20 scale-105 z-10 animate-pulse font-bold ring-2 ring-primary/40`;
  } else if (isPressed) {
    dynamicClasses = 'bg-primary/20 border-primary text-primary scale-95 shadow-inner';
  }

  return (
    <div
      style={flexStyle}
      className={`h-11 sm:h-12 md:h-13 lg:h-14 3xl:h-16 2k:h-20 m-0.5 sm:m-1 3xl:m-1.5 rounded-lg border flex flex-col items-center justify-center relative select-none transition-all duration-75 text-xs sm:text-sm lg:text-base 3xl:text-lg 2k:text-xl font-medium ${dynamicClasses}`}
    >
      <span>{keyDef.display}</span>

      {/* Tactile homing bump on F and J */}
      {keyDef.hasHomingBump && (
        <span className="w-2.5 h-0.5 3xl:w-3.5 3xl:h-1 bg-muted-foreground/60 rounded-full absolute bottom-1.5 3xl:bottom-2" />
      )}

      {/* Tiny finger color dot on keycap corner */}
      {isUnlocked && (
        <span
          className={`w-1.5 h-1.5 3xl:w-2 3xl:h-2 rounded-full absolute top-1 right-1 3xl:top-1.5 3xl:right-1.5 opacity-50 ${theme.dot}`}
        />
      )}
    </div>
  );
};

