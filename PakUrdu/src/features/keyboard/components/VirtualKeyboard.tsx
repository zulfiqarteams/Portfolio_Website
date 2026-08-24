import { useState } from "react";
import { cn } from "@/lib/cn";
import { getUrduForKey, keyboardRows, shiftPhoneticMap, type ExpectedKey } from "@/features/keyboard/data/phoneticMap";
import type { PressedKey } from "@/features/keyboard/hooks/usePressedKey";

interface VirtualKeyboardProps {
  /** The key currently held down, or `null` when nothing is pressed. */
  pressedKey: PressedKey | null;
  /** The key (and Shift state) that would type the learner's current target character, if known. */
  expectedKey?: ExpectedKey;
  /**
   * `"default"` (the original fixed sizing, used by Test/Practice) or
   * `"compact"` — a viewport-height-driven `clamp()` size instead, so
   * the whole keyboard can shrink to fit a fixed-height container
   * (the homepage hero widget) rather than only ever growing at the
   * `sm` breakpoint. Purely a sizing choice — every other behavior
   * (highlighting, layout, a11y) is identical between variants.
   */
  sizeVariant?: "default" | "compact";
  /**
   * When provided, every key becomes a real tappable control that
   * calls back with the Urdu character it produces, and the keyboard
   * is no longer `aria-hidden`. This is what makes the keyboard the
   * actual input method on touch devices, which have no physical
   * keys for `pressedKey`/`usePressedKey` to ever observe — without
   * this, the keyboard could only ever mirror a hardware keystroke,
   * so on a phone it would visually never react at all.
   */
  onKeyPress?: (char: string) => void;
  /** Deletes the last typed character. Only meaningful alongside `onKeyPress`. */
  onBackspace?: () => void;
}

function KeyCap({
  label,
  active,
  expectedKey,
  compact,
  shiftHeld,
  interactive,
  onPress,
}: {
  label: string;
  active: boolean;
  expectedKey: ExpectedKey | undefined;
  compact: boolean;
  shiftHeld: boolean;
  interactive: boolean;
  onPress?: (char: string) => void;
}) {
  const urdu = getUrduForKey(label);
  const shiftUrdu = shiftPhoneticMap[label];
  const isExpected = expectedKey?.key === label;
  const expectedIsBase = isExpected && !expectedKey?.shift && !expectedKey?.altGr;
  const expectedIsShift = isExpected && expectedKey?.shift;
  const expectedIsAltGr = isExpected && expectedKey?.altGr;
  const showingShiftFace = shiftHeld && Boolean(shiftUrdu) && !expectedIsAltGr;
  const primaryUrdu = showingShiftFace ? shiftUrdu : urdu;

  // Each key shows exactly ONE secondary hint at a time, in one spot
  // (top-right corner) — never both a Shift hint and an AltGr hint
  // together, which is what made keys feel crammed. AltGr has no
  // touch equivalent and is the rarer, advanced layer, so it only
  // ever gets a visual cue by lighting up (bold) when it's the
  // expected face for the current step; it doesn't compete for
  // corner space on every key that happens to have one. When Shift
  // is actively held, the corner hint disappears entirely because
  // the key's main glyph has already swapped to that Shift face —
  // showing the same character in two places at once would be the
  // exact overlap this layout is meant to avoid.
  const showsCornerHint = Boolean(shiftUrdu) && !showingShiftFace;

  // AltGr's extended layer needs a physical Ctrl+Alt chord that has
  // no touch equivalent here, so a tap always sends the base/Shift
  // face — never the AltGr one — regardless of which face is shown.
  const keyClassName = cn(
    "relative box-border flex min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border font-medium leading-none transition-all",
    compact ? "h-[clamp(2rem,5.2vh,3.35rem)] px-0.5" : "h-10 px-1 sm:h-12",
    interactive && "touch-manipulation select-none active:scale-95",
    active
      ? "border-brand-600 bg-brand-500 text-white shadow-sm"
      : isExpected
        ? "border-brand-500 bg-brand-50"
        : "border-border bg-paper hover:border-border-strong",
  );

  const keyContent = (
    <>
      {/*
       * A bouncing pointer directly under the target key — the actual
       * "motion on the keyboard" the hand/finger guide alone can't give,
       * since that guide lives in its own box elsewhere on the page.
       * Bounces toward the key (not away from it) and is skipped once
       * the key is actively pressed, so it doesn't fight the "active"
       * state's own highlight.
       */}
      {isExpected && !active && (
        <span
          aria-hidden="true"
          className="keyboard-key-pointer absolute left-1/2 top-full -translate-x-1/2"
        />
      )}
      {showsCornerHint && (
        <span
          className={cn(
            "urdu-text absolute right-1 top-1 leading-none",
            compact ? "text-[clamp(7px,1.35vh,10px)]" : "text-[9px]",
            active
              ? "text-white/80"
              : expectedIsShift
                ? "font-bold text-brand-700"
                : "text-ink-faint",
          )}
        >
          {shiftUrdu}
        </span>
      )}
      <span
        className={cn(
          "urdu-text max-w-full leading-none",
          compact ? "text-[clamp(14px,2.55vh,20px)]" : "text-base sm:text-lg",
          active
            ? "text-white"
            : (showingShiftFace ? expectedIsShift : expectedIsBase) || expectedIsAltGr
              ? "font-bold text-brand-700"
              : "text-ink",
        )}
      >
        {primaryUrdu}
      </span>
      <span
        className={cn(
          "mt-0.5 uppercase leading-none",
          compact ? "text-[clamp(6px,1.05vh,9px)]" : "text-[8px]",
          active ? "text-white/75" : "text-ink-faint",
        )}
      >
        {label}
      </span>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label={primaryUrdu ? `Type ${primaryUrdu}` : label}
        onPointerDown={
          primaryUrdu
            ? (event) => {
                event.preventDefault();
                onPress?.(primaryUrdu);
              }
            : undefined
        }
        className={keyClassName}
      >
        {keyContent}
      </button>
    );
  }

  return <span className={keyClassName}>{keyContent}</span>;
}

