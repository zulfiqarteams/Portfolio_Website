import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { TargetCharacter } from "@/features/typing/types";

interface TypingTextProps {
  characters: TargetCharacter[];
  statusSummary: string;
  showFeedback?: boolean;
  sizeVariant?: "default" | "compact";
  layout?: "default" | "scroll" | "line";
  resetKey?: string | number;
}

const sizeVariantClasses: Record<"default" | "compact", string> = {
  default: "text-4xl leading-[4.75rem] sm:text-5xl sm:leading-[5.5rem]",
  compact: "text-[clamp(1.25rem,5vh,3rem)] leading-[clamp(3.5rem,10vh,5rem)]",
};

const sizeVariantHeightClasses: Record<"default" | "compact", string> = {
  default: "h-[4.75rem] sm:h-[5.5rem]",
  compact: "h-[clamp(3.5rem,10vh,5rem)]",
};

const SCROLL_ANCHOR_RATIO = 0.62;

type WordStatus = "pending" | "current" | "correct" | "incorrect";

interface Word {
  chars: TargetCharacter[];
  key: number;
  text: string;
  status: WordStatus;
}

function getWordStatus(chars: TargetCharacter[]): WordStatus {
  if (chars.some((character) => character.status === "current")) return "current";
  if (chars.some((character) => character.status === "incorrect")) return "incorrect";
  const hasContent = chars.some((character) => character.char !== " ");
  if (hasContent && chars.every((character) => character.status === "correct" || character.char === " ")) return "correct";
  return "pending";
}

/**
 * Word-level grouping is deliberate. Characters are compared internally as
 * Unicode graphemes, but the visual DOM never wraps each Urdu grapheme in its
 * own layout box. Every word is one contiguous Urdu text run. The visual
 * layer is therefore segmented only at real word boundaries (spaces), never
 * between letters or grapheme clusters, so the browser can perform normal
 * Arabic/Urdu contextual shaping inside each word.
 */
function groupIntoWords(characters: TargetCharacter[]): Word[] {
  const words: Word[] = [];
  let current: TargetCharacter[] = [];

  const pushWord = () => {
    if (!current.length) return;
    const content = current.map((character) => character.char).join("").replace(/\s+$/, "");
    words.push({
      chars: current,
      key: current[0].index,
      text: content,
      status: getWordStatus(current),
    });
    current = [];
  };

  for (const character of characters) {
    if (character.char === " ") {
      pushWord();
    } else {
      current.push(character);
    }
  }
  pushWord();
  return words;
}

function findActiveWordIndex(words: Word[]): number {
  const index = words.findIndex((word) => word.status === "current");
  if (index !== -1) return index;
  let lastCorrect = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i].status === "correct") lastCorrect = i;
  }
  return lastCorrect >= 0 ? Math.min(lastCorrect + 1, Math.max(words.length - 1, 0)) : 0;
}

function wordClasses(status: WordStatus, showFeedback: boolean): string {
  // IMPORTANT: Urdu/Nastaliq shaping must happen inside one uninterrupted
  // text run. Per-grapheme spans (especially when their styles differ) can
  // split the browser's shaping runs and make long/looped letters appear
  // broken or overlap. Feedback is therefore applied at WORD level here;
  // the typing engine still keeps the exact per-grapheme status internally.
  if (status === "current") {
    return "text-ink rounded-md bg-brand-50 px-2 py-1 underline decoration-brand-500 decoration-2 underline-offset-8";
  }
  if (showFeedback && status === "incorrect") {
    return "text-error-600 underline decoration-wavy decoration-2 decoration-error-500 underline-offset-8";
  }
  if (showFeedback && status === "correct") return "text-success-600";
  return "text-ink-faint";
}

/**
 * Render the complete word as ONE text node. This is intentional: Arabic /
 * Urdu contextual joining (especially Nastaliq swashes and long loops) is
 * much more reliable when the browser receives the complete word as a
 * continuous shaping run rather than one styled span per grapheme.
 */
function renderWord(word: Word, showFeedback: boolean, className = "") {
  return (
    <span
      key={word.key}
      className={cn(
        "typing-word inline-block shrink-0 whitespace-nowrap break-keep overflow-visible align-baseline",
        wordClasses(word.status, showFeedback),
        className,
      )}
      dir="rtl"
      lang="ur"
    >
      {word.text}
    </span>
  );
}

export function TypingText({
  characters,
  statusSummary,
  showFeedback = true,
  sizeVariant = "default",
  layout = "default",
  resetKey,
}: TypingTextProps) {
  const words = useMemo(() => groupIntoWords(characters), [characters]);

  if (layout === "scroll") {
    return (
      <ScrollTypingText
        words={words}
        statusSummary={statusSummary}
        showFeedback={showFeedback}
        sizeVariant={sizeVariant}
        resetKey={resetKey}
      />
    );
  }

  if (layout === "line") {
    return (
      <ContinuousWordLine words={words} statusSummary={statusSummary} showFeedback={showFeedback} sizeVariant={sizeVariant} />
    );
  }

  return (
    <div>
      <p
        dir="rtl"
        lang="ur"
        className={cn(
          "urdu-text mx-auto w-full max-w-full text-center break-normal [word-break:normal] [overflow-wrap:normal]",
          sizeVariantClasses[sizeVariant],
        )}
      >
        {words.map((word) => renderWord(word, showFeedback, "mx-1 sm:mx-1.5"))}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {statusSummary}
      </p>
    </div>
  );
}

