/** Visual state a single on-screen key can be in at once. */
export interface VirtualKeyState {
  /** This key (with the current Shift state) is what the learner
   *  needs to press next. At most one key is ever "expected". */
  isExpected: boolean;
  /** This key was the most recent physical key pressed, correct or
   *  not — shown as a brief flash, independent of `isExpected`. */
  isPressed: boolean;
  /** The most recent press was on this key and produced a correct
   *  character. */
  isCorrect: boolean;
  /** The most recent press was on this key and produced an
   *  incorrect character. */
  isIncorrect: boolean;
}
