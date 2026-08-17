import type { Lesson } from "@/features/lessons/types";

/** Level 6 — Professional Typing: formal, office, and educational Urdu. */
export const level6Lessons: Lesson[] = [
  {
    id: "professional-formal-writing-1",
    levelId: "level-6",
    moduleId: "module-professional-writing",
    order: 1,
    title: "Formal Correspondence",
    description: "The tone and vocabulary of formal, professional Urdu writing.",
    difficulty: "Professional",
    type: "mixed",
    objectives: [
      "Rasmi (formal) andaaz-e-tehreer pehchaanna.",
      "Ek office-style paragraph fluent tarah type karna.",
    ],
    content: {
      explanation:
        "Professional Urdu tehreer (writing) roz-marra ki guftagu se zyada rasmi hoti hai — jumlay lambe aur mukammal, aur lehja mo'addab (polite) hota hai. Yeh lesson ek chhota office-style paragraph pesh karta hai jo mail ya notice mein aam istemal hota hai.",
      targetText:
        "محترم صاحب، امید ہے آپ خیریت سے ہوں گے۔ درخواست ہے کہ مطلوبہ دستاویزات جلد از جلد ارسال کر دی جائیں تاکہ کام بروقت مکمل ہو سکے۔",
      instructions:
        "Is paragraph ko ghor se parhein aur mo'addab (polite), rasmi lehje par tawajjo dein.",
      exercises: [
        {
          id: "professional-formal-writing-1-mixed",
          type: "paragraph",
          instruction: "Is rasmi paragraph ko poora type karne ki mashq karein.",
          target:
            "محترم صاحب، امید ہے آپ خیریت سے ہوں گے۔ درخواست ہے کہ مطلوبہ دستاویزات جلد از جلد ارسال کر دی جائیں تاکہ کام بروقت مکمل ہو سکے۔",
        },
      ],
    },
  },
];
