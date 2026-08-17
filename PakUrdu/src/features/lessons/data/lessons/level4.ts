import type { Lesson } from "@/features/lessons/types";

/** Level 4 — Sentences, from short to longer. */
export const level4Lessons: Lesson[] = [
  {
    id: "sentences-short-1",
    levelId: "level-4",
    moduleId: "module-sentences-short",
    order: 1,
    title: "Your First Sentences",
    description: "Complete, simple Urdu sentences.",
    difficulty: "Intermediate",
    type: "sentence",
    objectives: [
      "Do mukammal (complete) jumlay parhna aur likhna.",
      "Jumlay ke akhir mein urdu full-stop '۔' ka istemal samajhna.",
    ],
    content: {
      explanation:
        "Lafz seekhne ke baad, ab hum unhein mukammal jumlon (sentences) mein jorenge. Ghor karein ke Urdu jumlay ka full-stop English ke '.' jaisa nahi, balke '۔' hota hai.",
      examples: [
        { urdu: "میرا نام علی ہے۔", transliteration: "Mera naam Ali hai.", meaning: "My name is Ali." },
        { urdu: "آج موسم اچھا ہے۔", transliteration: "Aaj mausam acha hai.", meaning: "The weather is nice today." },
      ],
      targetText: "میرا نام علی ہے۔ آج موسم اچھا ہے۔",
      instructions: "Har jumla ghor se parhein, phir dono jumlon ko mila kar mashq karein.",
      exercises: [
        {
          id: "sentences-short-1-sentences",
          type: "sentences",
          instruction: "In do jumlon ko tarteeb se likhein.",
          target: "میرا نام علی ہے۔ آج موسم اچھا ہے۔",
        },
      ],
    },
  },
];
