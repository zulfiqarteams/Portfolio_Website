import type { Lesson } from "@/features/lessons/types";
import { level0Lessons } from "./level0";
import { level1Lessons } from "./level1";
import { level2Lessons } from "./level2";
import { level3Lessons } from "./level3";
import { level4Lessons } from "./level4";
import { level5Lessons } from "./level5";
import { level6Lessons } from "./level6";
import { level7Lessons } from "./level7";

/**
 * Every lesson in the curriculum, flattened. Split into one file per
 * level (not one giant file) so the curriculum stays editable as it
 * grows to dozens or hundreds of lessons — a content editor only
 * needs to open the level they're working on.
 *
 * This array is intentionally unsorted here; `lessonCatalog` is
 * responsible for ordering, lookup, and navigation logic.
 */
export const allLessons: Lesson[] = [
  ...level0Lessons,
  ...level1Lessons,
  ...level2Lessons,
  ...level3Lessons,
  ...level4Lessons,
  ...level5Lessons,
  ...level6Lessons,
  ...level7Lessons,
];
