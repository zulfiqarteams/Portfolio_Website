import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, RotateCcw } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { WordMarquee } from "@/components/WordMarquee";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/cn";
import { useTypingEngine, TypingText, TypingStats, TypingCaptureArea, useKeyboardTapInput } from "@/features/typing";
import { VirtualKeyboard, HandFingerGuide, usePressedKey, getExpectedKey, fingerForKey } from "@/features/keyboard";
import { useTypingTimer, calculateWPM } from "@/features/statistics";
import { buildSessionResult, useSessionResult } from "@/features/results";
import { buildCategoryPassage, buildPracticePassage } from "@/features/typing/data/urduPracticeWords";
import { useSettings } from "@/features/settings";
import { useLanguage } from "@/i18n/useLanguage";

/**
 * Word-oriented practice sessions. The same 500-word data source powers every
 * session; level 1-5 progressively unlock more of the curated corpus, while
 * the Islamic set gives learners a focused religious-vocabulary option without
 * changing the underlying typing engine.
 */
const practiceExercises = [
  ...Array.from({ length: 5 }, (_, index) => {
    const level = index + 1;
    return {
      id: `word-level-${level}`,
      label: `Level ${level}`,
      target: buildPracticePassage(32, level, level * 19),
    };
  }),
  {
    id: "islamic-mix",
    label: "Islamic Words",
    target: buildCategoryPassage("islamic", 32, 11),
  },
];