function ModifierKey({
  label,
  wide,
  active,
  glow,
  compact,
  interactive,
  onPress,
}: {
  label: string;
  /** Wider key cap (`flex-[2]` instead of `flex-1`), matching a real Shift key's width. */
  wide?: boolean;
  active: boolean;
  /** Softly highlighted even when not physically pressed — used on Shift when the current target needs it. */
  glow?: boolean;
  compact: boolean;
  interactive: boolean;
  onPress?: () => void;
}) {
  const modifierClassName = cn(
    "flex min-w-0 items-center justify-center rounded-md border font-medium uppercase tracking-wide transition-colors",
    wide ? "flex-[1.45]" : "flex-1",
    compact
      ? "h-[clamp(2rem,5.2vh,3.35rem)] text-[clamp(7px,1.35vh,10px)]"
      : "h-10 text-[10px] sm:h-12 sm:text-xs",
    interactive && "touch-manipulation select-none active:scale-95",
    active
      ? "border-brand-600 bg-brand-500 text-white"
      : glow
        ? "border-brand-500 bg-brand-50 text-brand-700"
        : "border-border bg-paper text-ink-faint",
  );

  if (interactive) {
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label="Shift"
        aria-pressed={active}
        onPointerDown={(event) => {
          event.preventDefault();
          onPress?.();
        }}
        className={modifierClassName}
      >
        {label}
      </button>
    );
  }

  return <span className={modifierClassName}>{label}</span>;
}

/**
 * Learner-focused visual keyboard. Urdu is the primary, large character on
 * each key; the Latin physical key is secondary. Shift-layer characters stay
 * small in the corner until Shift is held, and the exact expected key/face is
 * highlighted. Ctrl is intentionally omitted because it is not part of the
 * Urdu phonetic typing flow.
 *
 * With no `onKeyPress`, the keyboard is visual-only (`aria-hidden`), mirroring
 * whatever the learner's physical keyboard is doing — `TypingCaptureArea`
 * captures the actual input. Pass `onKeyPress` (and usually `onBackspace`) to
 * make every key a real tappable control instead, which is required for the
 * keyboard to do anything on a touch device: there is no physical key for
 * `pressedKey` to ever reflect there, so without this the on-screen keyboard
 * would just sit static no matter what the learner tapped.
 */
