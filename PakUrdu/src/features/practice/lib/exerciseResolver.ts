import type { Lesson } from "@/features/lessons/types";

/** One practice target the ExercisePlayer can run, regardless of
 *  whether it came from a real `Exercise` or a lesson's single
 *  `targetText`. */
export interface PracticeTarget {
  id: string;
  instruction?: string;
  target: string;
}

/**
 * Flattens a lesson's practice content into an ordered list of
 * typeable targets. Lessons with `exercises` use those directly;
 * lessons with only a `targetText` (e.g. paragraph lessons) become a
 * single-item list so callers never need to branch on which shape a
 * given lesson uses.
 */
export function getPracticeTargets(lesson: Lesson): PracticeTarget[] {
  const { exercises, targetText, instructions } = lesson.content;

  if (exercises && exercises.length > 0) {
    return exercises.map((exercise) => ({
      id: exercise.id,
      instruction: exercise.instruction,
      target: exercise.target,
    }));
  }

  if (targetText) {
    return [{ id: `${lesson.id}-target`, instruction: instructions, target: targetText }];
  }

  return [];
}
