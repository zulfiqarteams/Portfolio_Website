import { useSettings } from "@/features/settings";
import { ui } from "./translations";

export function useLanguage() {
  const { language, setSetting } = useSettings();
  const t = ui[language];

  return {
    language,
    t,
    setLanguage: (next: typeof language) => setSetting("language", next),
    direction: language === "ur" ? "rtl" as const : "ltr" as const,
    isUrdu: language === "ur",
  };
}
