/**
 * Deterministic feedback from fixed accuracy/speed thresholds — no
 * generated text, so the same result always produces the same
 * message. Accuracy feedback takes priority (an inaccurate fast
 * typist needs to slow down before speed feedback is useful), so
 * callers show at most one of these two.
 */
export function getAccuracyFeedback(accuracy: number): string {
  if (accuracy >= 97) return "Excellent accuracy!";
  if (accuracy >= 90) return "Good accuracy — keep it up.";
  return "Focus on accuracy first, then gradually increase speed.";
}

export function getSpeedFeedback(wpm: number): string {
  if (wpm >= 30) return "Great typing speed!";
  if (wpm >= 15) return "A solid pace — speed will keep growing with practice.";
  return "Take your time here; speed will come naturally as accuracy improves.";
}

/** The one feedback line the Results screen shows: accuracy first,
 *  falling back to a general speed note only once accuracy is
 *  already solid — see the module doc for why. */
export function getPerformanceFeedback(accuracy: number, wpm: number): string {
  if (accuracy < 90) return getAccuracyFeedback(accuracy);
  return getSpeedFeedback(wpm);
}
