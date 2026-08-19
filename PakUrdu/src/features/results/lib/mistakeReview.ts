import type { TypingState } from "@/features/typing-engine/types";
import type { Mistake } from "@/features/results/types";

/**
 * Reads mistakes straight off the completed session's `typingState`
 * — no separate keystroke log is kept anywhere. This only makes
 * sense to call once `typingState.isComplete` is true; before that,
 * later positions simply haven't been typed yet and won't show up.
 */
export function getMistakes(typingState: TypingState): Mistake[] {
  return typingState.characters
    .filter((c) => c.status === "incorrect" && c.typed !== undefined)
    .map((c) => ({ position: c.index, expected: c.char, typed: c.typed as string }));
}
