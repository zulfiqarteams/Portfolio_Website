import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Clock, Gauge, Target, Type, Trophy, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatTime } from "@/features/typing-engine";
import { getPerformanceFeedback } from "@/features/results";
import type { ExerciseResultPayload } from "@/features/results";

export default function Results() {
  useDocumentTitle("Results");
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as ExerciseResultPayload | null;

  if (!result) {
    return (
      <PageContainer>
        <PageHeader
          title="Results"
          description="A summary of your practice session will appear here."
        />
        <div className="py-10">
          <EmptyState
            icon={Type}
            title="No recent results"
            description="Complete a lesson's practice exercises and your results will show up here."
            action={{ label: "Go to Practice", to: "/practice" }}
          />
        </div>
      </PageContainer>
    );
  }

  const { statistics, mistakes, isNewBestWpm, isNewBestAccuracy } = result;
  const hasBest = isNewBestWpm || isNewBestAccuracy;

  return (
    <PageContainer>
      <PageHeader
        title="Results"
        description={result.lessonTitle}
        action={
          hasBest ? (
            <Badge tone="gold">
              <Trophy size={12} className="mr-1 inline" aria-hidden="true" />
              New Personal Best
            </Badge>
          ) : undefined
        }
      />

      <div className="py-10 space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={Target} label="Accuracy" value={`${statistics.accuracy}%`} />
          <StatCard icon={Gauge} label="WPM" value={String(statistics.wpm)} />
          <StatCard icon={Type} label="Characters" value={String(statistics.typedCharacters)} />
          <StatCard icon={AlertCircle} label="Errors" value={String(statistics.incorrectCharacters)} />
          <StatCard icon={Clock} label="Time" value={formatTime(statistics.elapsedMs)} />
        </div>

        <Card>
          <p className="text-sm font-medium text-ink">
            {getPerformanceFeedback(statistics.accuracy, statistics.wpm)}
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Mistake review
          </h2>
          {mistakes.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success-600">
              <CheckCircle2 size={16} aria-hidden="true" />
              Perfect — no typing mistakes.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {mistakes.map((mistake) => (
                <li
                  key={mistake.position}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="text-ink-faint">Position {mistake.position + 1}</span>
                  <span className="urdu-text flex items-center gap-2 text-base">
                    <span className="text-ink-faint">Expected</span>
                    <span className="text-success-600">{mistake.expected}</span>
                    <span className="text-ink-faint">&rarr;</span>
                    <span className="text-ink-faint">Typed</span>
                    <span className="text-error-600">{mistake.typed}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(result.resultType === "test" ? "/test" : `/practice?lesson=${result.lessonId}`)}
          >
            {result.resultType === "test" ? "Restart Test" : "Try Again"}
          </Button>
          {result.nextLessonId && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/practice?lesson=${result.nextLessonId}`)}
            >
              Continue to Next Lesson
            </Button>
          )}
          <Button variant="outline" size="md" to={result.resultType === "test" ? "/learn/reading" : "/learn"}>
            {result.resultType === "test" ? "Back to Learning" : "Back to Learning Path"}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
