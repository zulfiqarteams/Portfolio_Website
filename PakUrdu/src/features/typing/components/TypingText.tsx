import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { TargetCharacter } from "@/features/typing/types";

interface TypingTextProps {
  characters: TargetCharacter[];
  /** Human-readable summary announced to screen readers on change,
   *  e.g. "3 of 7 correct. Next character: seen." */
  statusSummary: string;
  /** When false, correct/incorrect characters render in the same
   *  neutral style as pending — only the current-character cursor
   *  stays visible, since a learner needs to see where they are to
   *  type at all. Character comparison itself is untouched; this is
   *  purely a rendering choice, driven by the Settings "Typing
   *  behavior" toggle. Defaults to true (existing behavior). */
  showFeedback?: boolean;
  /**
   * `"default"` (fixed `text-4xl`/`sm:text-5xl`, used by Test/Practice/
   * Lesson practice) or `"compact"` — a viewport-height-driven
   * `clamp()` size instead, so the text shrinks to fit a fixed-height
   * container (the homepage hero widget) instead of only ever growing
   * at the `sm` breakpoint. Sizing only; comparison/status rendering
   * is identical between variants.
   */
  sizeVariant?: "default" | "compact";
  /**
   * `"default"` renders the full visible word window as static,
   * wrapped text (existing behavior — every character in `characters`
   * on screen at once). `"scroll"` instead renders a single
   * fixed-height horizontal strip showing one word at a time: the
   * word currently being typed stays anchored in place while finished
   * words slide off to one side and upcoming words are already
   * visible waiting on the other, animating a step over as each word
   * completes — closer to a one-line chat composer than a paragraph.
   * Comparison/status logic is completely unchanged either way; this
   * only changes how the same `characters` are laid out and animated.
   * Defaults to `"default"`.
   */
  layout?: "default" | "scroll" | "line";
  /**
   * `"scroll"` only. Changing this value snaps the strip back to the
   * first word instantly, with no slide animation — used when the
   * underlying passage itself resets (a new test/attempt/lesson), as
   * opposed to ordinary word-to-word progress, which always animates.
   */
  resetKey?: string | number;
}

const statusClasses: Record<TargetCharacter["status"], string> = {
  pending: "text-ink-faint",
  // Current: background + underline, not color alone — the learner
  // can tell where they are even without color vision.
  current:
    "text-ink bg-brand-50 border-b-2 border-brand-500 rounded-[3px]",
  correct: "text-success-600",
  // Incorrect: color *and* a wavy underline, so a mistake is legible
  // without relying on red/green distinction alone.
  incorrect:
    "text-error-600 underline decoration-wavy decoration-2 decoration-error-500 underline-offset-4",
};

// Same neutral treatment as "pending" — used in place of the
// correct/incorrect styles when `showFeedback` is off.
const neutralStatusClasses: Record<TargetCharacter["status"], string> = {
  pending: statusClasses.pending,
  current: statusClasses.current,
  correct: statusClasses.pending,
  incorrect: statusClasses.pending,
};

const sizeVariantClasses: Record<"default" | "compact", string> = {
  default: "text-4xl leading-[3.5rem] sm:text-5xl sm:leading-[4.5rem]",
  compact: "text-[clamp(1.25rem,5vh,3rem)] leading-[clamp(2.25rem,7.5vh,4.5rem)]",
};

// Matches the `leading-*` values above so the scroll strip's fixed
// height never mismatches the text it's clipping.
const sizeVariantHeightClasses: Record<"default" | "compact", string> = {
  default: "h-[3.5rem] sm:h-[4.5rem]",
  compact: "h-[clamp(2.25rem,7.5vh,4.5rem)]",
};

// Where the active word is anchored within the scroll strip, as a
// fraction of the strip's width measured from its left edge. Deliberately
// not centered (0.5): biasing it right-of-center leaves more of the
// strip free on the upcoming-word side (the "forward buffer" the
// learner reads next) than on the just-finished side, which is
// scrolling off-screen anyway and doesn't need the room.
const SCROLL_ANCHOR_RATIO = 0.62;

interface Word {
  chars: TargetCharacter[];
  /** Stable key — the index of the word's first character. */
  key: number;
}

/** Splits a flat character run into words on the literal space
 *  character, keeping each trailing space attached to the word before
 *  it (so typing the space is still part of finishing that word). */
function groupIntoWords(characters: TargetCharacter[]): Word[] {
  const words: Word[] = [];
  let current: TargetCharacter[] = [];
  for (const character of characters) {
    current.push(character);
    if (character.char === " ") {
      words.push({ chars: current, key: current[0].index });
      current = [];
    }
  }
  if (current.length > 0) {
    words.push({ chars: current, key: current[0].index });
  }
  return words;
}