function ContinuousWordLine({
  words,
  statusSummary,
  showFeedback,
  sizeVariant,
}: {
  words: Word[];
  statusSummary: string;
  showFeedback: boolean;
  sizeVariant: "default" | "compact";
}) {
  const anchorIndex = useMemo(() => findActiveWordIndex(words), [words]);
  const rowRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const [visibleKeys, setVisibleKeys] = useState<Set<number> | null>(null);

  useLayoutEffect(() => setVisibleKeys(null), [words]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || !words.length) return;

    const recalc = () => {
      const available = row.parentElement?.clientWidth ?? row.clientWidth;
      const gap = parseFloat(getComputedStyle(row).columnGap || "0") || 0;
      const widths = words.map((word) => wordRefs.current.get(word.key)?.offsetWidth ?? 0);
      if (!widths[anchorIndex]) return;

      const included = new Set<number>([words[anchorIndex].key]);
      let total = widths[anchorIndex];
      let left = anchorIndex - 1;
      let right = anchorIndex + 1;

      while (left >= 0 || right < words.length) {
        const leftCost = left >= 0 ? widths[left] + gap : Infinity;
        const rightCost = right < words.length ? widths[right] + gap : Infinity;
        const takeLeft = leftCost <= rightCost;
        const cost = takeLeft ? leftCost : rightCost;
        if (!Number.isFinite(cost) || total + cost > available) break;
        total += cost;
        if (takeLeft) {
          included.add(words[left].key);
          left--;
        } else {
          included.add(words[right].key);
          right++;
        }
      }
      setVisibleKeys(included);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    if (row.parentElement) observer.observe(row.parentElement);
    return () => observer.disconnect();
  }, [words, anchorIndex]);

  const visibleWords = visibleKeys ? words.filter((word) => visibleKeys.has(word.key)) : words;

  return (
    <div className="flex min-h-[6.5rem] w-full items-center justify-center overflow-hidden" dir="rtl">
      <div
        ref={rowRef}
        className={cn(
          "flex w-full max-w-full items-center justify-center gap-x-4 overflow-hidden whitespace-nowrap text-center sm:gap-x-6",
          sizeVariant === "compact" ? "text-[clamp(1.35rem,3.4vw,2.7rem)] leading-[1.9]" : "text-4xl leading-[3.5rem] sm:text-5xl",
        )}
      >
        {visibleWords.map((word) => (
          <span
            key={word.key}
            ref={(element) => {
              if (element) wordRefs.current.set(word.key, element);
              else wordRefs.current.delete(word.key);
            }}
            className="urdu-text inline-block shrink-0 whitespace-nowrap"
            dir="rtl"
            lang="ur"
          >
            {renderWord(word, showFeedback)}
          </span>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{statusSummary}</p>
    </div>
  );
}

function ScrollTypingText({
  words,
  statusSummary,
  showFeedback,
  sizeVariant,
  resetKey,
}: {
  words: Word[];
  statusSummary: string;
  showFeedback: boolean;
  sizeVariant: "default" | "compact";
  resetKey?: string | number;
}) {
  const activeIndex = useMemo(() => findActiveWordIndex(words), [words]);
  const activeWord = words[activeIndex];
  const activeWordKey = activeWord?.key;
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const [translateX, setTranslateX] = useState(0);
  const [instant, setInstant] = useState(true);
  const prevResetKeyRef = useRef(resetKey);
  const prevActiveWordKeyRef = useRef(activeWordKey);

  useLayoutEffect(() => {
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      setInstant(true);
    }
  }, [resetKey]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeEl = activeWordKey === undefined ? undefined : wordRefs.current.get(activeWordKey);
    if (!container || !activeEl) return;

    // Only animate when the active WORD changes. Typing another character
    // inside the same word updates feedback classes but does not need to
    // restart a 300ms transform transition. Restarting that transition on
    // every keystroke was especially visible during rapid Urdu typing.
    const movedToNewWord = prevActiveWordKeyRef.current !== activeWordKey;
    prevActiveWordKeyRef.current = activeWordKey;
    setInstant(!movedToNewWord);

    const recalc = () => {
      const anchorX = container.clientWidth * SCROLL_ANCHOR_RATIO;
      const wordCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
      setTranslateX(anchorX - wordCenter);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeWordKey, words]);

  return (
    <div>
      <div
        ref={containerRef}
        dir="rtl"
        className={cn("typing-marquee relative mx-auto w-full max-w-full overflow-hidden", sizeVariantHeightClasses[sizeVariant])}
      >
        <div
          className={cn(
            "urdu-text pointer-events-none inline-flex max-w-none items-center gap-x-5 whitespace-nowrap will-change-transform sm:gap-x-7",
            sizeVariantClasses[sizeVariant],
            !instant && "transition-transform duration-300 ease-out",
          )}
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {words.map((word) => renderWord(word, showFeedback, "mx-0"))}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{statusSummary}</p>
    </div>
  );
}
