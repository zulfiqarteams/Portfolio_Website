import { fingerForKey, keyForChar } from "@/features/keyboard/data/phoneticMap";
import { cn } from "@/lib/cn";
import { InteractiveKeyboard, type KeyboardFlash } from "@/features/keyboard/components/InteractiveKeyboard";

export type { KeyboardFlash };

interface VirtualKeyboardProps {
  expectedChar: string | null;
  flash: KeyboardFlash | null;
  feedbackEnabled?: boolean;
  className?: string;
}

export function VirtualKeyboard({ expectedChar, flash, feedbackEnabled = true, className }: VirtualKeyboardProps) {
  const expectedLocation = expectedChar ? keyForChar(expectedChar) : null;
  const guide = expectedLocation ? fingerForKey(expectedLocation.key) : null;

  return (
    <div className={cn("space-y-4", className)}>
      {feedbackEnabled && expectedChar && expectedLocation && guide && (
        <div className="rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Your next move</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-ink">
            <span className="urdu-text text-2xl font-bold">{expectedChar}</span>
            <span className="text-ink-faint">→</span>
            <span className="rounded border border-border bg-surface px-2.5 py-1 font-mono font-semibold uppercase">
              {expectedLocation.key === " " ? "Space" : expectedLocation.key}
            </span>
            {expectedLocation.shift && <span className="text-xs font-semibold text-brand-700">+ Shift</span>}
            <span className="text-ink-faint">→</span>
            <span className="font-semibold">{guide.hand} hand</span>
            <span className="text-ink-faint">·</span>
            <span className="font-semibold">{guide.finger} finger</span>
          </div>
        </div>
      )}

      <InteractiveKeyboard expectedChar={expectedChar} flash={flash} feedbackEnabled={feedbackEnabled} />
    </div>
  );
}

/**
 * @deprecated Use {@link VirtualKeyboard}. Kept as an alias so any
 * existing `LegacyVirtualKeyboard` imports keep compiling — the old
 * parallel KeyCap-based grid it used to render has been retired now
 * that InteractiveKeyboard covers the same ground (and more) using
 * the shared phoneticMap data.
 */
export const LegacyVirtualKeyboard = VirtualKeyboard;
