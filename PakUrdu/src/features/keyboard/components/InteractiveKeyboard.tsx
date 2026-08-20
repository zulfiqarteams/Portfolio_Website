import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Finger = "Pinky" | "Ring" | "Middle" | "Index" | "Thumb";

interface KeyData {
  label: string;
  urdu: string;
  finger: Exclude<Finger, "Thumb">;
}

interface InteractiveKeyboardProps {
  expectedChar: string | null;
  flash: { key: string; correct: boolean; token: number } | null;
  feedbackEnabled?: boolean;
  className?: string;
}

const COLORS: Record<Finger, string> = {
  Pinky: "#D85A30",
  Ring: "#EF9F27",
  Middle: "#639922",
  Index: "#378ADD",
  Thumb: "#7F77DD",
};

const ROWS: KeyData[][] = [
  [
    { urdu: "ق", label: "Q", finger: "Pinky" }, { urdu: "و", label: "W", finger: "Ring" }, { urdu: "ی", label: "E", finger: "Middle" }, { urdu: "ر", label: "R", finger: "Index" }, { urdu: "ت", label: "T", finger: "Index" },
    { urdu: "ے", label: "Y", finger: "Index" }, { urdu: "ع", label: "U", finger: "Index" }, { urdu: "ی", label: "I", finger: "Middle" }, { urdu: "۔", label: "O", finger: "Ring" }, { urdu: "پ", label: "P", finger: "Pinky" },
  ],
  [
    { urdu: "ا", label: "A", finger: "Pinky" }, { urdu: "س", label: "S", finger: "Ring" }, { urdu: "د", label: "D", finger: "Middle" }, { urdu: "ف", label: "F", finger: "Index" }, { urdu: "گ", label: "G", finger: "Index" },
    { urdu: "ہ", label: "H", finger: "Index" }, { urdu: "ج", label: "J", finger: "Index" }, { urdu: "ک", label: "K", finger: "Middle" }, { urdu: "ل", label: "L", finger: "Ring" }, { urdu: ";", label: ".", finger: "Pinky" },
  ],
  [
    { urdu: "ز", label: "Z", finger: "Pinky" }, { urdu: "ش", label: "X", finger: "Ring" }, { urdu: "چ", label: "C", finger: "Middle" }, { urdu: "و", label: "V", finger: "Index" }, { urdu: "ب", label: "B", finger: "Index" },
    { urdu: "ن", label: "N", finger: "Index" }, { urdu: "م", label: "M", finger: "Index" }, { urdu: ",", label: ",", finger: "Middle" }, { urdu: "۔", label: ".", finger: "Ring" }, { urdu: "/", label: "/", finger: "Pinky" },
  ],
];

const OFFSETS = [0, 20, 30];
const LEGEND: Finger[] = ["Pinky", "Ring", "Middle", "Index", "Thumb"];

export function InteractiveKeyboard({ expectedChar, flash, feedbackEnabled = true, className }: InteractiveKeyboardProps) {
  const [visibleFlash, setVisibleFlash] = useState<typeof flash>(null);

  useEffect(() => {
    if (!feedbackEnabled || !flash) return setVisibleFlash(null);
    setVisibleFlash(flash);
    const timer = window.setTimeout(() => setVisibleFlash(null), 200);
    return () => window.clearTimeout(timer);
  }, [feedbackEnabled, flash]);

  return (
    <div className={cn("mx-auto w-full max-w-[620px] select-none font-mono", className)} dir="ltr" aria-label="Urdu phonetic keyboard">
      <div className="overflow-x-auto py-1">
        <div className="min-w-max">
          {ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-1.5 flex gap-1.5" style={{ marginLeft: OFFSETS[rowIndex] }}>
              {row.map((key) => {
                const flashing = feedbackEnabled && visibleFlash?.key.toLowerCase() === key.label.toLowerCase();
                const expected = feedbackEnabled && expectedChar === key.urdu;
                const color = flashing ? (visibleFlash?.correct ? COLORS.Middle : COLORS.Pinky) : COLORS[key.finger];
                return (
                  <div
                    key={`${key.urdu}-${key.label}`}
                    style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} ${expected ? 24 : 13}%, transparent)` }}
                    className={cn("flex h-12 w-11 flex-col items-center justify-center rounded-md border transition-colors duration-100", expected && "ring-2 ring-offset-1 ring-offset-paper")}
                    aria-hidden="true"
                  >
                    <span className="urdu-text text-lg leading-none text-ink">{key.urdu}</span>
                    <span className="mt-1 text-[10px] leading-none text-ink-faint">{key.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
          <div
            style={{ marginLeft: 45, borderColor: COLORS.Thumb, backgroundColor: `color-mix(in srgb, ${COLORS.Thumb} ${feedbackEnabled && expectedChar === " " ? 24 : 13}%, transparent)` }}
            className="mt-2 h-12 w-[260px] rounded-md border"
            aria-label="Spacebar"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        {LEGEND.map((finger) => <span key={finger} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[finger] }} />{finger}</span>)}
      </div>
    </div>
  );
}
