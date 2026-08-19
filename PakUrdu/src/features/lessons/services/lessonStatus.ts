import type { LessonStatus } from "@/types";
import type { Lesson } from "@/features/lessons/types";
import { getAllLessonsInOrder } from "@/features/lessons/services/lessonCatalog";

/**
 * Resolves the visual status (`locked` / `available` / `current` /
 * `completed`) each `LessonCard` should show on the learning path.
 *
 * This is intentionally static/mock for Part 6: the very first
 * lesson in the whole course is shown as "current" and everything
 * else in its level is "available"; every lesson in a locked level
 * is "locked". There is no completion tracking and nothing is read
 * from storage.
 *
 * The function signature (lesson in, status out) is the shape a
 * future progress-aware implementation would keep, so swapping this
 * out later shouldn't require touching the pages that call it.
 */
export function getMockLessonStatus(lesson: Lesson): LessonStatus {
  const [firstLesson] = getAllLessonsInOrder();

  if (lesson.id === firstLesson?.id) return "current";
  return "available";
}
