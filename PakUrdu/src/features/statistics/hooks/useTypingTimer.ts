import { useEffect, useRef, useState } from "react";
import {
  completeTimer,
  createTimer,
  getElapsedMs,
  pauseTimer,
  resetTimer,
  resumeTimer,
  startTimer,
} from "@/features/statistics/core/timer";
import type { TimerState, TimerStatus } from "@/features/statistics/core/timer";

interface UseTypingTimerOptions {
  /** True once the learner has produced their first valid character and the session isn't finished yet. */
  hasStarted: boolean;
  /** True once the typing engine reports the exercise complete. */
  isComplete: boolean;
  /** Changing this value starts a brand-new session. */
  resetKey: string | number;
  /** Display refresh cadence. The timer itself remains timestamp based. */
  updateIntervalMs?: number;
}

export interface UseTypingTimerResult {
  status: TimerStatus;
  elapsedMs: number;
}

const DEFAULT_UPDATE_INTERVAL_MS = 100;

/**
 * React adapter for the pure timer state machine.
 *
 * Important: TimerState lives in a ref so timestamp arithmetic remains cheap,
 * but the current status is mirrored in React state. A mutable ref is not a
 * reactive dependency, so using `timerRef.current.status` directly in an
 * effect dependency can leave the display interval stuck in the idle state.
 */
export function useTypingTimer({
  hasStarted,
  isComplete,
  resetKey,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
}: UseTypingTimerOptions): UseTypingTimerResult {
  const timerRef = useRef<TimerState>(createTimer());
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [, forceRender] = useState(0);

  useEffect(() => {
    const timer = resetTimer();
    timerRef.current = timer;
    setStatus(timer.status);
    forceRender((value) => value + 1);
  }, [resetKey]);

  useEffect(() => {
    if (!hasStarted || timerRef.current.status !== "idle") return;
    const timer = startTimer(timerRef.current, performance.now());
    timerRef.current = timer;
    setStatus(timer.status);
    forceRender((value) => value + 1);
  }, [hasStarted]);

  useEffect(() => {
    if (!isComplete || timerRef.current.status === "idle" || timerRef.current.status === "completed") return;
    const timer = completeTimer(timerRef.current, performance.now());
    timerRef.current = timer;
    setStatus(timer.status);
    forceRender((value) => value + 1);
  }, [isComplete]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden" && timerRef.current.status === "running") {
        const timer = pauseTimer(timerRef.current, performance.now());
        timerRef.current = timer;
        setStatus(timer.status);
        forceRender((value) => value + 1);
      } else if (document.visibilityState === "visible" && timerRef.current.status === "paused") {
        const timer = resumeTimer(timerRef.current, performance.now());
        timerRef.current = timer;
        setStatus(timer.status);
        forceRender((value) => value + 1);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const intervalId = window.setInterval(() => {
      forceRender((value) => value + 1);
    }, updateIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [status, updateIntervalMs]);

  return {
    status,
    elapsedMs: getElapsedMs(timerRef.current, performance.now()),
  };
}
