import { useEffect, useReducer, useRef } from "react";
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
  /** True once the learner has produced their first valid character and the session isn't finished yet — the timer starts on this transition, never merely because the page opened. */
  hasStarted: boolean;
  /** True once the typing engine reports the exercise complete. */
  isComplete: boolean;
  /** Changing this value starts a brand-new session (new exercise, or an explicit Reset) — the timer is dropped back to idle. */
  resetKey: string | number;
  /** How often (ms) the hook re-renders to refresh the displayed elapsed time while running. Purely a display cadence — the underlying timing is timestamp-based (see `core/timer.ts`) and never drifts because of this value. */
  updateIntervalMs?: number;
}

export interface UseTypingTimerResult {
  status: TimerStatus;
  elapsedMs: number;
}

const DEFAULT_UPDATE_INTERVAL_MS = 250;

/**
 * Wires the pure timer state machine (`core/timer.ts`) to a typing
 * session's lifecycle:
 *
 *   idle → running   on the first accepted keystroke (`hasStarted`)
 *   running → completed   when the typing engine finishes (`isComplete`)
 *   anything → idle   whenever `resetKey` changes
 *
 * Visibility handling: if the browser tab is backgrounded while the
 * timer is running, it's paused immediately and resumed only once the
 * tab is visible again — so time spent away from the tab is never
 * counted as active typing time. This uses `document.visibilityState`
 * rather than trying to detect "idle" vs "busy" more granularly, which
 * would be over-engineering for a typing tutor.
 *
 * The hook re-renders on a plain interval (`updateIntervalMs`, default
 * 250ms) only while the timer is running, purely so the displayed time
 * ticks up smoothly — the interval's own timing is never trusted for
 * accuracy, only `performance.now()` is (see `getElapsedMs`).
 */
export function useTypingTimer({
  hasStarted,
  isComplete,
  resetKey,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
}: UseTypingTimerOptions): UseTypingTimerResult {
  const timerRef = useRef<TimerState>(createTimer());
  const [, forceRender] = useReducer((renderCount: number) => renderCount + 1, 0);

  // New session → back to idle. Runs before the "start on first
  // keystroke" effect below on the same render pass, so a resetKey
  // change and a fresh hasStarted=true (e.g. typing into a just-reset
  // field) are handled in the right order.
  useEffect(() => {
    timerRef.current = resetTimer();
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (hasStarted && timerRef.current.status === "idle") {
      timerRef.current = startTimer(timerRef.current, performance.now());
      forceRender();
    }
  }, [hasStarted]);

  useEffect(() => {
    if (isComplete && timerRef.current.status !== "idle" && timerRef.current.status !== "completed") {
      timerRef.current = completeTimer(timerRef.current, performance.now());
      forceRender();
    }
  }, [isComplete]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        if (timerRef.current.status === "running") {
          timerRef.current = pauseTimer(timerRef.current, performance.now());
          forceRender();
        }
      } else if (timerRef.current.status === "paused") {
        timerRef.current = resumeTimer(timerRef.current, performance.now());
        forceRender();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Keep the displayed elapsed time ticking while running. Only one
  // interval exists at a time, and none exists at all once the timer
  // stops running — this is the one place a per-tick side effect is
  // allowed to touch component state.
  useEffect(() => {
    if (timerRef.current.status !== "running") return;
    const intervalId = window.setInterval(forceRender, updateIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [updateIntervalMs, timerRef.current.status]);

  return {
    status: timerRef.current.status,
    elapsedMs: getElapsedMs(timerRef.current, performance.now()),
  };
}
