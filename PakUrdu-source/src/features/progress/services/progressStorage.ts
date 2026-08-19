import type { ProfileProgress, ProgressStoreV1 } from "@/features/progress/types";

const PROGRESS_KEY = "urduTypingTutorial:progress";
const CURRENT_VERSION = 1;

function emptyStore(): ProgressStoreV1 {
  return { version: CURRENT_VERSION, progress: {} };
}

function isValidLessonProgress(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.lessonId === "string" &&
    typeof c.status === "string" &&
    typeof c.attempts === "number" &&
    typeof c.bestAccuracy === "number" &&
    typeof c.bestWpm === "number" &&
    typeof c.lastAccuracy === "number" &&
    typeof c.lastWpm === "number" &&
    typeof c.updatedAt === "string" &&
    Array.isArray(c.recentAttempts)
  );
}

function isValidProfileProgress(value: unknown): value is ProfileProgress {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  if (typeof c.profileId !== "string") return false;
  if (!Array.isArray(c.completedLessonIds)) return false;
  if (!c.lessonProgress || typeof c.lessonProgress !== "object") return false;
  return Object.values(c.lessonProgress as Record<string, unknown>).every(isValidLessonProgress);
}

/**
 * Reads and validates the progress store. Never throws — a missing
 * key, malformed JSON, an unrecognized version, or a corrupted entry
 * for one profile all fall back gracefully rather than taking down
 * the whole app. A corrupted single profile's progress is dropped
 * (treated as "no progress yet" for that profile) without discarding
 * every other profile's valid data.
 */
function readStore(): ProgressStoreV1 {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PROGRESS_KEY);
  } catch {
    return emptyStore();
  }
  if (!raw) return emptyStore();

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyStore();

    const candidate = parsed as Partial<ProgressStoreV1>;
    if (candidate.version !== CURRENT_VERSION) return emptyStore();
    if (!candidate.progress || typeof candidate.progress !== "object") return emptyStore();

    const validEntries = Object.entries(candidate.progress).filter(([, value]) =>
      isValidProfileProgress(value),
    );
    return { version: CURRENT_VERSION, progress: Object.fromEntries(validEntries) };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: ProgressStoreV1): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(store));
  } catch {
    // Storage full/unavailable — the in-memory session still works,
    // it just won't persist across reloads in this environment.
  }
}

export function readProfileProgress(profileId: string): ProfileProgress | null {
  return readStore().progress[profileId] ?? null;
}

export function writeProfileProgress(progress: ProfileProgress): void {
  const store = readStore();
  store.progress[progress.profileId] = progress;
  writeStore(store);
}

/** Deletes a profile's progress. Called when the profile itself is
 *  deleted, so no progress data outlives its profile. */
export function deleteProfileProgress(profileId: string): void {
  const store = readStore();
  if (!(profileId in store.progress)) return;
  delete store.progress[profileId];
  writeStore(store);
}
