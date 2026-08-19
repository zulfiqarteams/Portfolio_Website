import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useProfiles } from "@/features/profiles";
import { useSettings } from "@/features/settings";
import type { Lesson } from "@/features/lessons/types";
import {
  completeLesson as completeLessonService,
  createEmptyProgress,
  deleteProgressForProfile,
  getLessonProgress,
  getLessonUiStatus,
  getNextAvailableLesson,
  getOverallStats,
  getProfileProgress,
  recordAttempt as recordAttemptService,
  type OverallProgressStats,
} from "@/features/progress/services/progressService";
import type { LessonProgress, ProfileProgress } from "@/features/progress/types";

interface Attempt {
  accuracy: number;
  wpm: number;
}

interface ProgressContextValue {
  /** The active profile's progress, or a read-only empty progress
   *  (profileId "") when no profile is selected — callers never
   *  need to null-check before asking about lesson status. */
  progress: ProfileProgress;
  /** Whether `progress` is really backed by a profile — actions are
   *  no-ops while this is false. */
  hasActiveProfile: boolean;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  getLessonUiStatus: (lesson: Lesson) => "completed" | "current" | "locked";
  nextAvailableLesson: Lesson | undefined;
  overallStats: OverallProgressStats;
  recordAttempt: (lessonId: string, attempt: Attempt) => void;
  completeLesson: (lessonId: string, attempt: Attempt) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const EMPTY_PROFILE_ID = "";

/**
 * Owns progress state for the currently active profile. Reloads
 * whenever the active profile changes (so switching profiles can
 * never leak one learner's progress into another's view), and
 * cleans up a profile's progress the moment that profile disappears
 * from the profiles list — whichever surface deleted it.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { profiles, activeProfile } = useProfiles();
  const { saveLearningProgress } = useSettings();

  const [progress, setProgress] = useState<ProfileProgress>(() =>
    activeProfile ? getProfileProgress(activeProfile.id) : createEmptyProgress(EMPTY_PROFILE_ID),
  );

  useEffect(() => {
    setProgress(
      activeProfile ? getProfileProgress(activeProfile.id) : createEmptyProgress(EMPTY_PROFILE_ID),
    );
  }, [activeProfile]);

  // Profile deletion cleanup: whenever a profile id that used to be
  // in the list disappears, its progress goes with it.
  const previousProfileIds = useRef<Set<string>>(new Set(profiles.map((p) => p.id)));
  useEffect(() => {
    const currentIds = new Set(profiles.map((p) => p.id));
    for (const id of previousProfileIds.current) {
      if (!currentIds.has(id)) deleteProgressForProfile(id);
    }
    previousProfileIds.current = currentIds;
  }, [profiles]);

  const recordAttempt = useCallback(
    (lessonId: string, attempt: Attempt) => {
      if (!activeProfile) return;
      const nextProgress = recordAttemptService(activeProfile.id, lessonId, attempt, saveLearningProgress);
      setProgress(nextProgress);
    },
    [activeProfile, saveLearningProgress],
  );

  const completeLesson = useCallback(
    (lessonId: string, attempt: Attempt) => {
      if (!activeProfile) return;
      const nextProgress = completeLessonService(activeProfile.id, lessonId, attempt, saveLearningProgress);
      setProgress(nextProgress);
    },
    [activeProfile, saveLearningProgress],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      hasActiveProfile: Boolean(activeProfile),
      getLessonProgress: (lessonId: string) => getLessonProgress(progress, lessonId),
      getLessonUiStatus: (lesson: Lesson) => getLessonUiStatus(progress, lesson),
      nextAvailableLesson: getNextAvailableLesson(progress),
      overallStats: getOverallStats(progress),
      recordAttempt,
      completeLesson,
    }),
    [progress, activeProfile, recordAttempt, completeLesson],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
