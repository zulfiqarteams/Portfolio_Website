import type { Lesson } from "@/features/lessons/types";

/**
 * Level 7 — Typing Tests. These lessons are curriculum entries only:
 * they describe what a timed test passage will look like. The
 * actual Test Engine (timer, WPM, accuracy) is explicitly out of
 * scope for Part 6.
 */
export const level7Lessons: Lesson[] = [
  {
    id: "typing-test-preview-1",
    levelId: "level-7",
    moduleId: "module-typing-tests",
    order: 1,
    title: "Test Passage Preview",
    description: "A preview of the kind of passage a timed test will use.",
    difficulty: "Professional",
    type: "test",
    objectives: [
      "Jaanna ke ek test passage kaisa dikhta hai.",
      "Samajhna ke timing aur scoring baad mein Test Engine mein aayenge.",
    ],
    content: {
      explanation:
        "Yeh sirf ek jhalak (preview) hai ke ek future typing test kis tarah ka passage istemal karega. Is waqt koi timer, WPM, ya accuracy score maujood nahi — yeh sab ek alag Test Engine mein banaaye jaayenge.",
      targetText:
        "اردو ایک خوبصورت اور شیریں زبان ہے جو برصغیر میں صدیوں سے بولی اور لکھی جا رہی ہے۔",
      instructions: "Koi timer nahi — sirf passage ka andaaza (idea) lein.",
      exercises: [
        {
          id: "typing-test-preview-1-passage",
          type: "paragraph",
          instruction: "Future test passage ka namoona (sample).",
          target: "اردو ایک خوبصورت اور شیریں زبان ہے جو برصغیر میں صدیوں سے بولی اور لکھی جا رہی ہے۔",
        },
      ],
    },
  },
];