export function VirtualKeyboard({
  pressedKey,
  expectedKey,
  sizeVariant = "default",
  onKeyPress,
  onBackspace,
}: VirtualKeyboardProps) {
  const compact = sizeVariant === "compact";
  const interactive = Boolean(onKeyPress);

  // Single-shot Shift for taps, matching how phone keyboards behave:
  // tapping Shift arms the next letter's Shift face, then releases
  // automatically — there's no physical key to "hold" on a touchscreen.
  const [touchShift, setTouchShift] = useState(false);

  // Physical Shift (a real hardware hold) and tapped Shift (a toggle,
  // since there's nothing to physically hold on a touchscreen) are
  // independent signals that both drive the same display — so a
  // desktop learner's physical Shift keeps working exactly as before
  // even though the keyboard is also tap-interactive.
  const needsShift = Boolean(expectedKey?.shift);
  const physicalShiftHeld = pressedKey?.shift ?? false;
  const shiftHeld = physicalShiftHeld || touchShift;
  const shiftKeyActive =
    pressedKey?.key === "shift" || (physicalShiftHeld && pressedKey?.key !== undefined) || touchShift;

  function handleKeyPress(char: string) {
    onKeyPress?.(char);
    if (touchShift) setTouchShift(false);
  }

  return (
    <div
      aria-hidden={interactive ? undefined : "true"}
      dir="ltr"
      className={cn("flex w-full flex-col items-center", compact ? "gap-[0.45vh]" : "gap-1 sm:gap-1.5")}
    >
      {keyboardRows.map((row, rowIndex) => {
        const isBottomLetterRow = rowIndex === keyboardRows.length - 1;
        // The home row (ASDF...) is the one every touch-typist's
        // fingers rest on — the natural place for a keyboard's own
        // nameplate. The brand mark sits behind the keys (it's first
        // in the DOM, so the keycaps painting after it cover it
        // everywhere except the gaps between them), so it reads as a
        // faint watermark rather than a fifth thing competing for
        // space on every key.
        const isHomeRow = rowIndex === keyboardRows.length - 2;
        return (
          // `w-full` here (not just on the outer wrapper) is what lets
          // each row's `flex-1` keys actually measure "the card's full
          // width" to shrink against, instead of only their own
          // content width.
          <div key={rowIndex} className={cn("relative flex w-full", compact ? "gap-[0.45vh]" : "gap-1 sm:gap-1.5")}>
            {isHomeRow && (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display font-semibold uppercase tracking-[0.3em] text-ink-faint/40",
                  compact ? "text-[clamp(6px,1vh,8px)]" : "text-[8px] sm:text-[9px]",
                )}
              >
                PakUrdu Typing
              </span>
            )}
            {isBottomLetterRow && (
              <ModifierKey
                label="Shift"
                wide
                active={shiftKeyActive}
                glow={needsShift}
                compact={compact}
                interactive={interactive}
                onPress={() => setTouchShift((held) => !held)}
              />
            )}
            {row.map((key) => (
              <KeyCap
                key={key}
                label={key}
                active={pressedKey?.key === key}
                expectedKey={expectedKey}
                compact={compact}
                shiftHeld={shiftHeld}
                interactive={interactive}
                onPress={handleKeyPress}
              />
            ))}
            {isBottomLetterRow && (
              <ModifierKey
                label="Shift"
                wide
                active={shiftKeyActive}
                glow={needsShift}
                compact={compact}
                interactive={interactive}
                onPress={() => setTouchShift((held) => !held)}
              />
            )}
          </div>
        );
      })}
      <div className={cn("flex w-full", compact ? "gap-[0.45vh]" : "gap-1 sm:gap-1.5")}>
        {interactive ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Space"
            onPointerDown={(event) => {
              event.preventDefault();
              handleKeyPress(" ");
            }}
            className={cn(
              "touch-manipulation select-none rounded-lg border font-medium transition-colors active:scale-[0.98]",
              compact ? "h-[clamp(1.35rem,3.2vh,2rem)] flex-[3]" : "h-8 flex-[3] sm:h-10",
              pressedKey?.key === "space"
                ? "border-brand-600 bg-brand-500 text-white"
                : expectedKey?.key === "space"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border bg-paper text-ink-faint",
            )}
          />
        ) : (
          <span
            className={cn(
              "mx-auto rounded-lg border font-medium transition-colors",
              compact ? "h-[clamp(1.35rem,3.2vh,2rem)] flex-[1.45]" : "h-8 flex-[1.45] sm:h-10",
              pressedKey?.key === "space"
                ? "border-brand-600 bg-brand-500 text-white"
                : expectedKey?.key === "space"
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border bg-paper text-ink-faint",
            )}
          />
        )}
        {/* Touch devices have no physical Backspace key at all, so a
            tap-to-type keyboard needs its own — otherwise a mistyped
            letter could never be corrected on a phone. */}
        {interactive && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Backspace"
            onPointerDown={(event) => {
              event.preventDefault();
              onBackspace?.();
            }}
            className={cn(
              "touch-manipulation flex flex-1 select-none items-center justify-center rounded-lg border border-border bg-paper text-ink-faint transition-colors active:scale-[0.98]",
              compact ? "h-[clamp(1.35rem,3.2vh,2rem)]" : "h-8 sm:h-10",
            )}
          >
            <span aria-hidden="true" className={compact ? "text-[clamp(10px,2vh,14px)]" : "text-sm"}>
              ⌫
            </span>
          </button>
        )}
      </div>
      {expectedKey?.altGr && (
        <p
          className={cn(
            "mt-0.5 font-medium text-brand-700",
            compact ? "text-[clamp(8px,1.6vh,11px)]" : "text-[10px] sm:text-xs",
          )}
        >
          Ctrl + Alt (AltGr)
        </p>
      )}
      {needsShift && (
        <p
          className={cn(
            "mt-0.5 font-medium transition-colors",
            compact ? "text-[clamp(8px,1.6vh,11px)]" : "text-[10px] sm:text-xs",
            shiftHeld ? "text-brand-700" : "text-ink-faint",
          )}
        >
          {interactive ? "Tap Shift ⇧" : "Hold Shift ⇧"}
        </p>
      )}
    </div>
  );
}
