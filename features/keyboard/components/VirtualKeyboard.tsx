import { useEffect, useState } from "react";
import {
  BASE_KEY_MAP,
  KEYBOARD_ROWS,
  PUNCTUATION_KEY_MAP,
  SHIFT_KEY_MAP,
  fingerForKey,
  keyForChar,
} from "@/features/keyboard/data/phoneticMap";
import { cn } from "@/lib/cn";

export interface KeyboardFlash {
  key: string;
  shift: boolean;
  correct: boolean;
  token: number;
}

interface VirtualKeyboardProps {
  expectedChar: string | null;
  flash: KeyboardFlash | null;
  feedbackEnabled?: boolean;
  className?: string;
}

const FLASH_DURATION_MS = 200;

function KeyCap({
  keyLabel,
  isExpected,
  isExpectedShift,
  isFlashing,
  flashCorrect,
}: {
  keyLabel: string;
  isExpected: boolean;
  isExpectedShift: boolean;
  isFlashing: boolean;
  flashCorrect: boolean;
}) {
  const baseChar = BASE_KEY_MAP[keyLabel] ?? PUNCTUATION_KEY_MAP[keyLabel];
  const shiftChar = SHIFT_KEY_MAP[keyLabel];
  const guide = fingerForKey(keyLabel);

  return (
    <div
      title={guide ? `${guide.hand} hand · ${guide.finger} finger` : undefined}
      className={cn(
        "flex h-11 w-9 flex-col items-center justify-center rounded-sm border text-center transition-colors duration-100 sm:h-12 sm:w-10",
        isFlashing
          ? flashCorrect
            ? "border-success-500 bg-success-50"
            : "border-error-500 bg-error-50"
          : isExpected
            ? "border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-300"
            : "border-border bg-paper",
      )}
      aria-hidden="true"
    >
      {shiftChar && (
        <span className={cn("urdu-text text-[10px] leading-none", isExpected && isExpectedShift ? "font-bold text-brand-600" : "text-ink-faint")}>
          {shiftChar}
        </span>
      )}
      <span className={cn("urdu-text text-sm leading-none", isExpected && !isExpectedShift ? "font-bold text-brand-600" : "text-ink")}>
        {baseChar}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase leading-none text-ink-faint">{keyLabel}</span>
    </div>
  );
}

export function VirtualKeyboard({ expectedChar, flash, feedbackEnabled = true, className }: VirtualKeyboardProps) {
  const [visibleFlash, setVisibleFlash] = useState<KeyboardFlash | null>(null);

  useEffect(() => {
    if (!feedbackEnabled || !flash) {
      setVisibleFlash(null);
      return;
    }
    setVisibleFlash(flash);
    const timeout = window.setTimeout(() => setVisibleFlash(null), FLASH_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [feedbackEnabled, flash]);

  const expectedLocation = expectedChar ? keyForChar(expectedChar) : null;
  const guide = expectedLocation ? fingerForKey(expectedLocation.key) : null;

  return (
    <div className={cn("space-y-4", className)}>
      {feedbackEnabled && expectedChar && expectedLocation && guide && (
        <div className="rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Your next move</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-ink">
            <span className="urdu-text text-2xl font-bold">{expectedChar}</span>
            <span className="text-ink-faint">→</span>
            <span className="rounded border border-border bg-surface px-2.5 py-1 font-mono font-semibold uppercase">{expectedLocation.key === " " ? "Space" : expectedLocation.key}</span>
            {expectedLocation.shift && <span className="text-xs font-semibold text-brand-700">+ Shift</span>}
            <span className="text-ink-faint">→</span>
            <span className="font-semibold">{guide.hand} hand</span>
            <span className="text-ink-faint">·</span>
            <span className="font-semibold">{guide.finger} finger</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-1.5 overflow-x-auto py-1" dir="ltr" aria-label="Urdu phonetic keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5">
            {row.map((keyLabel) => (
              <KeyCap
                key={keyLabel}
                keyLabel={keyLabel}
                isExpected={Boolean(feedbackEnabled && expectedLocation?.key === keyLabel)}
                isExpectedShift={Boolean(feedbackEnabled && expectedLocation?.shift)}
                isFlashing={Boolean(feedbackEnabled && visibleFlash?.key === keyLabel)}
                flashCorrect={visibleFlash?.correct ?? false}
              />
            ))}
          </div>
        ))}
        <div
          className={cn(
            "mt-1 h-9 w-56 rounded-sm border transition-colors duration-100 sm:h-10 sm:w-64",
            feedbackEnabled && visibleFlash?.key === " "
              ? visibleFlash.correct ? "border-success-500 bg-success-50" : "border-error-500 bg-error-50"
              : feedbackEnabled && expectedChar === " " ? "border-brand-500 bg-brand-50" : "border-border bg-paper",
          )}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-faint" dir="ltr">
        <span><strong className="text-ink-soft">Left</strong>: pinky · ring · middle · index</span>
        <span><strong className="text-ink-soft">Right</strong>: index · middle · ring · pinky</span>
      </div>
    </div>
  );
}
