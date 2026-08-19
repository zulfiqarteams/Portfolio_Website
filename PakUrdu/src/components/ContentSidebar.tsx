import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { getLevels, getLessonById } from "@/features/lessons";
import { readingSections } from "@/features/reading/data/content";

interface ContentSidebarProps {
  activeLessonId?: string;
  activeReadingId?: string;
}

const tutorialTracks = [
  { id: "basic", label: "Basic", min: 0, max: 2 },
  { id: "intermediate", label: "Intermediate", min: 3, max: 5 },
  { id: "advanced", label: "Advanced", min: 6, max: Number.POSITIVE_INFINITY },
] as const;

function getTrackForLevel(order: number) {
  return tutorialTracks.find((track) => order >= track.min && order <= track.max)?.id;
}

function SectionToggle({
  expanded,
  onClick,
  children,
}: {
  expanded: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface"
    >
      <span>{children}</span>
      {expanded ? (
        <ChevronDown size={16} aria-hidden="true" />
      ) : (
        <ChevronRight size={16} aria-hidden="true" />
      )}
    </button>
  );
}

function SidebarContent({ activeLessonId, activeReadingId, onNavigate }: ContentSidebarProps & { onNavigate?: () => void }) {
  const location = useLocation();
  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : undefined;
  const activeTrack = activeLesson
    ? getTrackForLevel(getLevels().find((level) => level.id === activeLesson.levelId)?.order ?? -1)
    : undefined;

  const selectedTrack = new URLSearchParams(location.search).get("track");
  const [tutorialOpen, setTutorialOpen] = useState(
    activeTrack !== undefined || selectedTrack !== null || location.pathname === "/learn",
  );
  const [readingOpen, setReadingOpen] = useState(
    activeReadingId !== undefined || location.pathname === "/learn/reading",
  );

  useEffect(() => {
    if (activeTrack || selectedTrack !== null || location.pathname === "/learn") {
      setTutorialOpen(true);
    }
  }, [activeTrack, location.pathname, selectedTrack]);

  useEffect(() => {
    if (activeReadingId || location.pathname === "/learn/reading") {
      setReadingOpen(true);
    }
  }, [activeReadingId, location.pathname]);


  return (
    <aside
      aria-label="Learning content navigation"
      className="w-full shrink-0 lg:sticky lg:top-24 lg:w-60 lg:self-start"
    >
      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-md border border-border bg-paper p-2 shadow-card overscroll-contain">
        <div>
          <SectionToggle expanded={tutorialOpen} onClick={() => setTutorialOpen((open) => !open)}>
            Typing Tutorial
          </SectionToggle>
          <div
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
              tutorialOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden pb-1 pl-2">
              {tutorialTracks.map((track) => {
                const isActive =
                  activeTrack === track.id ||
                  (location.pathname === "/learn" &&
                    new URLSearchParams(location.search).get("track") === track.id);

                return (
                  <NavLink
                    key={track.id}
                    to={`/learn?track=${track.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-sm px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-ink-soft hover:bg-surface hover:text-ink",
                    )}
                  >
                    <span>{track.label}</span>
                    {activeTrack === track.id && activeLesson && (
                      <span className="mt-0.5 block truncate text-[11px] font-normal text-brand-600">
                        Current: {activeLesson.title}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-1 border-t border-border pt-1">
          <SectionToggle expanded={readingOpen} onClick={() => setReadingOpen((open) => !open)}>
            Learn by Reading
          </SectionToggle>
          <div
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
              readingOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <nav className="min-h-0 overflow-hidden pb-1 pl-2" aria-label="Reading topics">
              {readingSections.map((section, index) => {
                const isActive = activeReadingId === section.id;
                return (
                  <a
                    key={section.id}
                    href={`/learn/reading#${section.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-sm px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-ink-soft hover:bg-surface hover:text-ink",
                    )}
                  >
                    {index + 1}. {section.title.en}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ContentSidebar({ activeLessonId, activeReadingId }: ContentSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="learning-content-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-paper px-3 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-surface"
        >
          {mobileOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          Course navigation
        </button>
      </div>

      <div id="learning-content-navigation" className={cn(!mobileOpen && "hidden lg:block")}>
        <SidebarContent
          activeLessonId={activeLessonId}
          activeReadingId={activeReadingId}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
    </>
  );
}
