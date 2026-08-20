import { useCallback, useMemo, useState } from "react";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { getMistakes } from "@/features/results";
import {
  DEFAULT_TEST_DURATION_SECONDS,
} from "@/features/tests/useTimedTypingTest";
import { TypingTestExperience } from "@/features/tests/components/TypingTestExperience";
import { TYPING_TEST_TEXT } from "@/features/tests/testText";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate } from "react-router-dom";
import type { SessionStatistics } from "@/features/typing-engine";
import type { TypingState } from "@/features/typing-engine/types";

const durationOptions = [
  { id: "1", seconds: 60, label: "1 minute" },
  { id: "3", seconds: 180, label: "3 minutes" },
  { id: "5", seconds: 300, label: "5 minutes" },
  { id: "custom", seconds: 0, label: "Custom" },
] as const;

export default function Test() {
  useDocumentTitle("Typing Test");
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState("1");
  const [customMinutes, setCustomMinutes] = useState("2");
  const [isStarted, setIsStarted] = useState(true);
  const [result, setResult] = useState<{
    typingState: TypingState;
    statistics: SessionStatistics;
  } | null>(null);

  const durationSeconds = useMemo(() => {
    const option = durationOptions.find((item) => item.id === selectedDuration);
    if (option?.id !== "custom") {
      return option?.seconds ?? DEFAULT_TEST_DURATION_SECONDS;
    }

    const minutes = Math.min(30, Math.max(1, Number(customMinutes) || 1));
    return minutes * 60;
  }, [customMinutes, selectedDuration]);

  const handleFinished = useCallback(
    (typingState: TypingState, statistics: SessionStatistics) => {
      setResult({ typingState, statistics });
    },
    [],
  );


  function viewResults() {
    if (!result) return;

    navigate("/results", {
      state: {
        resultType: "test",
        lessonId: "typing-test",
        lessonTitle: `${durationSeconds / 60}-minute Urdu Typing Test`,
        target: TYPING_TEST_TEXT,
        statistics: result.statistics,
        mistakes: getMistakes(result.typingState),
        isNewBestWpm: false,
        isNewBestAccuracy: false,
        nextLessonId: null,
      },
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Typing Test"
        description="A focused Urdu typing test with live speed, accuracy, timer, and a scrollable prompt."
        action={
          isStarted ? (
            <Badge tone="neutral">{durationSeconds / 60}-minute test</Badge>
          ) : undefined
        }
      />

      <div className="py-8 sm:py-10">
        {isStarted ? (
          <div className="mx-auto max-w-5xl">
            <TypingTestExperience
              durationSeconds={durationSeconds}
              onFinished={handleFinished}
            />

            {result && (
              <Card className="mt-5 border-success-500 bg-success-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">Test results are ready</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {result.statistics.wpm} WPM · {result.statistics.accuracy}% accuracy ·{" "}
                      {result.statistics.incorrectCharacters} errors
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={viewResults}>
                    View Full Results
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <Card>
              <h2 className="text-base font-semibold">Choose a duration</h2>
              <p className="mt-1 text-sm text-ink-soft">
                The default is a 60-second test. Once started, the timer runs continuously.
              </p>

              <div
                role="radiogroup"
                aria-label="Test duration"
                className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {durationOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedDuration === option.id}
                    onClick={() => setSelectedDuration(option.id)}
                    className={`rounded-sm border px-3 py-2.5 text-sm font-medium transition-colors ${
                      selectedDuration === option.id
                        ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                        : "border-border text-ink-soft hover:border-border-strong hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {selectedDuration === "custom" && (
                <div className="mt-4 max-w-xs">
                  <Input
                    label="Custom duration (1–30 minutes)"
                    type="number"
                    min={1}
                    max={30}
                    value={customMinutes}
                    onChange={(event) => setCustomMinutes(event.target.value)}
                  />
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" onClick={() => setIsStarted(true)}>
                  Start Test
                </Button>
                <span className="text-xs text-ink-faint">
                  Physical keyboard input is captured automatically.
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
