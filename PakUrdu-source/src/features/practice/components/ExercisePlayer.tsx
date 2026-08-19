import { useEffect, useRef, useState } from "react";
import { RotateCcw, CheckCircle2, Gauge, Target, Clock, Hash, AlertTriangle } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatCard } from "@/components/StatCard";
import { useTypingSession, formatTime, type SessionStatistics } from "@/features/typing-engine";
import { useSettings } from "@/features/settings";
import { VirtualKeyboard, keyForChar, type KeyboardFlash } from "@/features/keyboard";
import { TypingArea } from "@/features/practice/components/TypingArea";
import type { TypingState } from "@/features/typing-engine/types";

interface ExercisePlayerProps {
  /** The Urdu text this exercise targets. Changing this resets the
   *  session — exercises don't carry state across each other. */
  target: string;
  /** Fired once, the moment this exercise is completed, with the
   *  frozen final typing state and statistics. */
  onComplete?: (typingState: TypingState, statistics: SessionStatistics) => void;
  /** Rendered above the typing area — the exercise's instruction. */
  instruction?: string;
}

/**
 * Wires the Typing Hook (+ Part 8's session timer/statistics),
 * TypingArea, and VirtualKeyboard together for a single exercise.
 * This is the one place Practice/Lesson screens should reach for a
 * working typing exercise — neither page talks to the engine hooks
 * directly, so there is exactly one typing UI in the app.
 */
export function ExercisePlayer({ target, onComplete, instruction }: ExercisePlayerProps) {
  const { typingFeedback, showKeyboard } = useSettings();
  const { typingState, statistics, pressKey, reset } = useTypingSession(target, {
    onComplete: () => onComplete?.(typingState, statistics),
  });

  const [flash, setFlash] = useState<KeyboardFlash | null>(null);
  const flashToken = useRef(0);
  const previousIndex = useRef(typingState.currentIndex);

  useEffect(() => {
    if (typingState.currentIndex === previousIndex.current) return;

    // Only flash when typing feedback is enabled. Always advance the
    // previous index so enabling the setting later cannot flash a stale key.
    if (!typingFeedback) {
      previousIndex.current = typingState.currentIndex;
      return;
    }

    // Only flash on a forward step (a typed character) — a
    // backspace also changes currentIndex but has no "key that was
    // just pressed" to highlight.
    if (typingState.currentIndex > previousIndex.current) {
      const lastRecordIndex = typingState.currentIndex - 1;
      const record = typingState.characters[lastRecordIndex];
      if (record) {
        const location = keyForChar(record.char);
        if (location) {
          flashToken.current += 1;
          setFlash({ ...location, correct: record.status === "correct", token: flashToken.current });
        }
      }
    }
    previousIndex.current = typingState.currentIndex;
  }, [typingState.currentIndex, typingState.characters]);

  // Target text changed out from under this exercise (navigated to
  // a different exercise) — start clean.
  const previousTarget = useRef(target);
  useEffect(() => {
    if (previousTarget.current !== target) {
      previousTarget.current = target;
      reset(target);
    }
  }, [target, reset]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={Gauge} label="WPM" value={String(statistics.wpm)} />
        <StatCard icon={Target} label="Accuracy" value={`${statistics.accuracy}%`} />
        <StatCard icon={Clock} label="Time" value={formatTime(statistics.elapsedMs)} />
        <StatCard icon={Hash} label="Characters" value={String(statistics.typedCharacters)} />
        <StatCard icon={AlertTriangle} label="Errors" value={String(statistics.incorrectCharacters)} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Practice
          </h2>
          {typingState.isComplete ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success-600">
              <CheckCircle2 size={16} aria-hidden="true" />
              Complete
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => reset()}>
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </Button>
          )}
        </div>

        {instruction && <p className="mt-2 text-sm text-ink-soft">{instruction}</p>}

        <div className="mt-5 rounded-md border border-border bg-paper px-4 py-8">
          <TypingArea typingState={typingState} onKeyDown={pressKey} feedbackEnabled={typingFeedback} />
        </div>

        {typingState.isComplete && (
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => reset()}>
              <RotateCcw size={14} aria-hidden="true" />
              Practice again
            </Button>
          </div>
        )}
      </Card>

      {showKeyboard && (
        <Card>
          <p className="mb-4 text-sm font-medium text-ink-soft">On-screen keyboard</p>
          <VirtualKeyboard
            expectedChar={typingState.isComplete ? null : typingState.currentChar}
            flash={flash}
            feedbackEnabled={typingFeedback}
          />
        </Card>
      )}
    </div>
  );
}
