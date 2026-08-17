export { useTypingEngine } from "@/features/typing-engine/hooks/useTypingEngine";
export type {
  UseTypingEngineOptions,
  UseTypingEngineResult,
} from "@/features/typing-engine/hooks/useTypingEngine";
export { useSessionTimer } from "@/features/typing-engine/hooks/useSessionTimer";
export type { TimerStatus, UseSessionTimerResult } from "@/features/typing-engine/hooks/useSessionTimer";
export { useTypingSession } from "@/features/typing-engine/hooks/useTypingSession";
export type {
  UseTypingSessionOptions,
  UseTypingSessionResult,
} from "@/features/typing-engine/hooks/useTypingSession";
export { calculateAccuracy, compareCharacters } from "@/features/typing-engine/lib/compareCharacters";
export { calculateWPM, calculateStatistics, formatTime } from "@/features/typing-engine/lib/statistics";
export type { SessionStatistics } from "@/features/typing-engine/lib/statistics";
export { segmentGraphemes } from "@/features/typing-engine/lib/textSegmentation";
export type {
  CharacterDisplay,
  CharacterStatus,
  TypingState,
} from "@/features/typing-engine/types";
