import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Keyboard, RotateCcw, Target, Timer as TimerIcon } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/i18n/useLanguage";
import {
  useTypingEngine,
  TypingText,
  TypingCaptureArea,
  getVisibleWordWindow,
  useKeyboardTapInput,
} from "@/features/typing";
import { buildInstantUrduPassage } from "@/features/typing/data/instantUrduPassages";
import { VirtualKeyboard, usePressedKey, getExpectedKey } from "@/features/keyboard";
import { useTypingTimer, calculateCPM, calculateWPM, formatTime } from "@/features/statistics";
import { useSettings } from "@/features/settings";

/** How many words are ever visible at once — the underlying passage is sized for the whole selected duration, this is just the display window (see `getVisibleWordWindow`). */
const VISIBLE_WORDS = 8;

const durationOptions = [
  { seconds: 15, label: "15s" },
  { seconds: 30, label: "30s" },
  { seconds: 60, label: "60s" },
] as const;

const MIN_CUSTOM_SECONDS = 5;
const MAX_CUSTOM_SECONDS = 300;

/**
 * The homepage hero: a real, usable typing-test widget — not a
 * screenshot, marquee, or other decorative stand-in — placed above
 * everything else on the page (Requirement 1). It's interactive and
 * showing real target words from the very first paint, driven by the
 * same `useTypingEngine` + `TypingCaptureArea` (physical keyboard,
 * on-screen keyboard, and a native Urdu IME all work here exactly as
 * they do everywhere else in the app) the real Test/Practice pages
 * use, so what's shown here is what using the app actually feels
 * like, not a mockup of it. The homepage uses a small dedicated set of
 * natural Urdu sentences while the existing lesson/practice/test datasets
 * remain unchanged.
 *
 * A duration selector (15s/30s/60s plus a 5–300 second custom option)
 * picks how long the countdown runs; the timer
 * badge shows that countdown live once typing starts (`useTypingTimer`,
 * same hook Test.tsx uses for its own remaining-time readout) and
 * freezes the widget with a small inline result once time's up,
 * mirroring — at a glance — what the full Test page does.
 *
 * Only the current 8-word display window is ever rendered (`getVisibleWordWindow`,
 * the same windowing Test.tsx uses for its own long passages) —
 * the underlying passage is generously sized for the whole selected
 * duration, but only a fixed, non-scrolling batch of words is ever on
 * screen, so nothing here grows past one screenful no matter how long
 * the visitor keeps typing.
 *
 * The whole widget — word display plus the full on-screen keyboard —
 * is sized to fit in one viewport below the sticky navbar
 * (`hero-typing-height`, see index.css), so nothing here requires
 * scrolling to see, on any screen: `TypingText` and `VirtualKeyboard`
 * are both given `sizeVariant="compact"`, which scales their font
 * size / key height off *viewport height* via `clamp()` rather than
 * fixed breakpoints, so a short landscape phone shrinks everything
 * down while a tall desktop window lets it grow, all the way up to
 * each clamp's own maximum.
 */
