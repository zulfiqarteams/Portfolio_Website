import { Badge } from "@/components/Badge";
import type { Level, Lesson } from "@/features/lessons/types";

interface LessonPageHeaderProps {
  lesson: Lesson;
  level: Level;
  position: number;
  total: number;
}

const difficultyTone = {
  Beginner: "brand",
  Intermediate: "gold",
  Professional: "neutral",
} as const;

/**
 * Top-of-page identity block for a lesson: which level it belongs
 * to, its position in the overall course, its title, and difficulty.
 * Pure display — all values are supplied by the lesson engine.
 */
export function LessonPageHeader({ lesson, level, position, total }: LessonPageHeaderProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
        <span>{level.title}</span>
        <span aria-hidden="true">·</span>
        <span className="numeric">
          Lesson {position} of {total}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-soft">
        {lesson.description}
      </p>
      <div className="mt-4">
        <Badge tone={difficultyTone[lesson.difficulty]}>{lesson.difficulty}</Badge>
      </div>
    </div>
  );
}
