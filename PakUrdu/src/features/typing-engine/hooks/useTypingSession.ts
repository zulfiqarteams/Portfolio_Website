import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTypingEngine } from "@/features/typing-engine/hooks/useTypingEngine";
import { useSessionTimer, type TimerStatus } from "@/features/typing-engine/hooks/useSessionTimer";
import { calculateStatistics, type SessionStatistics } from "@/features/typing-engine/lib/statistics";
import type { TypingState } from "@/features/typing-engine/types";

export interface UseTypingSessionOptions {
  onComplete?: () => void;
}

export interface UseTypingSessionResult {
  typingState: TypingState;
  statistics: SessionStatistics;
  timerStatus: TimerStatus;
  lastInput: string | null;
  pressKey: (key: string, shiftKey: boolean) => void;
  pressCharacter: (char: string) => void;
  reset: (targetText?: string) => void;
}

/**
 * Layers timing and live statistics on top of `useTypingEngine`
 * without changing it — this is the Part 8 extension point. The
 * timer starts on the learner's first valid keystroke (the first
 * time the Typing Core's cursor actually advances), stops the
 * instant the exercise completes (freezing the final statistics),
 * and resets alongside the engine.
 */
export function useTypingSession(
  target: string,
  options: UseTypingSessionOptions = {},
): UseTypingSessionResult {
  const { onComplete } = options;
  const timer = useSessionTimer();
  const { status: timerStatus, elapsedMs, start: startTimer, stop: stopTimer, reset: resetTimer } = timer;

  const { typingState, lastInput, pressKey, pressCharacter, reset: resetEngine } = useTypingEngine(
    target,
    {
      onComplete: () => {
        stopTimer();
        onComplete?.();
      },
    },
  );

  // "First valid input" = the cursor moving off zero. Unmapped keys
  // never reach the Typing Core (see useTypingEngine.pressKey), so
  // this can't be triggered by a stray, non-typing keystroke.
  const previousIndex = useRef(0);
  useEffect(() => {
    if (timerStatus === "idle" && previousIndex.current === 0 && typingState.currentIndex > 0) {
      startTimer();
    }
    previousIndex.current = typingState.currentIndex;
  }, [typingState.currentIndex, timerStatus, startTimer]);

  const reset = useCallback(
    (nextTarget?: string) => {
      resetEngine(nextTarget);
      resetTimer();
      previousIndex.current = 0;
    },
    [resetEngine, resetTimer],
  );

  const statistics = useMemo(
    () =>
      calculateStatistics({
        correctCharacters: typingState.correctCharacters,
        incorrectCharacters: typingState.incorrectCharacters,
        elapsedMs,
      }),
    [typingState.correctCharacters, typingState.incorrectCharacters, elapsedMs],
  );

  return { typingState, statistics, timerStatus, lastInput, pressKey, pressCharacter, reset };
}
