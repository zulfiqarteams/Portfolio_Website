import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, Gauge, RotateCcw, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { TypingArea } from "@/features/practice/components/TypingArea";
import { VirtualKeyboard, keyForChar, type KeyboardFlash } from "@/features/keyboard";
import { useSettings } from "@/features/settings";
import type { SessionStatistics } from "@/features/typing-engine";
import type { TypingState } from "@/features/typing-engine/types";
import { TYPING_TEST_TEXT } from "@/features/tests/testText";
import {
  DEFAULT_TEST_DURATION_SECONDS,
  useTimedTypingTest,
} from "@/features/tests/useTimedTypingTest";

export interface TypingTestExperienceProps {
  durationSeconds?: number;
  onFinished?: (typingState: TypingState, statistics: SessionStatistics) => void;
  showKeyboard?: boolean;
  compact?: boolean;
  className?: string;
}

function formatTime(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TypingTestExperience({
  durationSeconds = DEFAULT_TEST_DURATION_SECONDS,
  onFinished,
  showKeyboard: showKeyboardOverride,
  compact = false,
  className = "",
}: TypingTestExperienceProps) {
  const { typingFeedback, showKeyboard: settingsShowKeyboard } = useSettings();
  const showKeyboard = showKeyboardOverride ?? settingsShowKeyboard;
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
          setFlash({
            ...location,
            correct: record.status === "correct",
            token: flashToken.current,
          });
        }
      }
    }

    previousIndex.current = currentIndex;
  }, [currentIndex, result.typingState.characters, typingFeedback]);

  useEffect(() => {
    if (result.isFinished) {
      onFinished?.(result.typingState, result.statistics);
    }
  }, [onFinished, result.isFinished, result.statistics, result.typingState]);

  const handleKeyDown = useCallback(
    (key: string, shiftKey: boolean) => {
      if (!result.isFinished) result.pressKey(key, shiftKey);
    },
    [result.isFinished, result.pressKey],
  );

  const handleRestart = useCallback(() => {
    previousIndex.current = 0;
    setFlash(null);
    result.reset();
  }, [result.reset]);

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Time"
          value={formatTime(result.remainingMs)}
          hint={result.isRunning ? "Type to keep going" : "Test finished"}
        />
        <StatCard icon={Gauge} label="WPM" value={String(result.statistics.wpm)} />
        <StatCard icon={Target} label="Accuracy" value={`${result.statistics.accuracy}%`} />
        <StatCard
          icon={AlertCircle}
          label="Errors"
          value={String(result.statistics.incorrectCharacters)}
        />
      </div>

      <Card className={compact ? "" : "shadow-sm"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Urdu typing test
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Type the passage below with your physical keyboard.
            </p>
          </div>
          {result.isFinished && (
            <Badge tone="gold">
              <Trophy size={12} className="mr-1 inline" aria-hidden="true" />
              Test complete
            </Badge>
          )}
        </div>

        <div
          className="mt-5 rounded-md border border-border bg-paper px-4 py-7 sm:px-6 sm:py-9"
          dir="rtl"
        >
          <TypingArea
            typingState={result.typingState}
            onKeyDown={handleKeyDown}
            feedbackEnabled={typingFeedback}
            scrollable
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink-faint">
          <span>{result.typingState.currentIndex.toLocaleString()} characters typed</span>
          <span>{TYPING_TEST_TEXT.length.toLocaleString()} characters in passage</span>
        </div>
      </Card>

      {showKeyboard && (
        <Card>
          <p className="mb-4 text-sm font-medium text-ink-soft">
            On-screen keyboard and finger guide
          </p>
          <VirtualKeyboard
            expectedChar={result.isFinished ? null : result.typingState.currentChar}
            flash={flash}
            feedbackEnabled={typingFeedback}
          />
        </Card>
      )}

      {result.isFinished && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-success-500 bg-success-50 p-4">
          <div>
            <p className="text-sm font-semibold text-ink">
              {result.finishedByTime
                ? "وقت ختم ہوگیا۔ آپ کی ٹائپنگ روک دی گئی ہے۔"
                : "آپ نے وقت ختم ہونے سے پہلے عبارت مکمل کرلی۔"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {result.statistics.wpm} WPM · {result.statistics.accuracy}% accuracy ·{" "}
              {result.statistics.incorrectCharacters} errors
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRestart}>
            <RotateCcw size={14} aria-hidden="true" />
            Restart
          </Button>
        </div>
      )}
    </div>
  );
}
