/** Status of a single lesson's persisted progress record. Distinct
 *  from the UI-facing `LessonStatus` in `@/types` (which adds a
 *  "current" concept derived at render time) — this is what's
 *  actually stored. Lessons with no progress record yet are
 *  implicitly "locked" or "available"; nothing is written until the
 *  learner interacts with them. */
export type LessonProgressStatus = "available" | "inProgress" | "completed";

/** One logged attempt at a lesson. Deliberately minimal — no
 *  keystroke data, no per-character log, just the numbers a results
 *  screen or progress page would want to show later. */
export interface AttemptRecord {
  accuracy: number;
  wpm: number;
  completedAt: string;
}

/** The most recent attempts kept per lesson, oldest first. Capped so
 *  the store can't grow without bound. */
export const MAX_RECENT_ATTEMPTS = 20;

export interface LessonProgress {
  lessonId: string;
  status: LessonProgressStatus;
  attempts: number;
  bestAccuracy: number;
  bestWpm: number;
  lastAccuracy: number;
  lastWpm: number;
  completedAt?: string;
  updatedAt: string;
  recentAttempts: AttemptRecord[];
}

/** One profile's progress across the whole course. */
export interface ProfileProgress {
  profileId: string;
  completedLessonIds: string[];
  lessonProgress: Record<string, LessonProgress>;
  currentLessonId: string | null;
  lastActivityAt: string | null;
}

/** On-disk shape — every profile's progress lives under one
 *  versioned store, keyed by profile id, mirroring how profiles
 *  themselves are stored. */
export interface ProgressStoreV1 {
  version: 1;
  progress: Record<string, ProfileProgress>;
}