/** The word currently being typed, or — once nothing is "current"
 *  anymore (the visible window has finished) — the last word, so the
 *  strip settles on the final word instead of scrolling past it into
 *  empty space. */
function findActiveWordIndex(words: Word[]): number {
  const index = words.findIndex((word) => word.chars.some((character) => character.status === "current"));
  if (index !== -1) return index;
  return Math.max(words.length - 1, 0);
}

/**
 * Renders the full target text, one grapheme per `<span>`, styled by
 * its live `TargetCharacter.status`. Purely presentational — all
 * comparison already happened in the typing engine core.
 */
export function TypingText({
  characters,
  statusSummary,
  showFeedback = true,
  sizeVariant = "default",
  layout = "default",
  resetKey,
}: TypingTextProps) {
  const classesForStatus = showFeedback ? statusClasses : neutralStatusClasses;

  if (layout === "scroll") {
    return (
      <ScrollTypingText
        characters={characters}
        statusSummary={statusSummary}
        classesForStatus={classesForStatus}
        sizeVariant={sizeVariant}
        resetKey={resetKey}
      />
    );
  }

  if (layout === "line") {
    return (
      <ContinuousWordLine
        characters={characters}
        statusSummary={statusSummary}
        classesForStatus={classesForStatus}
        sizeVariant={sizeVariant}
      />
    );
  }

  const compact = sizeVariant === "compact";
  return (
    <div>
      {/*
       * Deliberately NOT a flex/inline-block layout: Urdu letters
       * only join into their correct cursive (Nastaliq) shapes when
       * they sit in the same normal inline text run. `flex` (or
       * `display: inline-block` on the character spans below) turns
       * every grapheme into its own isolated layout box, which stops
       * the browser's Arabic-script shaping across letters — the
       * word then renders as a row of disconnected, isolated-form
       * letters instead of a properly joined word. Centering/wrapping
       * here comes from plain `text-align: center` + the paragraph's
       * own line-height instead, so the text stays one real RTL run
       * end to end.
       */}
      <p
        dir="rtl"
        className={cn("urdu-text mx-auto w-full max-w-full break-normal text-center", sizeVariantClasses[compact ? "compact" : "default"])}
      >
        {characters.map((character) => (
          <span
            key={character.index}
            aria-hidden="true"
            className={cn(
              // `inline` (not `inline-block`) — see the layout note
              // above. No horizontal padding/margin either, since
              // that too visually forces letters apart.
              "relative inline transition-colors",
              classesForStatus[character.status],
            )}
          >
            {character.char === " " ? "\u00A0" : character.char}
            {character.status === "current" && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 animate-caret bg-brand-500"
              />
            )}
          </span>
        ))}
      </p>
      {/* Screen-reader-only live status, since the character grid above is decorative. */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusSummary}
      </p>
    </div>
  );
}

/**
 * Homepage layout: a calm, continuous row of complete Urdu words.
 * Words are the layout units, while characters inside each word remain
 * normal inline text so Nastaliq shaping is preserved. No individual word
 * can be cut in half at a visual boundary.
 */
function ContinuousWordLine({
  characters,
  statusSummary,
  classesForStatus,
  sizeVariant,
}: {
  characters: TargetCharacter[];
  statusSummary: string;
  classesForStatus: Record<TargetCharacter["status"], string>;
  sizeVariant: "default" | "compact";
}) {
  const words = useMemo(() => groupIntoWords(characters), [characters]);
  // The word currently being typed — this one must never be dropped,
  // even if the rest of the batch doesn't fit the container.
  const anchorIndex = useMemo(() => findActiveWordIndex(words), [words]);

  const rowRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  // Which word keys currently fit on one line without being clipped.
  // `null` (the initial/pre-measurement state) means "render every
  // word" so the very first paint has something to measure; the
  // effect below immediately narrows it down before the user notices.
  const [visibleKeys, setVisibleKeys] = useState<Set<number> | null>(null);

  // Word batches change (new attempt, engine advances the window) —
  // reset to "show everything" for one frame so the new words exist
  // in the DOM to be measured against the current container width.
  useLayoutEffect(() => {
    setVisibleKeys(null);
  }, [words]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || words.length === 0) return;

    const recalc = () => {
      const available = row.parentElement?.clientWidth ?? row.clientWidth;
      // Reads the actual `gap-x-*` Tailwind utility in effect (which
      // itself changes at the `sm:` breakpoint), so this never drifts
      // out of sync with the row's real spacing.
      const gap = parseFloat(getComputedStyle(row).columnGap || "0") || 0;

      const widths = words.map((word) => wordRefs.current.get(word.key)?.offsetWidth ?? 0);
      const anchorWord = words[anchorIndex];
      if (!anchorWord) return;

      const included = new Set<number>([anchorWord.key]);
      let total = widths[anchorIndex] ?? 0;
      let left = anchorIndex - 1;
      let right = anchorIndex + 1;

      // Grow outward from the active word, alternating whichever side
      // has the next-cheapest word to add, until the next word (from
      // either side) would overflow the available width. Words that
      // don't fit are simply never rendered — never cut mid-glyph.
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
          sizeVariant === "compact"
            ? "text-[clamp(1.35rem,3.4vw,2.7rem)] leading-[1.9]"
            : "text-4xl leading-[3.5rem] sm:text-5xl",
        )}
      >
        {visibleWords.map((word) => (
          <span
            key={word.key}
            ref={(element) => {
              if (element) wordRefs.current.set(word.key, element);
              else wordRefs.current.delete(word.key);
            }}
            className="urdu-text inline-block shrink-0"
          >
            {word.chars.map((character) => (
              <span
                key={character.index}
                aria-hidden="true"
                className={cn("relative inline transition-colors", classesForStatus[character.status])}
              >
                {character.char === " " ? "" : character.char}
                {character.status === "current" && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 animate-caret bg-brand-500"
                  />
                )}
              </span>
            ))}
          </span>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {statusSummary}
      </p>
    </div>
  );
}

