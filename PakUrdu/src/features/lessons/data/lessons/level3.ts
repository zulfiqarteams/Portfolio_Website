import type { Lesson } from "@/features/lessons/types";

/** Level 3 — Words, starting simple and building up. */
export const level3Lessons: Lesson[] = [
  {
    id: "words-simple-1",
    levelId: "level-3",
    moduleId: "module-words-simple",
    order: 1,
    title: "Everyday Words",
    description: "Short, common Urdu words to type with confidence.",
    difficulty: "Intermediate",
    type: "word",
    objectives: [
      "Char aam (common) lafz ko sahih tarah likhna.",
      "Lafz ke maani (meaning) bhi yaad rakhna.",
    ],
    content: {
      explanation:
        "Ab jab aap huruf aur unke combinations se waqif ho chuke hain, chaliye chand aam lafz try karte hain. Yeh sab roz-marra (everyday) zindagi mein istemal hone wale lafz hain.",
      examples: [
        { urdu: "سیب", transliteration: "seb", meaning: "apple" },
        { urdu: "پانی", transliteration: "paani", meaning: "water" },
        { urdu: "گھر", transliteration: "ghar", meaning: "house" },
        { urdu: "کتاب", transliteration: "kitaab", meaning: "book" },
      ],
      instructions: "Har lafz ko alag alag padhein, phir mashq (practice) ke liye tayyar hon.",
      exercises: [
        {
          id: "words-simple-1-words",
          type: "words",
          instruction: "In lafz ko tarteeb se likhne ki mashq karein.",
          target: "سیب پانی گھر کتاب",
        },
      ],
    },
  },
];
