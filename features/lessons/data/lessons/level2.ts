import type { Lesson } from "@/features/lessons/types";

/** Level 2 — Letter Combinations. */
export const level2Lessons: Lesson[] = [
  {
    id: "combinations-basic-1",
    levelId: "level-2",
    moduleId: "module-combinations-basic",
    order: 1,
    title: "Joining Familiar Letters",
    description: "Practice combining letters from Level 1 into short strings.",
    difficulty: "Beginner",
    type: "combination",
    objectives: [
      "Do ya teen huruf ko jor kar likhna.",
      "Huruf ke joinne (joining) se banne wali shakal pehchaanna.",
    ],
    content: {
      explanation:
        "Urdu ek 'joined-up' rasm-ul-khat (script) hai — zyada tar huruf apas mein juṛ jaate hain. Is lesson mein aap Level 1 ke huruf ko chhote combinations mein jorna practice karenge, bina abhi mukammal lafz (word) banaaye.",
      examples: [
        { urdu: "با", transliteration: "ba", meaning: "bay + alif" },
        { urdu: "تا", transliteration: "ta", meaning: "tay + alif" },
        { urdu: "جا", transliteration: "ja", meaning: "jeem + alif" },
      ],
      instructions: "Har combination ko ghor se dekhein ke do huruf ne mil kar kya shakal banaayi.",
      exercises: [
        {
          id: "combinations-basic-1-recognition",
          type: "recognition",
          instruction: "In combinations ko pehchaanein.",
          target: "با تا جا",
        },
      ],
    },
  },
];
