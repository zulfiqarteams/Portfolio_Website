import { useNavigate, Link } from "react-router-dom";
import { HomeIcon, Undo2Icon } from "lucide-react";
import { FINGER_COLORS } from "@/features/keyboard/data/phoneticMap";
import { cn } from "@/lib/cn";

/**
 * Design note: rather than a generic "oops" screen, this borrows the
 * keycap visual language from the phonetic keyboard (urdu-text glyph
 * on top, mono label underneath, finger-colored border) — the same
 * component vocabulary used throughout the app. The idea: the page
 * you asked for is a key that isn't mapped to anything, so a keycap
 * has come loose from the board. A few smaller keys are scattered
 * around it to sell that without needing a custom illustration.
 */

interface ScatterKey {
  urdu: string;
  label: string;
  color: string;
  className: string;
  rotate: number;
}

const SCATTERED_KEYS: ScatterKey[] = [
  { urdu: "ش", label: "S", color: FINGER_COLORS.Ring, className: "-left-4 top-6 sm:-left-10 sm:top-10", rotate: -18 },
  { urdu: "ک", label: "K", color: FINGER_COLORS.Middle, className: "-right-2 top-16 sm:-right-8 sm:top-20", rotate: 12 },
  { urdu: "ب", label: "B", color: FINGER_COLORS.Index, className: "left-8 -bottom-6 sm:left-2 sm:-bottom-10", rotate: 9 },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <style>{`
        @keyframes keycap-settle {
          0% { transform: translateY(-6px) rotate(-4deg); }
          50% { transform: translateY(0px) rotate(-6deg); }
          100% { transform: translateY(-6px) rotate(-4deg); }
        }
        .keycap-float {
          animation: keycap-settle 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .keycap-float {
            animation: none;
          }
        }
      `}</style>

      <div className="relative mb-10 h-40 w-40 sm:h-48 sm:w-48">
        {SCATTERED_KEYS.map((key) => (
          <div
            key={key.label}
            aria-hidden="true"
            style={{
              borderColor: key.color,
              backgroundColor: `color-mix(in srgb, ${key.color} 14%, transparent)`,
              transform: `rotate(${key.rotate}deg)`,
            }}
            className={cn(
              "absolute hidden h-11 w-10 flex-col items-center justify-center rounded-md border font-mono sm:flex",
              key.className,
            )}
          >
            <span className="urdu-text text-base leading-none text-ink-soft">{key.urdu}</span>
            <span className="mt-1 text-[9px] leading-none text-ink-faint">{key.label}</span>
          </div>
        ))}

        <div
          aria-hidden="true"
          style={{
            borderColor: FINGER_COLORS.Pinky,
            backgroundColor: `color-mix(in srgb, ${FINGER_COLORS.Pinky} 16%, transparent)`,
          }}
          className="keycap-float relative mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-2xl border-2 font-mono shadow-sm sm:h-36 sm:w-36"
        >
          <span className="urdu-text text-5xl leading-none text-ink sm:text-6xl">؟</span>
          <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">404</span>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Unmapped key</p>
      <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">This page isn&apos;t on the keyboard</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
        Nothing&apos;s bound to that address — the link may be broken, or the URL has a typo. Head back home, or go
        back to wherever you were.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          style={{ backgroundColor: FINGER_COLORS.Pinky }}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <HomeIcon className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Undo2Icon className="h-4 w-4" aria-hidden="true" />
          Go back
        </button>
      </div>
    </div>
  );
}
