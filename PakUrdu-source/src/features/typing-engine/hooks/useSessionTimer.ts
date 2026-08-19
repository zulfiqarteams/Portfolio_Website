import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "completed";

export interface UseSessionTimerResult {
  status: TimerStatus;
  elapsedMs: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const TICK_INTERVAL_MS = 200;

/**
 * A standalone elapsed-time timer, independent of the Typing Core.
 * Lifecycle: idle → running (caller decides what counts as "first
 * valid input") → completed. Uses `performance.now()` timestamps
 * rather than counting ticks, so the reported elapsed time can't
 * drift from wall-clock time the way a naive `setInterval` counter
 * would under tab throttling.
 *
 * While the tab is hidden, time stops accumulating — the learner
 * switching tabs mid-exercise shouldn't inflate their elapsed time
 * (and therefore tank their WPM) for time they weren't typing.
 */
export function useSessionTimer(): UseSessionTimerResult {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  // `startedAt` is the performance.now() timestamp the current
  // running segment began at, or null while paused/stopped/idle.
  // `accumulated` is everything banked from previous running
  // segments (e.g. before a visibility-change pause).
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pauseAccumulation = useCallback(() => {
    if (startedAtRef.current !== null) {
      accumulatedRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = null;
      // Sync the displayed value to the exact pause/stop moment
      // rather than waiting for the next tick — otherwise the
      // frozen "final" statistics could lag the real elapsed time
      // by up to one tick interval.
      setElapsedMs(accumulatedRef.current);
    }
    clearTick();
  }, [clearTick]);

  const resumeAccumulation = useCallback(() => {
    if (startedAtRef.current !== null) return; // already running
    startedAtRef.current = performance.now();
    clearTick();
    intervalRef.current = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      setElapsedMs(accumulatedRef.current + (performance.now() - startedAtRef.current));
    }, TICK_INTERVAL_MS);
  }, [clearTick]);

  const start = useCallback(() => {
    setStatus((prev) => {
      if (prev !== "idle") return prev;
      resumeAccumulation();
      return "running";
    });
  }, [resumeAccumulation]);

  const stop = useCallback(() => {
    pauseAccumulation();
    setStatus((prev) => (prev === "running" ? "completed" : prev));
  }, [pauseAccumulation]);

  const reset = useCallback(() => {
    pauseAccumulation();
    accumulatedRef.current = 0;
    setElapsedMs(0);
    setStatus("idle");
  }, [pauseAccumulation]);

  // Pause/resume accumulation across tab visibility changes, only
  // while a session is actually running — idle/completed sessions
  // have nothing to pause.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        pauseAccumulation();
      } else {
        setStatus((current) => {
          if (current === "running") resumeAccumulation();
          return current;
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pauseAccumulation, resumeAccumulation]);

  useEffect(() => clearTick, [clearTick]);

  return { status, elapsedMs, start, stop, reset };
}
