import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Clock, Gauge, RotateCcw, Target, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/cn";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { TypingArea } from "@/features/practice/components/TypingArea";
import { VirtualKeyboard, keyForChar, type KeyboardFlash } from "@/features/keyboard";
import { useSettings } from "@/features/settings";
import { getMistakes } from "@/features/results";
import type { SessionStatistics } from "@/features/typing-engine";
import type { TypingState } from "@/features/typing-engine/types";
import { TYPING_TEST_TEXT, useTimedTypingTest } from "@/features/tests";

const durationOptions = [
  { id: "1", seconds: 60, label: "1 minute" },
  { id: "3", seconds: 180, label: "3 minutes" },
  { id: "5", seconds: 300, label: "5 minutes" },
  { id: "custom", seconds: 0, label: "Custom" },
] as const;

function TestSession({ durationSeconds, onFinished, onRestart }: { durationSeconds: number; onFinished: (typingState: TypingState, statistics: SessionStatistics) => void; onRestart: () => void }) {
  const { typingFeedback, showKeyboard } = useSettings();
  const [flash, setFlash] = useState<KeyboardFlash | null>(null);
  const flashToken = useRef(0);
  const previousIndex = useRef(0);
  const result = useTimedTypingTest(TYPING_TEST_TEXT, {
    durationSeconds,
    enabled: true,
  });

  const currentIndex = result.typingState.currentIndex;
  useEffect(() => {
    if (currentIndex === previousIndex.current) return;
    if (typingFeedback && currentIndex > previousIndex.current) {
      const record = result.typingState.characters[currentIndex - 1];
      if (record) {
        const location = keyForChar(record.char);
        if (location) {
          flashToken.current += 1;
          setFlash({ ...location, correct: record.status === "correct", token: flashToken.current });
        }
      }
    }
    previousIndex.current = currentIndex;
  }, [currentIndex, result.typingState.characters, typingFeedback]);

  useEffect(() => {
    if (result.isFinished) onFinished(result.typingState, result.statistics);
  }, [result.isFinished, result.statistics, result.typingState, onFinished]);

  const handleKeyDown = (key: string, shiftKey: boolean) => {
    if (!result.isFinished) result.pressKey(key, shiftKey);
  };

  const minutes = Math.floor(result.remainingMs / 60000);
  const seconds = Math.floor((result.remainingMs % 60000) / 1000);
  const hundredths = Math.floor((result.remainingMs % 1000) / 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Clock} label="Remaining" value={`${minutes}:${String(seconds).padStart(2, "0")}`} hint={`${String(hundredths).padStart(2, "0")} hundredths`} />
        <StatCard icon={Gauge} label="WPM" value={String(result.statistics.wpm)} />
        <StatCard icon={Target} label="Accuracy" value={`${result.statistics.accuracy}%`} />
        <StatCard icon={AlertCircle} label="Errors" value={String(result.statistics.incorrectCharacters)} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Timed Urdu typing</p>
            <p className="mt-1 text-sm text-ink-soft">Type the highlighted passage with your physical keyboard.</p>
          </div>
          {result.isFinished && <Badge tone="gold"><Trophy size={12} className="mr-1 inline" /> Test complete</Badge>}
        </div>

        <div className="mt-5 rounded-md border border-border bg-paper px-4 py-8">
          <TypingArea typingState={result.typingState} onKeyDown={handleKeyDown} feedbackEnabled={typingFeedback} />
        </div>

        {result.isFinished && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-success-500 bg-success-50 p-4">
            <p className="text-sm font-semibold text-ink">{result.finishedByTime ? "Time is up. Your typing has been stopped." : "You completed the passage before the timer ended."}</p>
            <Button variant="secondary" size="sm" onClick={() => { onRestart(); result.reset(); }}>
              <RotateCcw size={14} aria-hidden="true" /> Restart Test
            </Button>
          </div>
        )}
      </Card>

      {showKeyboard && (
        <Card>
          <p className="mb-4 text-sm font-medium text-ink-soft">On-screen keyboard and finger guide</p>
          <VirtualKeyboard expectedChar={result.isFinished ? null : result.typingState.currentChar} flash={flash} feedbackEnabled={typingFeedback} />
        </Card>
      )}
    </div>
  );
}

export default function Test() {
  useDocumentTitle("Typing Test");
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const [customMinutes, setCustomMinutes] = useState("2");
  const [isStarted, setIsStarted] = useState(false);
  const [result, setResult] = useState<{ typingState: TypingState; statistics: SessionStatistics } | null>(null);

  const durationSeconds = useMemo(() => {
    const option = durationOptions.find((item) => item.id === selectedDuration);
    if (option?.id !== "custom") return option?.seconds ?? 60;
    const minutes = Math.min(30, Math.max(1, Number(customMinutes) || 1));
    return minutes * 60;
  }, [customMinutes, selectedDuration]);

  function startTest() {
    setResult(null);
    setIsStarted(true);
  }

  const handleFinished = useCallback((typingState: TypingState, statistics: SessionStatistics) => {
    setResult({ typingState, statistics });
  }, []);

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
        description="Measure your Urdu typing speed and accuracy under a timed test."
        action={isStarted ? <Badge tone="neutral">{durationSeconds / 60}-minute test</Badge> : undefined}
      />

      <div className="py-10">
        {!isStarted ? (
          <div className="max-w-2xl">
            <Card>
              <h2 className="text-base font-semibold">Choose a duration</h2>
              <p className="mt-1 text-sm text-ink-soft">The timer starts when you start the test, so you can focus immediately on typing.</p>

              <div role="radiogroup" aria-label="Test duration" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {durationOptions.map((option) => {
                  const isSelected = selectedDuration === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedDuration(option.id)}
                      className={cn(
                        "rounded-sm border px-3 py-2.5 text-sm font-medium transition-colors",
                        isSelected ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-border text-ink-soft hover:border-border-strong hover:text-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {selectedDuration === "custom" && (
                <div className="mt-4 max-w-xs">
                  <Input label="Custom duration (1–30 minutes)" type="number" min={1} max={30} value={customMinutes} onChange={(event) => setCustomMinutes(event.target.value)} />
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md" onClick={startTest}>Start Test</Button>
                <span className="text-xs text-ink-faint">Physical keyboard input is captured automatically when the test starts.</span>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <TestSession durationSeconds={durationSeconds} onFinished={handleFinished} onRestart={() => setResult(null)} />
            {result && (
              <Card className="border-success-500 bg-success-50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">Test results are ready</p>
                    <p className="mt-1 text-sm text-ink-soft">{result.statistics.wpm} WPM · {result.statistics.accuracy}% accuracy · {result.statistics.incorrectCharacters} errors</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={viewResults}>View Full Results</Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
