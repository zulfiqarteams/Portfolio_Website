import { Keyboard } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { Exercise, Lesson } from "@/features/lessons/types";
import { getPracticeTargets } from "@/features/practice";

interface LessonPracticeProps {
  lesson: Lesson;
}

const exerciseTypeLabel: Record<Exercise["type"], string> = {
  recognition: "Recognition",
  guidedTyping: "Guided Typing",
  repetition: "Repetition",
  words: "Words",
  sentences: "Sentences",
  paragraph: "Paragraph",
};

/**
 * Previews the lesson's practice content and hands off to `/practice`
 * for the actual typing exercise — `/practice` is the one place in
 * the app with a working Typing Engine, so this component doesn't
 * duplicate it.
 */
export function LessonPractice({ lesson }: LessonPracticeProps) {
  const { instructions, exercises } = lesson.content;
  const targets = getPracticeTargets(lesson);
  const hasPractice = targets.length > 0;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Practice
        </h2>
        {hasPractice && (
          <Button to={`/practice?lesson=${lesson.id}`} variant="primary" size="sm">
            <Keyboard size={14} aria-hidden="true" />
            Start Typing Practice
          </Button>
        )}
      </div>

      {instructions && (
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{instructions}</p>
      )}

      <div className="mt-5 space-y-3">
        {hasPractice
          ? targets.map((target) => {
              const exercise = exercises?.find((e) => e.id === target.id);
              return (
                <div
                  key={target.id}
                  className="rounded-md border border-border bg-paper px-4 py-4"
                >
                  {exercise && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-faint">
                      <Keyboard size={13} aria-hidden="true" />
                      {exerciseTypeLabel[exercise.type]}
                    </span>
                  )}
                  <p className="urdu-body mt-2 text-xl leading-relaxed text-ink">
                    {target.target}
                  </p>
                </div>
              );
            })
          : (
              <p className="text-sm text-ink-faint">
                This lesson doesn't have practice content yet.
              </p>
            )}
      </div>
    </Card>
  );
}
