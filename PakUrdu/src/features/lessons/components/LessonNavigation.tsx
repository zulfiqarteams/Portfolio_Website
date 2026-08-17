import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import type { Lesson } from "@/features/lessons/types";

interface LessonNavigationProps {
  previous?: Lesson;
  next?: Lesson;
}

/** Previous/Next lesson links, driven entirely by the lesson engine's ordering. */
export function LessonNavigation({ previous, next }: LessonNavigationProps) {
  return (
    <nav
      aria-label="Lesson navigation"
      className="flex items-stretch justify-between gap-4 border-t border-border pt-6"
    >
      {previous ? (
        <Link
          to={`/lesson/${previous.id}`}
          className="group flex min-w-0 flex-1 flex-col rounded-md border border-border px-4 py-3 text-left transition-colors hover:border-border-strong hover:bg-surface"
        >
          <span className="flex items-center gap-1.5 text-xs text-ink-faint">
            <ArrowLeft size={13} aria-hidden="true" />
            Previous
          </span>
          <span className="mt-1 truncate text-sm font-medium text-ink">{previous.title}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          to={`/lesson/${next.id}`}
          className={cn(
            "group flex min-w-0 flex-1 flex-col items-end rounded-md border border-border px-4 py-3 text-right transition-colors hover:border-border-strong hover:bg-surface",
          )}
        >
          <span className="flex items-center gap-1.5 text-xs text-ink-faint">
            Next
            <ArrowRight size={13} aria-hidden="true" />
          </span>
          <span className="mt-1 truncate text-sm font-medium text-ink">{next.title}</span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
