import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Keyboard, PartyPopper } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import {
  getAllLessonsInOrder,
  getLessonById,
  getNextLesson,
} from "@/features/lessons/services/lessonCatalog";
import { ExercisePlayer, getPracticeTargets } from "@/features/practice";
import { useProgress } from "@/features/progress";
import { getMistakes } from "@/features/results";
import type { ExerciseResultPayload } from "@/features/results";
import type { SessionStatistics } from "@/features/typing-engine";
import type { TypingState } from "@/features/typing-engine/types";
import type { Lesson } from "@/features/lessons/types";

/**
 * Resolves which lesson/exercise this page should practice from the
 * URL: `?lesson=<id>&exercise=<id>`. Falls back to the active
 * profile's current lesson (the sequential-unlocking frontier), and
 * only falls back further to the course's first lesson if there's no
 * profile at all — so `/practice` always has something to show.
 */
function useResolvedLesson(lessonParam: string | null, fallback: Lesson | undefined) {
  return useMemo(() => {
    const lesson = lessonParam ? getLessonById(lessonParam) : undefined;
    if (lesson) return lesson;
    return fallback ?? getAllLessonsInOrder()[0];
  }, [lessonParam, fallback]);
}

export default function Practice() {
  useDocumentTitle("Practice");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { nextAvailableLesson, getLessonProgress, recordAttempt, completeLesson } = useProgress();

  const lesson = useResolvedLesson(searchParams.get("lesson"), nextAvailableLesson);
  const targets = useMemo(() => (lesson ? getPracticeTargets(lesson) : []), [lesson]);

  const exerciseParam = searchParams.get("exercise");
  const activeIndex = Math.max(
    0,
    targets.findIndex((t) => t.id === exerciseParam),
  );
  const active = targets[activeIndex === -1 ? 0 : activeIndex] ?? targets[0];
  const isLastExercise = (activeIndex === -1 ? 0 : activeIndex) >= targets.length - 1;

  // Set once the lesson's last exercise is completed. Holding the
  // payload here (rather than navigating to /results immediately)
  // keeps the "go see your results" step a deliberate click — see
  // Part 10's "do not force automatic navigation".
  const [lessonComplete, setLessonComplete] = useState<ExerciseResultPayload | null>(null);
  const [attemptToken, setAttemptToken] = useState(0);

  function goToIndex(index: number) {
    if (!lesson || index < 0 || index >= targets.length) return;
    setLessonComplete(null);
    setSearchParams({ lesson: lesson.id, exercise: targets[index].id });
  }

  function handleExerciseComplete(typingState: TypingState, statistics: SessionStatistics) {
    if (!lesson) return;
    const attempt = { accuracy: statistics.accuracy, wpm: statistics.wpm };

    if (!isLastExercise) {
      recordAttempt(lesson.id, attempt);
      return;
    }

    const previousBest = getLessonProgress(lesson.id);
    const isNewBestWpm = attempt.wpm > (previousBest?.bestWpm ?? 0);
    const isNewBestAccuracy = attempt.accuracy > (previousBest?.bestAccuracy ?? 0);
    completeLesson(lesson.id, attempt);

    setLessonComplete({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      target: active.target,
      statistics,
      mistakes: getMistakes(typingState),
      isNewBestWpm,
      isNewBestAccuracy,
      nextLessonId: getNextLesson(lesson.id)?.id ?? null,
    });
  }

  function handleTryAgain() {
    setLessonComplete(null);
    setAttemptToken((token) => token + 1);
  }

  function handleViewResults() {
    if (!lessonComplete) return;
    navigate("/results", { state: lessonComplete });
  }

  if (!lesson || targets.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Practice" description="Guided typing practice, one exercise at a time." />
        <div className="py-10">
          <EmptyState
            icon={Keyboard}
            title="No practice content available"
            description="This lesson doesn't have any typeable exercises yet."
            action={{ label: "Back to Learning Path", to: "/learn" }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Practice"
        description={lesson.title}
        breadcrumb={[
          { label: "Learn", to: "/learn" },
          { label: lesson.title, to: `/lesson/${lesson.id}` },
          { label: "Practice" },
        ]}
        action={
          targets.length > 1 ? (
            <Badge tone="neutral">
              Exercise {activeIndex === -1 ? 1 : activeIndex + 1} of {targets.length}
            </Badge>
          ) : undefined
        }
      />

      <div className="py-10">
        {active && (
          <ExercisePlayer
            key={`${active.id}-${attemptToken}`}
            target={active.target}
            instruction={active.instruction}
            onComplete={handleExerciseComplete}
          />
        )}

        {lessonComplete && (
          <Card className="mt-6 border-success-500 bg-success-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PartyPopper size={20} className="text-success-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-ink">Lesson complete!</p>
                  <p className="text-sm text-ink-soft">
                    {lessonComplete.statistics.wpm} WPM &middot; {lessonComplete.statistics.accuracy}% accuracy
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Button variant="primary" size="sm" onClick={handleViewResults}>
                  View Results
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goToIndex((activeIndex === -1 ? 0 : activeIndex) - 1)}
            disabled={(activeIndex === -1 ? 0 : activeIndex) === 0}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Previous
          </Button>
          <Link to={`/lesson/${lesson.id}`} className="text-sm text-ink-faint hover:text-ink hover:underline">
            Back to lesson
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goToIndex((activeIndex === -1 ? 0 : activeIndex) + 1)}
            disabled={(activeIndex === -1 ? 0 : activeIndex) >= targets.length - 1}
          >
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
