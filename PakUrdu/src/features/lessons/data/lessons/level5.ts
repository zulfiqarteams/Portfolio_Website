import type { Lesson } from "@/features/lessons/types";

/** Level 5 — Paragraphs, realistic multi-sentence passages. */
export const level5Lessons: Lesson[] = [
  {
    id: "paragraphs-intro-1",
    levelId: "level-5",
    moduleId: "module-paragraphs-intro",
    order: 1,
    title: "A Short Paragraph",
    description: "Reading and typing a small, everyday paragraph.",
    difficulty: "Intermediate",
    type: "paragraph",
    objectives: [
      "Ek chhota paragraph roani (fluency) se parhna.",
      "Kayi jumlon ko lagatar (continuous) type karne ki tayyari karna.",
    ],
    content: {
      explanation:
        "Ab tak aap ne huruf, lafz, aur jumlay seekh liye hain. Yeh lesson unhein aapas mein jorta hai — ek chhota, roz-marra ka paragraph, jismein kai jumlay lagatar aate hain.",
      targetText:
        "صبح جلدی اٹھنا ایک اچھی عادت ہے۔ اس سے دن کے کام وقت پر مکمل ہوتے ہیں۔ ورزش اور ناشتہ بھی اسی وقت میں شامل کریں۔",
      instructions:
        "Paragraph ko pehle chup-chaap (silently) parhein, phir dobara zor se parhein taake roani banay.",
      exercises: [
        {
          id: "paragraphs-intro-1-paragraph",
          type: "paragraph",
          instruction: "Is paragraph ko poora likhne ki mashq karein.",
          target:
            "صبح جلدی اٹھنا ایک اچھی عادت ہے۔ اس سے دن کے کام وقت پر مکمل ہوتے ہیں۔ ورزش اور ناشتہ بھی اسی وقت میں شامل کریں۔",
        },
      ],
    },
  },
];
