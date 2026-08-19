import { getAllLessonsInOrder } from "@/features/lessons/services/lessonCatalog";
import type { Lesson } from "@/features/lessons/types";
import {
  deleteProfileProgress,
  readProfileProgress,
  writeProfileProgress,
} from "@/features/progress/services/progressStorage";
import {
  MAX_RECENT_ATTEMPTS,
  type LessonProgress,
  type ProfileProgress,
} from "@/features/progress/types";

/** A brand-new profile's progress — nothing completed, nothing in
 *  progress, current lesson is whatever the course's first lesson
 *  is. Not persisted until the learner actually does something.
 *  Also used as a read-only fallback when there's no active profile
 *  at all (e.g. `/learn` before any profile is selected), so lesson
 *  status logic never has to special-case "no profile". */
export function createEmptyProgress(profileId: string): ProfileProgress {
  const firstLesson = getAllLessonsInOrder()[0];
  return {
    profileId,
    completedLessonIds: [],
    lessonProgress: {},
    currentLessonId: firstLesson?.id ?? null,
    lastActivityAt: null,
  };
}

/** Reads a profile's progress, or a fresh empty one if it has none
 *  yet. Reading never creates a stored entry — only recording an
 *  attempt does — so simply viewing `/learn` with a brand-new
 *  profile doesn't write anything. */
export function getProfileProgress(profileId: string): ProfileProgress {
  return readProfileProgress(profileId) ?? createEmptyProgress(profileId);
}

export function saveProfileProgress(progress: ProfileProgress): void {
  writeProfileProgress(progress);
}

export function getLessonProgress(
  progress: ProfileProgress,
  lessonId: string,
): LessonProgress | undefined {
  return progress.lessonProgress[lessonId];
}

/**
 * The single lesson currently unlocked-but-not-completed, in course
 * order — the strict sequential unlocking model: a lesson is
 * available once every lesson before it is completed, and only one
 * lesson is ever at that frontier at a time. Returns undefined once
 * every lesson in the course is completed.
 */
export function getNextAvailableLesson(progress: ProfileProgress): Lesson | undefined {
  const lessons = getAllLessonsInOrder();
  return lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id));
}

/** UI-facing status for a lesson card: completed, the current
 *  frontier lesson, or locked. Kept out of JSX — callers (Learn,
 *  the dashboard) just render whatever this returns. */
export function getLessonUiStatus(
  progress: ProfileProgress,
  lesson: Lesson,
): "completed" | "current" | "locked" {
  if (progress.completedLessonIds.includes(lesson.id)) return "completed";
  const next = getNextAvailableLesson(progress);
  if (next && next.id === lesson.id) return "current";
  return "locked";
}

export interface OverallProgressStats {
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  bestWpm: number;
  bestAccuracy: number;
  currentLesson: Lesson | undefined;
}

/** Course-wide summary derived from a profile's progress — the
 *  numbers the Progress page and the Part 11 dashboard both need.
 *  `bestWpm`/`bestAccuracy` are the best across every lesson
 *  attempted, not per-lesson. */
export function getOverallStats(progress: ProfileProgress): OverallProgressStats {
  const totalLessons = getAllLessonsInOrder().length;
  const completedLessons = progress.completedLessonIds.length;
  const lessonRecords = Object.values(progress.lessonProgress);

  return {
    totalLessons,
    completedLessons,
    percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    bestWpm: lessonRecords.reduce((max, record) => Math.max(max, record.bestWpm), 0),
    bestAccuracy: lessonRecords.reduce((max, record) => Math.max(max, record.bestAccuracy), 0),
    currentLesson: getNextAvailableLesson(progress),
  };
}

function upsertLessonProgress(
  progress: ProfileProgress,
  lessonId: string,
  attempt: { accuracy: number; wpm: number },
  status: "inProgress" | "completed",
): LessonProgress {
  const existing = progress.lessonProgress[lessonId];
  const now = new Date().toISOString();
  const recentAttempts = [
    ...(existing?.recentAttempts ?? []),
    { accuracy: attempt.accuracy, wpm: attempt.wpm, completedAt: now },
  ].slice(-MAX_RECENT_ATTEMPTS);

  return {
    lessonId,
    status: existing?.status === "completed" ? "completed" : status,
    attempts: (existing?.attempts ?? 0) + 1,
    bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, attempt.accuracy),
    bestWpm: Math.max(existing?.bestWpm ?? 0, attempt.wpm),
    lastAccuracy: attempt.accuracy,
    lastWpm: attempt.wpm,
    completedAt: existing?.completedAt ?? (status === "completed" ? now : undefined),
    updatedAt: now,
    recentAttempts,
  };
}

/**
 * Logs an attempt at a lesson without marking it complete — used
 * for practice runs that don't finish the whole lesson. A worse
 * result never overwrites `bestAccuracy`/`bestWpm` (both are running
 * maxima), only `lastAccuracy`/`lastWpm` always reflect the most
 * recent attempt.
 */
export function recordAttempt(
  profileId: string,
  lessonId: string,
  attempt: { accuracy: number; wpm: number },
  persist = true,
): ProfileProgress {
  const progress = getProfileProgress(profileId);
  const lessonProgress = upsertLessonProgress(progress, lessonId, attempt, "inProgress");
  const next: ProfileProgress = {
    ...progress,
    lessonProgress: { ...progress.lessonProgress, [lessonId]: lessonProgress },
    lastActivityAt: new Date().toISOString(),
  };
  if (persist) saveProfileProgress(next);
  return next;
}

/**
 * Marks a lesson completed: logs the attempt, adds it to
 * `completedLessonIds` (idempotent — completing an already-completed
 * lesson again just logs another attempt), and advances
 * `currentLessonId` to whatever the new frontier lesson is.
 */
export function completeLesson(
  profileId: string,
  lessonId: string,
  attempt: { accuracy: number; wpm: number },
  persist = true,
): ProfileProgress {
  const progress = getProfileProgress(profileId);
  const lessonProgress = upsertLessonProgress(progress, lessonId, attempt, "completed");
  const completedLessonIds = progress.completedLessonIds.includes(lessonId)
    ? progress.completedLessonIds
    : [...progress.completedLessonIds, lessonId];

  const updated: ProfileProgress = {
    ...progress,
    completedLessonIds,
    lessonProgress: { ...progress.lessonProgress, [lessonId]: lessonProgress },
    lastActivityAt: new Date().toISOString(),
  };
  updated.currentLessonId = getNextAvailableLesson(updated)?.id ?? null;

  if (persist) saveProfileProgress(updated);
  return updated;
}

/** Deletes a profile's progress entirely — called when the profile
 *  itself is deleted so no orphaned progress data remains. */
export function deleteProgressForProfile(profileId: string): void {
  deleteProfileProgress(profileId);
}
