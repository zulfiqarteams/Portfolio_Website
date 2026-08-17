import { segmentGraphemes } from "@/features/typing-engine/lib/textSegmentation";
import { compareCharacters } from "@/features/typing-engine/lib/compareCharacters";
import type {
  CharacterDisplay,
  TypingCoreState,
  TypingState,
} from "@/features/typing-engine/types";

/**
 * Creates a fresh core state for a target text. `targetGraphemes` is
 * computed once here rather than in every reducer call.
 */
export function createTypingState(targetText: string): TypingCoreState {
  const targetGraphemes = segmentGraphemes(targetText);
  return {
    targetText,
    targetGraphemes,
    typed: [],
    currentIndex: 0,
    isComplete: targetGraphemes.length === 0,
    lastInput: null,
  };
}

/**
 * Advances the engine by one typed character. No-ops once complete.
 * Advances the cursor regardless of correctness (like a standard
 * typing test) — an incorrect keystroke is recorded as a mistake but
 * doesn't block progress; `backspace` is how a learner corrects it.
 */
export function typeCharacter(state: TypingCoreState, input: string): TypingCoreState {
  if (state.isComplete) return state;
  if (state.currentIndex >= state.targetGraphemes.length) return state;

  const expected = state.targetGraphemes[state.currentIndex];
  const correct = compareCharacters(expected, input);
  const typed = [...state.typed, { expected, typed: input, correct }];
  const currentIndex = state.currentIndex + 1;

  return {
    ...state,
    typed,
    currentIndex,
    isComplete: currentIndex >= state.targetGraphemes.length,
    lastInput: input,
  };
}

/**
 * Removes the most recent keystroke and steps the cursor back.
 * No-ops at the start of the text. Completion is always cleared by a
 * backspace — you can only be "complete" by typing the last
 * character, never by removing your way into it.
 */
export function backspace(state: TypingCoreState): TypingCoreState {
  if (state.currentIndex === 0) return state;

  return {
    ...state,
    typed: state.typed.slice(0, -1),
    currentIndex: state.currentIndex - 1,
    isComplete: false,
    lastInput: "Backspace",
  };
}

/** Resets to a blank state, optionally against a new target text. */
export function resetTypingState(state: TypingCoreState, targetText?: string): TypingCoreState {
  return createTypingState(targetText ?? state.targetText);
}

/**
 * Derives the render-ready `TypingState` from a core state. Pure and
 * cheap enough to call on every keystroke — no memoization needed at
 * this layer (the hook may still memoize for React's benefit).
 */
export function getTypingState(state: TypingCoreState): TypingState {
  const characters: CharacterDisplay[] = state.targetGraphemes.map((char, index) => {
    let status: CharacterDisplay["status"];
    let typed: string | undefined;
    if (index < state.currentIndex) {
      const record = state.typed[index];
      status = record?.correct ? "correct" : "incorrect";
      typed = record?.typed;
    } else if (index === state.currentIndex) {
      status = "current";
    } else {
      status = "pending";
    }
    return { char, status, index, typed };
  });

  const correctCharacters = state.typed.filter((t) => t.correct).length;
  const incorrectCharacters = state.typed.filter((t) => !t.correct).length;

  return {
    characters,
    currentIndex: state.currentIndex,
    currentChar: state.targetGraphemes[state.currentIndex] ?? null,
    correctCharacters,
    incorrectCharacters,
    remainingCharacters: Math.max(0, state.targetGraphemes.length - state.currentIndex),
    totalCharacters: state.targetGraphemes.length,
    isComplete: state.isComplete,
  };
}
