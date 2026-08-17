/**
 * Compares one typed grapheme against the expected one. Pure and
 * trivial on purpose — kept as its own function so the "what counts
 * as correct" rule lives in exactly one place, in case it ever needs
 * to become more forgiving (e.g. normalizing equivalent Unicode
 * forms) without touching the engine around it.
 */
export function compareCharacters(expected: string, typed: string): boolean {
  return expected === typed;
}

/**
 * Accuracy as a 0–100 percentage. Zero typed characters is defined
 * as 0%, matching the live statistics in the practice UI (Part 8) —
 * there is deliberately only one accuracy rule in the app.
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
