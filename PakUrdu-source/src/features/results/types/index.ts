import type { SessionStatistics } from "@/features/typing-engine";

export interface Mistake {
  position: number;
  expected: string;
  typed: string;
}

/** Everything the Results screen needs, handed off via router
 *  navigation state from wherever a session just completed
 *  (currently only `/practice`). Nothing here is persisted — it's a
 *  one-time payload for the page the learner lands on immediately
 *  after finishing, not a stored result. */
export interface ExerciseResultPayload {
  resultType?: "lesson" | "test";
  lessonId: string;
  lessonTitle: string;
  target: string;
  statistics: SessionStatistics;
  mistakes: Mistake[];
  isNewBestWpm: boolean;
  isNewBestAccuracy: boolean;
  nextLessonId: string | null;
}
