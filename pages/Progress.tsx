import { LineChart, Trophy, Gauge, Target, ListChecks } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/Badge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProfiles } from "@/features/profiles";
import { useProgress } from "@/features/progress";
import { getAllLessonsInOrder } from "@/features/lessons/services/lessonCatalog";

export default function ProgressPage() {
  useDocumentTitle("Progress");
  const { activeProfile } = useProfiles();
  const { progress, overallStats } = useProgress();

  if (!activeProfile) {
    return (
      <PageContainer>
        <PageHeader
          title="Progress"
          description="A look at how your speed and accuracy improve over time."
        />
        <div className="py-10">
          <EmptyState
            icon={LineChart}
            title="Select a profile to see progress"
            description="Progress is tracked per profile, stored locally in your browser — no account required."
            action={{ label: "Go to Practice", to: "/practice" }}
          />
        </div>
      </PageContainer>
    );
  }

  if (overallStats.completedLessons === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Progress"
          description={`${activeProfile.name}'s speed and accuracy over time.`}
        />
        <div className="py-10">
          <EmptyState
            icon={LineChart}
            title="Your progress will appear here"
            description="Complete your first lesson and your typing statistics will show up here automatically."
            action={{ label: "Start practicing", to: "/practice" }}
          />
        </div>
      </PageContainer>
    );
  }

  const completedLessons = getAllLessonsInOrder().filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Progress"
        description={`${activeProfile.name}'s speed and accuracy over time.`}
      />

      <div className="py-10 space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={ListChecks}
            label="Course Progress"
            value={`${overallStats.percentComplete}%`}
            hint={`${overallStats.completedLessons} of ${overallStats.totalLessons} lessons`}
          />
          <StatCard icon={Trophy} label="Completed Lessons" value={String(overallStats.completedLessons)} />
          <StatCard icon={Gauge} label="Best WPM" value={String(overallStats.bestWpm)} />
          <StatCard icon={Target} label="Best Accuracy" value={`${overallStats.bestAccuracy}%`} />
        </div>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
              Course completion
            </h2>
            <span className="numeric text-sm font-medium text-ink-soft">
              {overallStats.completedLessons} / {overallStats.totalLessons}
            </span>
          </div>
          <ProgressBar
            value={overallStats.percentComplete}
            className="mt-3"
            label="Course completion"
          />
          {overallStats.currentLesson && (
            <p className="mt-3 text-sm text-ink-soft">
              Current lesson:{" "}
              <span className="font-medium text-ink">{overallStats.currentLesson.title}</span>
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Completed lessons
          </h2>
          <ul className="divide-y divide-border">
            {completedLessons.map((lesson) => {
              const lessonProgress = progress.lessonProgress[lesson.id];
              return (
                <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{lesson.title}</p>
                    <p className="text-xs text-ink-faint">
                      {lessonProgress?.attempts ?? 0} attempt
                      {lessonProgress?.attempts === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="success">{lessonProgress?.bestAccuracy ?? 0}% accuracy</Badge>
                    <Badge tone="neutral">{lessonProgress?.bestWpm ?? 0} WPM</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}
