import { calculateAccuracy } from "@/features/typing-engine/lib/compareCharacters";

/**
 * WPM = (charactersTyped / 5) / elapsedMinutes — the standard
 * "5 characters = 1 word" convention. `charactersTyped` counts every
 * keystroke that reached the Typing Core (correct and incorrect
 * alike), i.e. gross WPM, matching what a learner intuitively feels
 * they "typed". Zero elapsed time is defined as 0 WPM rather than
 * dividing by zero.
 */
export function calculateWPM(charactersTyped: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || charactersTyped <= 0) return 0;
  const elapsedMinutes = elapsedMs / 60000;
  const wpm = charactersTyped / 5 / elapsedMinutes;
  return Number.isFinite(wpm) ? Math.round(wpm) : 0;
}

/** `mm:ss`, floor-rounded down to the nearest second. */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export interface SessionStatistics {
  elapsedMs: number;
  typedCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  accuracy: number;
  wpm: number;
}

/**
 * Combines the Typing Core's running correct/incorrect counts with
 * the session timer's elapsed time into the numbers the practice UI
 * actually displays. Pure — the caller decides when to compute this
 * (e.g. on every render while running, and once more at completion
 * to capture the final, frozen numbers).
 */
export function calculateStatistics(params: {
  correctCharacters: number;
  incorrectCharacters: number;
  elapsedMs: number;
}): SessionStatistics {
  const typedCharacters = params.correctCharacters + params.incorrectCharacters;
  return {
    elapsedMs: params.elapsedMs,
    typedCharacters,
    correctCharacters: params.correctCharacters,
    incorrectCharacters: params.incorrectCharacters,
    accuracy: calculateAccuracy(params.correctCharacters, typedCharacters),
    wpm: calculateWPM(typedCharacters, params.elapsedMs),
  };
}
