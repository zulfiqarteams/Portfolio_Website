import { useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { TypingState } from "@/features/typing-engine/types";

interface TypingAreaProps {
  typingState: TypingState;
  /** Physical key handler from `useTypingEngine().pressKey`, plus
   *  backspace — forwarded straight from the hidden input's
   *  `onKeyDown` so there is exactly one place that resolves raw
   *  key events into typing-core actions. */
  onKeyDown: (key: string, shiftKey: boolean) => void;
  feedbackEnabled?: boolean;
  autoFocus?: boolean;
}

const statusClasses: Record<TypingState["characters"][number]["status"], string> = {
  pending: "text-ink-faint",
  current: "text-ink bg-brand-50 border-b-2 border-brand-500",
  correct: "text-success-600",
  incorrect: "text-error-600 bg-error-50",
};

/**
 * Renders the target text character-by-character and owns the
 * (visually hidden) focusable input that captures real keyboard
 * events. Keeping a real `<input>` in the DOM — rather than a global
 * `keydown` listener — means IME/composition, focus, and mobile
 * on-screen-keyboard behavior all work the way users expect.
 */
export function TypingArea({ typingState, onKeyDown, feedbackEnabled = true, autoFocus = true }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    // Let real modifier/navigation combinations (Tab, Ctrl/Cmd+*,
    // reload shortcuts, etc.) behave normally instead of being
    // swallowed by the typing engine.
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      onKeyDown("Backspace", event.shiftKey);
      return;
    }

    if (event.key === " " || event.key.length === 1) {
      event.preventDefault();
      onKeyDown(event.key, event.shiftKey);
    }
  }

  return (
    <div
      className="relative cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <p
        dir="rtl"
        lang="ur"
        className="urdu-text flex flex-wrap justify-end gap-x-0.5 text-3xl leading-loose sm:text-4xl"
        aria-hidden="true"
      >
        {typingState.characters.map(({ char, status, index }) => (
          <span
            key={index}
            className={cn(
              "rounded-sm px-0.5 transition-colors duration-100",
              feedbackEnabled ? statusClasses[status] : statusClasses[status === "current" ? "current" : "pending"],
            )}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </p>

      <label className="sr-only" htmlFor="typing-engine-input">
        Type the Urdu text shown above
      </label>
      <input
        id="typing-engine-input"
        ref={inputRef}
        type="text"
        // Emptied every render so there's never real text content to
        // manage — the engine reads raw keydown events, not the
        // input's value. inputMode text keeps the mobile keyboard up.
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        className="absolute h-px w-px overflow-hidden opacity-0"
        aria-describedby="typing-engine-status"
      />
      <p id="typing-engine-status" className="sr-only" aria-live="polite">
        {typingState.isComplete
          ? "Exercise complete."
          : `Character ${typingState.currentIndex + 1} of ${typingState.totalCharacters}.`}
      </p>
    </div>
  );
}
