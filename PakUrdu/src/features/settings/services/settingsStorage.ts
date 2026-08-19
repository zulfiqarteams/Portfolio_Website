export const SETTINGS_KEY = "urduTypingTutorial:settings";

export type AppLanguage = "ur" | "en" | "roman";

export interface SettingsState {
  language: AppLanguage;
  darkTheme: boolean;
  largeInterface: boolean;
  showKeyboard: boolean;
  typingFeedback: boolean;
  saveLearningProgress: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  language: "ur",
  darkTheme: false,
  largeInterface: false,
  showKeyboard: true,
  typingFeedback: true,
  saveLearningProgress: true,
};

function isSettings(value: unknown): value is Partial<SettingsState> {
  return Boolean(value && typeof value === "object");
}

export function readSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!isSettings(parsed)) return DEFAULT_SETTINGS;

    const savedLanguage =
      parsed &&
      typeof parsed === "object" &&
      "language" in parsed &&
      (parsed as { language?: unknown }).language;

    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === "boolean"),
      ),
      language:
        savedLanguage === "ur" || savedLanguage === "en" || savedLanguage === "roman"
          ? savedLanguage
          : DEFAULT_SETTINGS.language,
    } as SettingsState;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: SettingsState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable in private browsing or blocked contexts.
  }
}
