import type { Module } from "@/features/lessons/types";

/**
 * Modules group lessons thematically within a level. A level can
 * eventually hold many modules — Part 6 seeds one or two per level
 * so the hierarchy is real and navigable, without pretending the
 * curriculum is finished.
 */
export const modules: Module[] = [
  // Level 0 — Getting Started
  {
    id: "module-orientation",
    levelId: "level-0",
    order: 1,
    title: "Orientation",
    description: "The basics you need before typing a single letter.",
  },

  // Level 1 — Urdu Letters
  {
    id: "module-letters-group-1",
    levelId: "level-1",
    order: 1,
    title: "First Letters",
    description: "A first small group of Urdu letters.",
  },
  {
    id: "module-letters-group-2",
    levelId: "level-1",
    order: 2,
    title: "More Letters",
    description: "A second group, building on the first.",
  },

  // Level 2 — Letter Combinations
  {
    id: "module-combinations-basic",
    levelId: "level-2",
    order: 1,
    title: "Basic Combinations",
    description: "Joining letters you already know.",
  },

  // Level 3 — Words
  {
    id: "module-words-simple",
    levelId: "level-3",
    order: 1,
    title: "Simple Words",
    description: "Short, everyday Urdu words.",
  },

  // Level 4 — Sentences
  {
    id: "module-sentences-short",
    levelId: "level-4",
    order: 1,
    title: "Short Sentences",
    description: "Complete thoughts in a few words.",
  },

  // Level 5 — Paragraphs
  {
    id: "module-paragraphs-intro",
    levelId: "level-5",
    order: 1,
    title: "Introductory Paragraphs",
    description: "Multi-sentence passages at a gentle pace.",
  },

  // Level 6 — Professional Typing
  {
    id: "module-professional-writing",
    levelId: "level-6",
    order: 1,
    title: "Formal Writing",
    description: "Office, educational, and general professional Urdu.",
  },

  // Level 7 — Typing Tests
  {
    id: "module-typing-tests",
    levelId: "level-7",
    order: 1,
    title: "Practice Tests",
    description: "Timed passages, in preparation for a future Test Engine.",
  },
];
