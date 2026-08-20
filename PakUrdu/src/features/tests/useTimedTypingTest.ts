import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStatistics, type SessionStatistics } from "@/features/typing-engine";
import { useTypingEngine } from "@/features/typing-engine/hooks/useTypingEngine";
import { useSessionTimer } from "@/features/typing-engine/hooks/useSessionTimer";
import type { TypingState } from "@/features/typing-engine/types";

export const DEFAULT_TEST_DURATION_SECONDS = 60;

interface UseTimedTypingTestOptions {
  durationSeconds?: number;
  enabled?: boolean;
}

export interface TimedTypingTestResult {
  typingState: TypingState;
  statistics: SessionStatistics;
  remainingMs: number;
  isRunning: boolean;
  isFinished: boolean;
  finishedByTime: boolean;
  pressKey: (key: string, shiftKey: boolean) => void;
  reset: () => void;
}

export function useTimedTypingTest(
  target: string,
  options: UseTimedTypingTestOptions = {},
): TimedTypingTestResult {
  const {
    durationSeconds = DEFAULT_TEST_DURATION_SECONDS,
    enabled = true,
  } = options;
  const durationMs = Math.max(1, durationSeconds) * 1000;

  const { start, stop, reset: resetTimer, elapsedMs } = useSessionTimer();
  const { typingState, pressKey, reset: resetEngine } = useTypingEngine(target);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [finishReason, setFinishReason] = useState<"time" | "text" | null>(null);
  const finishElapsedRef = useRef(0);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || finishReason) return;

    deadlineRef.current = performance.now() + durationMs;
    setRemainingMs(durationMs);
    start();

    const interval = window.setInterval(() => {
      const deadline = deadlineRef.current ?? performance.now();
      const next = Math.max(0, deadline - performance.now());
      setRemainingMs(next);

      if (next <= 0) {
        window.clearInterval(interval);
        finishElapsedRef.current = durationMs;
        stop();
        setFinishReason("time");
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [durationMs, enabled, finishReason, start, stop]);

  useEffect(() => {
    if (!typingState.isComplete || finishReason || !enabled) return;

    finishElapsedRef.current = Math.min(durationMs, Math.max(0, elapsedMs));
    stop();
    setRemainingMs(Math.max(0, durationMs - finishElapsedRef.current));
    setFinishReason("text");
  }, [durationMs, elapsedMs, enabled, finishReason, stop, typingState.isComplete]);

  const elapsedForStats = finishReason ? finishElapsedRef.current : elapsedMs;
  const statistics = useMemo(
    () =>
      calculateStatistics({
        correctCharacters: typingState.correctCharacters,
        incorrectCharacters: typingState.incorrectCharacters,
        elapsedMs: elapsedForStats,
      }),
    [elapsedForStats, typingState.correctCharacters, typingState.incorrectCharacters],
  );

  const reset = useCallback(() => {
    deadlineRef.current = null;
    finishElapsedRef.current = 0;
    setRemainingMs(durationMs);
    setFinishReason(null);
    resetTimer();
    resetEngine(target);
  }, [durationMs, resetEngine, resetTimer, target]);

  return {
    typingState,
    statistics,
    remainingMs,
    isRunning: enabled && !finishReason,
    isFinished: Boolean(finishReason),
    finishedByTime: finishReason === "time",
    pressKey,
    reset,
  };
}
