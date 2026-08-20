import { useEffect, useState } from "react";
import {
  BASE_KEY_MAP,
  FEEDBACK_COLORS,
  FINGER_COLORS,
  KEYBOARD_ROWS,
  PUNCTUATION_KEY_MAP,
  SHIFT_KEY_MAP,
  fingerForKey,
  keyForChar,
  type Finger,
} from "@/features/keyboard/data/phoneticMap";
import { cn } from "@/lib/cn";

export interface KeyboardFlash {
  key: string;
  shift: boolean;
  correct: boolean;
  token: number;
}

interface InteractiveKeyboardProps {
  expectedChar: string | null;
  flash: KeyboardFlash | null;
  feedbackEnabled?: boolean;
  className?: string;
}

const FLASH_DURATION_MS = 200;
const ROW_OFFSETS = [0, 26, 0];
const LEGEND: Finger[] = ["Pinky", "Ring", "Middle", "Index", "Thumb"];

export function InteractiveKeyboard({ expectedChar, flash, feedbackEnabled = true, className }: InteractiveKeyboardProps) {
  const [visibleFlash, setVisibleFlash] = useState<KeyboardFlash | null>(null);
  const [shiftActive, setShiftActive] = useState(false);

  useEffect(() => {
    if (!feedbackEnabled || !flash) {
      setVisibleFlash(null);
      return;
    }
    setVisibleFlash(flash);
    const timer = window.setTimeout(() => setVisibleFlash(null), FLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [feedbackEnabled, flash]);

  const expectedLocation = feedbackEnabled && expectedChar ? keyForChar(expectedChar) : null;

  // If the target character lives on the Shift layer, flip the preview
  // to Shift automatically so the learner can see the glyph they need
  // without having to remember to tap Shift themselves first.
  useEffect(() => {
    if (expectedLocation?.shift) setShiftActive(true);
  }, [expectedLocation?.key, expectedLocation?.shift]);

  return (
    <div className={cn("mx-auto w-full max-w-[620px] select-none font-mono", className)} dir="ltr" aria-label="Urdu phonetic keyboard">
      <div className="overflow-x-auto py-1">
        <div className="min-w-max space-y-1.5">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-1.5" style={{ marginLeft: rowIndex === 2 ? 0 : ROW_OFFSETS[rowIndex] }}>
              {rowIndex === 2 && <ShiftKey active={shiftActive} onToggle={() => setShiftActive((v) => !v)} />}
              {row.map((keyLabel) => {
                const baseChar = BASE_KEY_MAP[keyLabel] ?? PUNCTUATION_KEY_MAP[keyLabel];
                const shiftChar = SHIFT_KEY_MAP[keyLabel];
                const displayChar = shiftActive && shiftChar ? shiftChar : baseChar;
                const guide = fingerForKey(keyLabel);
                const finger: Finger = guide?.finger ?? "Index";

                const isExpectedKey = Boolean(expectedLocation?.key === keyLabel);
                const isFlashing = Boolean(feedbackEnabled && visibleFlash?.key === keyLabel);
                const color = isFlashing
                  ? visibleFlash?.correct
                    ? FEEDBACK_COLORS.correct
                    : FEEDBACK_COLORS.incorrect
                  : FINGER_COLORS[finger];

                return (
                  <div
                    key={keyLabel}
                    title={guide ? `${guide.hand} hand · ${guide.finger} finger` : undefined}
                    style={{
                      borderColor: color,
                      backgroundColor: `color-mix(in srgb, ${color} ${isExpectedKey ? 24 : 13}%, transparent)`,
                    }}
                    className={cn(
                      "flex h-12 w-11 flex-col items-center justify-center rounded-md border transition-colors duration-100",
                      isExpectedKey && "ring-2 ring-offset-1 ring-offset-paper",
                    )}
                    aria-hidden="true"
                  >
                    <span className={cn("urdu-text text-lg leading-none text-ink", shiftActive && shiftChar && "font-bold")}>
                      {displayChar}
                    </span>
                    <span className="mt-1 text-[10px] leading-none text-ink-faint">{keyLabel.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          ))}

          <Spacebar
            active={feedbackEnabled && expectedChar === " "}
            flashing={Boolean(feedbackEnabled && visibleFlash?.key === " ")}
            correct={visibleFlash?.correct ?? false}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        {LEGEND.map((finger) => (
          <span key={finger} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FINGER_COLORS[finger] }} />
            {finger}
          </span>
        ))}
      </div>
    </div>
  );
}

function ShiftKey({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      title="Preview the Shift layer"
      style={{
        borderColor: FINGER_COLORS.Pinky,
        backgroundColor: `color-mix(in srgb, ${FINGER_COLORS.Pinky} ${active ? 28 : 10}%, transparent)`,
      }}
      className={cn(
        "mr-1 flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold uppercase tracking-wide text-ink transition-colors duration-100",
        active && "ring-2 ring-offset-1 ring-offset-paper",
      )}
    >
      Shift
    </button>
  );
}

function Spacebar({ active, flashing, correct }: { active: boolean; flashing: boolean; correct: boolean }) {
  const color = flashing ? (correct ? FEEDBACK_COLORS.correct : FEEDBACK_COLORS.incorrect) : FINGER_COLORS.Thumb;
  return (
    <div
      style={{
        marginLeft: 45,
        borderColor: color,
        backgroundColor: `color-mix(in srgb, ${color} ${active ? 24 : 13}%, transparent)`,
      }}
      className={cn("mt-2 h-12 w-[260px] rounded-md border transition-colors duration-100", active && "ring-2 ring-offset-1 ring-offset-paper")}
      aria-label="Spacebar"
    />
  );
}
