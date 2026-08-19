import type { Level } from "@/features/lessons/types";

/**
 * The curriculum's major stages. This is an initial, sensible
 * ordering — not a claim that it's the scientifically optimal path
 * through the material. It's meant to be refined once real learner
 * data exists.
 *
 * `locked` is static mock data for Part 6: only Level 0 starts
 * unlocked. There is no completion tracking yet, so nothing here
 * reacts to learner progress — a future part will replace this with
 * a real computation.
 */
export const levels: Level[] = [
  {
    id: "level-0",
    order: 0,
    title: "Getting Started",
    description:
      "What Urdu typing is, how phonetic typing works, and your very first exercise.",
    locked: false,
  },
  {
    id: "level-1",
    order: 1,
    title: "Urdu Letters",
    description: "Meet the Urdu alphabet in small, manageable groups.",
    locked: true,
  },
  {
    id: "level-2",
    order: 2,
    title: "Letter Combinations",
    description: "Practice combining letters you've already learned.",
    locked: true,
  },
  {
    id: "level-3",
    order: 3,
    title: "Words",
    description: "Simple Urdu words, building toward more complex ones.",
    locked: true,
  },
  {
    id: "level-4",
    order: 4,
    title: "Sentences",
    description: "Short sentences, then longer ones.",
    locked: true,
  },
  {
    id: "level-5",
    order: 5,
    title: "Paragraphs",
    description: "Realistic Urdu paragraphs at a comfortable pace.",
    locked: true,
  },
  {
    id: "level-6",
    order: 6,
    title: "Professional Typing",
    description:
      "Formal writing, office text, and general professional Urdu.",
    locked: true,
  },
  {
    id: "level-7",
    order: 7,
    title: "Typing Tests",
    description:
      "Timed practice passages that will connect to a dedicated Test Engine.",
    locked: true,
  },
];