export default function Practice() {
  const { t } = useLanguage();
  useSEO({
    title: "Urdu Typing Practice — Free Online Practice Tool",
    description:
      "Practice Urdu typing online with a virtual phonetic keyboard, live finger guidance, and instant accuracy and speed feedback on words and sentences.",
  });

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = practiceExercises[exerciseIndex];

  const typing = useTypingEngine({ targetText: exercise.target });
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  const { recordSessionResult } = useSessionResult();
  const { showKeyboard, typingFeedback, soundEnabled } = useSettings();
  const keyboardTapInput = useKeyboardTapInput(typing, soundEnabled);

  // A manual Reset should start a brand-new timed session even though
  // `exercise.target` hasn't changed — bumping this alongside
  // `typing.reset()` is what tells `useTypingTimer` to drop back to
  // idle (see `resetKey` below).
  const [resetCount, setResetCount] = useState(0);
  const hasRecordedCompletionRef = useRef(false);

  useEffect(() => {
    hasRecordedCompletionRef.current = false;
  }, [exercise.id, resetCount]);

  const timer = useTypingTimer({
    hasStarted: typing.currentIndex > 0,
    isComplete: typing.isComplete,
    resetKey: `${exercise.id}-${resetCount}`,
  });
  const wpm = calculateWPM(typing.currentIndex, timer.elapsedMs);

  // A standalone Practice session has no lesson and no Progress
  // Service record to compare against — `lessonId`/`lessonName` and
  // both "previous best" fields are `null`, same as the graceful
  // fallback `buildSessionResult` already handles for any session
  // with nothing to compare against.
  useEffect(() => {
    if (typing.isComplete && !hasRecordedCompletionRef.current) {
      hasRecordedCompletionRef.current = true;
      recordSessionResult(
        buildSessionResult({
          lessonId: null,
          lessonName: null,
          targetText: exercise.target,
          accuracy: typing.accuracy,
          sessionAccuracy: typing.sessionAccuracy,
          wpm,
          elapsedMs: timer.elapsedMs,
          correctCharacters: typing.correctCharacters,
          incorrectCharacters: typing.incorrectCharacters,
          totalCharacters: typing.totalCharacters,
          mistakes: typing.mistakes,
          previousBestAccuracy: null,
          previousBestWpm: null,
          // A standalone Practice session has no Progress Service
          // record to compare against, so it's never eligible to
          // register a "personal best" — see buildSessionResult's
          // `trackPersonalBest` doc.
          trackPersonalBest: false,
        }),
      );
    }
  }, [
    typing.isComplete,
    typing.accuracy,
    typing.sessionAccuracy,
    typing.correctCharacters,
    typing.incorrectCharacters,
    typing.totalCharacters,
    typing.mistakes,
    wpm,
    timer.elapsedMs,
    exercise.target,
    recordSessionResult,
  ]);

  useEffect(() => {
    if (!typing.isComplete) return;
    const timerId = window.setTimeout(() => {
      setExerciseIndex((current) => (current + 1) % practiceExercises.length);
    }, 650);
    return () => window.clearTimeout(timerId);
  }, [typing.isComplete]);

  function handleNextPractice() {
    setExerciseIndex((current) => (current + 1) % practiceExercises.length);
  }

  function handleReset() {
    typing.reset();
    setResetCount((count) => count + 1);
  }

  // Physical-key highlighting only listens while the capture input
  // is actually focused — see usePressedKey for why.
  const pressedKey = usePressedKey(isCaptureActive);
  const currentChar = typing.characters.find((character) => character.status === "current")?.char;
  const expectedKey = getExpectedKey(currentChar);

  const statusSummary = useMemo(() => {
    if (typing.isComplete) return t.practice.complete;
    if (typing.currentIndex === 0) {
      return `${t.practice.ready} ${typing.totalCharacters}`;
    }
    return `${typing.correctCharacters} ${t.practice.correct}, ${typing.incorrectCharacters} ${t.practice.incorrect}, ${typing.currentIndex} ${t.practice.typed}`;
  }, [
    typing.isComplete,
    typing.currentIndex,
    typing.correctCharacters,
    typing.incorrectCharacters,
    typing.totalCharacters,
  ]);

  return (
    <PageContainer>
      <PageHeader
        title={t.practice.title}
        description={t.practice.description}
        action={
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw size={14} aria-hidden="true" />
            {t.practice.reset}
          </Button>
        }
      />

      <WordMarquee
        words={practiceExercises.map((item) => item.target.split(/\s+/)[0])}
        label={t.practice.marqueeLabel}
        className="mb-6"
      />

      <div className="flex flex-wrap gap-2 pb-6" role="group" aria-label={t.practice.exerciseSelector}>
        {practiceExercises.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === exerciseIndex}
            onClick={() => setExerciseIndex(index)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              index === exerciseIndex
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-border text-ink-soft hover:border-border-strong hover:bg-surface",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="typing-workspace grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 space-y-6">
          <Card
            className={cn(
              "typing-display flex min-h-[190px] w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden",
              typing.isComplete && "border-success-500",
            )}
          >
            <TypingCaptureArea
              typing={typing}
              onActiveChange={setIsCaptureActive}
              suppressNativeKeyboardOnTouch={showKeyboard}
            >
              <div className="w-full min-w-0 overflow-hidden px-2 sm:px-4"><TypingText characters={typing.characters} statusSummary={statusSummary} showFeedback={typingFeedback} layout="scroll" resetKey={`${exercise.id}-${resetCount}`} /></div>
            </TypingCaptureArea>

            {typing.isComplete && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-success-600">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {t.practice.complete}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setExerciseIndex((current) => (current - 1 + practiceExercises.length) % practiceExercises.length)}>
                      {t.practice.previous} <ArrowRight className="rotate-180" size={13} aria-hidden="true" />
                    </Button>
                    <Button size="sm" onClick={handleNextPractice}>
                      {t.practice.next} <ArrowRight size={13} aria-hidden="true" />
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" to="/results">
                    <BarChart3 size={13} aria-hidden="true" />
                    {t.practice.results}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {showKeyboard && (
            <>
              <Card>
                <p className="mb-4 text-sm font-medium text-ink-soft">{t.practice.keyboard}</p>
                <VirtualKeyboard
                  pressedKey={pressedKey}
                  expectedKey={expectedKey}
                  onKeyPress={keyboardTapInput.onKeyPress}
                  onBackspace={keyboardTapInput.onBackspace}
                />
              </Card>

              <HandFingerGuide activeGuide={expectedKey ? fingerForKey(expectedKey.key) : null} />
            </>
          )}
        </div>

        <TypingStats
          accuracy={typing.accuracy}
          currentIndex={typing.currentIndex}
          totalCharacters={typing.totalCharacters}
          incorrectCharacters={typing.incorrectCharacters}
          wpm={wpm}
          elapsedMs={timer.elapsedMs}
        />
      </div>
    </PageContainer>
  );
}