export function HeroTypingWidget() {
  const { language, t } = useLanguage();
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [customSeconds, setCustomSeconds] = useState("90");
  const [showCustomTiming, setShowCustomTiming] = useState(false);
  const [attemptKey, setAttemptKey] = useState(0);
  const durationMs = durationSeconds * 1000;

  // Rebuilt only when the duration or an explicit restart changes —
  // never mid-attempt, same reasoning as Test.tsx's own targetText.
  const targetText = useMemo(() => buildInstantUrduPassage(durationSeconds, attemptKey), [durationSeconds, attemptKey]);

  const typing = useTypingEngine({ targetText });
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const hasEnded = typing.isComplete || timedOut;
  const { soundEnabled } = useSettings();
  const timer = useTypingTimer({
    hasStarted: typing.currentIndex > 0,
    isComplete: hasEnded,
    resetKey: `${durationSeconds}-${attemptKey}`,
    durationMs,
    onExpire: () => setTimedOut(true),
  });
  const keyboardTapInput = useKeyboardTapInput(typing, soundEnabled, timer.canAcceptInput);

  const remainingMs = Math.max(durationMs - timer.elapsedMs, 0);
  const elapsedMs = Math.min(timer.elapsedMs, durationMs);
  const typedCharacters = typing.sessionKeystrokes;
  const wpm = calculateWPM(typedCharacters, elapsedMs);
  const cpm = calculateCPM(typedCharacters, elapsedMs);
  const accuracy = typing.sessionKeystrokes > 0 ? typing.sessionAccuracy : 0;
  const isCustomDuration = !durationOptions.some((option) => option.seconds === durationSeconds);

  function restart(nextDurationSeconds?: number) {
    if (nextDurationSeconds !== undefined) setDurationSeconds(nextDurationSeconds);
    setTimedOut(false);
    typing.reset();
    setAttemptKey((key) => key + 1);
  }

  const pressedKey = usePressedKey(isCaptureActive && !hasEnded);
  const currentChar = typing.characters.find((character) => character.status === "current")?.char;
  const expectedKey = hasEnded ? undefined : getExpectedKey(currentChar);

  const visibleCharacters = useMemo(
    () => getVisibleWordWindow(typing.characters, targetText, typing.currentIndex, VISIBLE_WORDS),
    [typing.characters, targetText, typing.currentIndex],
  );

  const labels = t.home;

  const statusSummary = hasEnded
    ? `${labels.timeUp}. ${Math.round(wpm)} WPM.`
    : `${typing.correctCharacters} correct, ${typing.incorrectCharacters} incorrect, out of ${typing.currentIndex} typed so far.`;

  return (
    <section
      aria-label="Try the Urdu typing test"
      // `hero-typing-height` (see index.css) fills exactly the
      // viewport beneath the sticky Navbar, with a `vh`-then-`dvh`
      // fallback for older browsers — the fit Requirement 1 asks for,
      // on any screen size, no scrolling.
      className="hero-typing-height relative flex flex-col overflow-hidden border-b border-border bg-surface"
    >
      <PageContainer className="flex min-h-0 flex-col py-2 sm:py-3">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="inline-flex items-center gap-1.5">
              <Keyboard size={12} aria-hidden="true" />
              {labels.instantTypingTest}
            </Badge>

            <div role="radiogroup" aria-label="Test duration" className="flex items-center gap-1">
              {durationOptions.map((option) => (
                <button
                  key={option.seconds}
                  type="button"
                  role="radio"
                  aria-checked={durationSeconds === option.seconds && !showCustomTiming}
                  onClick={() => {
                    setShowCustomTiming(false);
                    restart(option.seconds);
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    durationSeconds === option.seconds && !showCustomTiming
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border text-ink-soft hover:border-border-strong hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={showCustomTiming || isCustomDuration}
                onClick={() => setShowCustomTiming((open) => !open)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  showCustomTiming
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border text-ink-soft hover:border-border-strong hover:text-ink",
                )}
              >
                {isCustomDuration ? `${labels.customTiming} (${durationSeconds}s)` : labels.customTiming}
              </button>
            </div>

            {showCustomTiming && (
              <form
                className="flex items-center gap-1 rounded-full border border-border bg-paper px-1.5 py-1"
                onSubmit={(event) => {
                  event.preventDefault();
                  const parsed = Number(customSeconds);
                  if (!Number.isFinite(parsed)) return;
                  const next = Math.min(Math.max(Math.round(parsed), MIN_CUSTOM_SECONDS), MAX_CUSTOM_SECONDS);
                  setCustomSeconds(String(next));
                  restart(next);
                  setShowCustomTiming(false);
                }}
              >
                <input
                  aria-label="Custom test duration in seconds"
                  type="number"
                  min={MIN_CUSTOM_SECONDS}
                  max={MAX_CUSTOM_SECONDS}
                  step="1"
                  value={customSeconds}
                  onChange={(event) => setCustomSeconds(event.target.value)}
                  className="w-14 bg-transparent text-center text-xs font-semibold text-ink outline-none"
                />
                <span className="text-[10px] text-ink-faint">sec</span>
                <button
                  type="submit"
                  className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-brand-600"
                >
                  {labels.setTiming}
                </button>
              </form>
            )}

            <Badge className="inline-flex min-w-[78px] items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold tabular-nums">
              <TimerIcon size={14} aria-hidden="true" className="text-brand-500" />
              {formatTime(remainingMs)}
            </Badge>

            {typing.currentIndex > 0 && (
              <button
                type="button"
                onClick={() => restart()}
                aria-label="Restart"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink"
              >
                <RotateCcw size={12} aria-hidden="true" />
              </button>
            )}
          </div>
          <Link
            to="/test"
            className="text-xs font-medium text-brand-600 hover:underline sm:text-sm"
          >
            {labels.fullTypingTest}
          </Link>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 pt-2 sm:pt-3">
          <div className="rounded-lg border border-border bg-paper px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              <Gauge size={12} aria-hidden="true" /> {labels.wpm}
            </div>
            <div className="numeric mt-0.5 text-lg font-bold text-ink">{Math.round(wpm)}</div>
          </div>
          <div className="rounded-lg border border-border bg-paper px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              <Keyboard size={12} aria-hidden="true" /> {labels.cpm}
            </div>
            <div className="numeric mt-0.5 text-lg font-bold text-ink">{Math.round(cpm)}</div>
          </div>
          <div className="rounded-lg border border-border bg-paper px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              <Target size={12} aria-hidden="true" /> {labels.accuracy}
            </div>
            <div className="numeric mt-0.5 text-lg font-bold text-ink">{accuracy}%</div>
          </div>
        </div>

        <div className="w-full pt-2 sm:pt-3">
          <TypingCaptureArea
            typing={typing}
            onActiveChange={setIsCaptureActive}
            autoFocus={false}
            suppressNativeKeyboardOnTouch
            canType={timer.canAcceptInput}
            isLocked={hasEnded}
          >
            <div className="w-full rounded-xl border border-border bg-surface px-4 py-4 shadow-card sm:px-6 sm:py-5">
              <div className="min-h-[6.5rem] overflow-hidden sm:min-h-[7rem]">
                <TypingText
                  characters={visibleCharacters}
                  statusSummary={statusSummary}
                  sizeVariant="compact"
                  layout="line"
                  resetKey={`${durationSeconds}-${attemptKey}`}
                />
              </div>
              {hasEnded && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-3 text-center">
                  <p className="text-sm font-medium text-ink-soft">{labels.timeUp}!</p>
                  <p className="text-xl font-semibold text-ink">
                    {Math.round(wpm)} <span className="text-sm font-normal text-ink-soft">WPM</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => restart()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-500 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    {labels.tryAgain}
                  </button>
                </div>
              )}
            </div>
          </TypingCaptureArea>
        </div>

        <div className="w-full shrink-0 pt-2 sm:pt-3">
          <VirtualKeyboard
            pressedKey={pressedKey}
            expectedKey={expectedKey}
            sizeVariant="compact"
            onKeyPress={keyboardTapInput.onKeyPress}
            onBackspace={keyboardTapInput.onBackspace}
          />
        </div>

        <div className="mt-3 flex shrink-0 flex-col items-center justify-center gap-1.5 border-t border-border pt-3 pb-2 text-center">
          <Link
            to="/learn"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-500 px-7 py-3 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-600 focus-visible:outline-brand-500 sm:px-10 sm:text-lg"
          >
            {labels.learnFromScratch}
            <ArrowRight className={language === "ur" ? "rotate-180" : ""} size={18} aria-hidden="true" />
          </Link>
          <p className="text-xs text-ink-faint">{labels.learnFromScratchHint}</p>
        </div>
      </PageContainer>
    </section>
  );
}
