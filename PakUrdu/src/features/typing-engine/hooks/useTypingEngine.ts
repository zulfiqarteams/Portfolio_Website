import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { resolveKeyToChar } from "@/features/keyboard/data/phoneticMap";
import {
  backspace,
  createTypingState,
  getTypingState,
  resetTypingState,
  typeCharacter,
} from "@/features/typing-engine/lib/typingCore";
import type { TypingCoreState, TypingState } from "@/features/typing-engine/types";

type Action =
  | { type: "type"; input: string }
  | { type: "backspace" }
  | { type: "reset"; targetText?: string };

function reducer(state: TypingCoreState, action: Action): TypingCoreState {
  switch (action.type) {
    case "type":
      return typeCharacter(state, action.input);
    case "backspace":
      return backspace(state);
    case "reset":
      return resetTypingState(state, action.targetText);
    default:
      return state;
  }
}

export interface UseTypingEngineOptions {
  /** Called exactly once, the moment the engine transitions into
   *  the completed state. */
  onComplete?: () => void;
}

export interface UseTypingEngineResult {
  typingState: TypingState;
  lastInput: string | null;
  /** Feeds a raw physical key press through the Keyboard Engine
   *  (phonetic key → Urdu char) and into the Typing Core. Ignores
   *  keys that don't map to anything typeable (modifiers, function
   *  keys, unmapped letters) so callers can wire this to a bare
   *  `onKeyDown` without pre-filtering. */
  pressKey: (key: string, shiftKey: boolean) => void;
  /** Feeds an already-resolved character straight to the Typing
   *  Core — used by the VirtualKeyboard, where the character is
   *  already known from the key that was clicked. */
  pressCharacter: (char: string) => void;
  reset: (targetText?: string) => void;
}

/**
 * The Typing Hook: the only typing-engine surface React components
 * should talk to. It owns the reducer, translates physical key
 * events through the Keyboard Engine, and fires `onComplete` at the
 * moment (and only the moment) the exercise finishes.
 */
export function useTypingEngine(
  targetText: string,
  options: UseTypingEngineOptions = {},
): UseTypingEngineResult {
  const [state, dispatch] = useReducer(reducer, targetText, createTypingState);
  const { onComplete } = options;

  const pressCharacter = useCallback((char: string) => {
    dispatch({ type: "type", input: char });
  }, []);

  // Fires onComplete exactly once, at the false→true transition —
  // never on mount (e.g. an already-empty target) and never again
  // after a reset re-completes the same session.
  const wasComplete = useRef(state.isComplete);
  useEffect(() => {
    if (!wasComplete.current && state.isComplete) {
      onComplete?.();
    }
    wasComplete.current = state.isComplete;
  }, [state.isComplete, onComplete]);

  const pressKey = useCallback(
    (key: string, shiftKey: boolean) => {
      if (key === "Backspace") {
        dispatch({ type: "backspace" });
        return;
      }
      const char = resolveKeyToChar(key, shiftKey);
      if (char === null) return;
      pressCharacter(char);
    },
    [pressCharacter],
  );

  const reset = useCallback((nextTarget?: string) => {
    dispatch({ type: "reset", targetText: nextTarget });
  }, []);

  const typingState = useMemo(() => getTypingState(state), [state]);

  return {
    typingState,
    lastInput: state.lastInput,
    pressKey,
    pressCharacter,
    reset,
  };
}
