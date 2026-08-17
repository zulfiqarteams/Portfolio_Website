/** Visual/logical state of a single target character. */
export type CharacterStatus = "pending" | "current" | "correct" | "incorrect";

/** One target character paired with the status it should render as. */
export interface CharacterDisplay {
  /** Grapheme cluster from the target text (see textSegmentation). */
  char: string;
  status: CharacterStatus;
  /** Index within the target's grapheme sequence — stable identity
   *  for React keys even though the same character can repeat. */
  index: number;
  /** What the learner actually typed at this position, once it's
   *  been typed (undefined for "pending"/"current"). Equal to `char`
   *  when `status` is "correct" — kept explicit rather than implied
   *  so mistake-review (Part 10) doesn't need to reach into the
   *  Typing Core's internal records to know what was pressed. */
  typed?: string;
}

/** One completed keystroke, kept so mistakes can be reviewed later
 *  (Part 10) without the engine re-deriving them from scratch. */
export interface TypedCharacterRecord {
  expected: string;
  typed: string;
  correct: boolean;
}

/**
 * The Typing Core's state. Deliberately plain data — no React, no
 * timers, no statistics (those are Part 8's concern). `typed` always
 * has exactly `currentIndex` entries; the two are kept in lockstep
 * by `typeCharacter`/`backspace` rather than derived from each other.
 */
export interface TypingCoreState {
  targetText: string;
  /** Unicode-aware grapheme clusters of `targetText` — see
   *  `segmentGraphemes`. This is what indices in `typed` and
   *  `currentIndex` count against, not raw UTF-16 code units. */
  targetGraphemes: string[];
  typed: TypedCharacterRecord[];
  currentIndex: number;
  isComplete: boolean;
  /** The most recent input the engine processed — a single
   *  character, "Backspace", or null before any input. Used by the
   *  VirtualKeyboard to flash the key that was just pressed. */
  lastInput: string | null;
}

/** Derived, render-ready view of a TypingCoreState. */
export interface TypingState {
  characters: CharacterDisplay[];
  currentIndex: number;
  currentChar: string | null;
  correctCharacters: number;
  incorrectCharacters: number;
  remainingCharacters: number;
  totalCharacters: number;
  isComplete: boolean;
}
