import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateStatistics, type SessionStatistics } from "@/features/typing-engine";
import { useTypingEngine } from "@/features/typing-engine/hooks/useTypingEngine";
import { useSessionTimer } from "@/features/typing-engine/hooks/useSessionTimer";
import type { TypingState } from "@/features/typing-engine/types";

interface UseTimedTypingTestOptions {
  durationSeconds: number;
  enabled: boolean;
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

export function useTimedTypingTest(target: string, options: UseTimedTypingTestOptions): TimedTypingTestResult {
  const { durationSeconds, enabled } = options;
  const timer = useSessionTimer();
  const { start, stop, reset: resetTimer, elapsedMs } = timer;
  const { typingState, pressKey, reset: resetEngine } = useTypingEngine(target);
  const [remainingMs, setRemainingMs] = useState(durationSeconds * 1000);
  const [finishReason, setFinishReason] = useState<"time" | "text" | null>(null);
  const finishElapsedRef = useRef(0);
  const deadlineRef = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || finishReason) return;
    const durationMs = durationSeconds * 1000;
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
    }, 100);

    return () => window.clearInterval(interval);
  }, [durationSeconds, enabled, finishReason, start, stop]);

  useEffect(() => {
    if (!typingState.isComplete || finishReason || !enabled) return;
    finishElapsedRef.current = Math.max(0, elapsedMs);
    stop();
    setRemainingMs(Math.max(0, durationSeconds * 1000 - finishElapsedRef.current));
    setFinishReason("text");
  }, [typingState.isComplete, finishReason, enabled, elapsedMs, durationSeconds, stop]);

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
    setRemainingMs(durationSeconds * 1000);
    setFinishReason(null);
    resetTimer();
    resetEngine(target);
  }, [durationSeconds, resetEngine, resetTimer, target]);

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