/**
 * `layout="scroll"` implementation. Groups `characters` into words,
 * keeps the currently-active word anchored at a fixed point in a
 * clipped horizontal strip, and slides the whole row by measuring the
 * active word's real layout position each render (`offsetLeft`, which
 * — unlike `getBoundingClientRect` — ignores any transform already
 * applied, so the math stays correct frame to frame). Word spans use
 * `inline-block` for reliable measurement, which is safe here (unlike
 * per-character `inline-block` in the default layout above) because
 * Arabic-script shaping only needs to happen *within* a word, never
 * across the word boundary we're already breaking on.
 */
function ScrollTypingText({
  characters,
  statusSummary,
  classesForStatus,
  sizeVariant,
  resetKey,
}: {
  characters: TargetCharacter[];
  statusSummary: string;
  classesForStatus: Record<TargetCharacter["status"], string>;
  sizeVariant: "default" | "compact";
  resetKey?: string | number;
}) {
  const words = useMemo(() => groupIntoWords(characters), [characters]);
  const activeIndex = useMemo(() => findActiveWordIndex(words), [words]);
  const activeWord = words[activeIndex];

  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const [translateX, setTranslateX] = useState(0);
  // Starts true so the very first paint never animates in from 0.
  const [instant, setInstant] = useState(true);
  const prevResetKeyRef = useRef(resetKey);

  // A reset (new attempt/passage) snaps back with no slide animation;
  // ordinary word-to-word progress always animates — see `instant`'s
  // other flip, below.
  useLayoutEffect(() => {
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      setInstant(true);
    }
  }, [resetKey]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeEl = activeWord ? wordRefs.current.get(activeWord.key) : undefined;
    if (!container || !activeEl) return;

    const recalc = () => {
      const containerWidth = container.clientWidth;
      const anchorX = containerWidth * SCROLL_ANCHOR_RATIO;
      const wordCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2;
      setTranslateX(anchorX - wordCenter);
    };

    recalc();

    // Re-anchor on container resize (orientation change, sidebar
    // toggle, etc.) without waiting for the next keystroke.
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeWord, words]);

  // Let the instantly-snapped position paint once, then re-enable the
  // slide transition for the next word-to-word move.
  useEffect(() => {
    if (!instant) return;
    const frame = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [instant, translateX]);

  return (
    <div>
      <div
        ref={containerRef}
        dir="rtl"
        className={cn("typing-marquee relative mx-auto w-full max-w-full overflow-hidden", sizeVariantHeightClasses[sizeVariant])}
      >
        <div
          className={cn(
            "urdu-text pointer-events-none inline-block max-w-none whitespace-nowrap will-change-transform",
            sizeVariantClasses[sizeVariant],
            !instant && "transition-transform duration-300 ease-out",
          )}
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {words.map((word) => (
            <span
              key={word.key}
              ref={(element) => {
                if (element) wordRefs.current.set(word.key, element);
                else wordRefs.current.delete(word.key);
              }}
              // `inline-block` per *word* (not per character — see the
              // component doc note above) so `offsetLeft`/`offsetWidth`
              // give a stable box to anchor the scroll math on.
              className="relative inline-block"
            >
              {word.chars.map((character) => (
                <span
                  key={character.index}
                  aria-hidden="true"
                  className={cn("relative inline transition-colors", classesForStatus[character.status])}
                >
                  {character.char === " " ? "\u00A0" : character.char}
                  {character.status === "current" && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 animate-caret bg-brand-500"
                    />
                  )}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      {/* Screen-reader-only live status, since the strip above is decorative. */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusSummary}
      </p>
    </div>
  );
}
