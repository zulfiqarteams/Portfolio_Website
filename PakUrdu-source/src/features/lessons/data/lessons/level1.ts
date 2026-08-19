import type { Lesson } from "@/features/lessons/types";

/**
 * Level 1 — Urdu Letters, introduced in small groups rather than as
 * one long alphabet dump.
 */
export const level1Lessons: Lesson[] = [
  {
    id: "letters-group-1",
    levelId: "level-1",
    moduleId: "module-letters-group-1",
    order: 1,
    title: "First Letters: alif, bay, pay, tay",
    description: "Your first four Urdu letters and their sounds.",
    difficulty: "Beginner",
    type: "character",
    objectives: [
      "Char naye huruf pehchaanna: ا، ب، پ، ت",
      "Har huruf ki sahih aawaz ada karna.",
    ],
    content: {
      explanation:
        "Yeh lesson aapke pehle char huruf par mabni hai. 'ا' (alif) ek khaamosh (silent) huruf hai jo aksar madd (vowel) ke taur par kaam karta hai. 'ب' (bay), 'پ' (pay), aur 'ت' (tay) teeno lab aur zaban se banne wale huruf hain — inki aawaz English ke b, p, aur t se milti julti hai.",
      examples: [
        { urdu: "ا", transliteration: "alif", meaning: "silent / vowel base" },
        { urdu: "ب", transliteration: "bay", meaning: "'b' sound" },
        { urdu: "پ", transliteration: "pay", meaning: "'p' sound" },
        { urdu: "ت", transliteration: "tay", meaning: "'t' sound" },
      ],
      instructions: "Har huruf ko baar baar dekhein aur uski aawaz zehan mein dohraayein.",
      exercises: [
        {
          id: "letters-group-1-recognition",
          type: "recognition",
          instruction: "In huruf ko is tarteeb (order) mein pehchaanein.",
          target: "ا ب پ ت",
        },
        {
          id: "letters-group-1-repetition",
          type: "repetition",
          instruction: "Har huruf ko teen martaba (three times) likhne ki mashq karein.",
          target: "ا ا ا   ب ب ب   پ پ پ   ت ت ت",
        },
      ],
    },
  },
  {
    id: "letters-group-2",
    levelId: "level-1",
    moduleId: "module-letters-group-2",
    order: 1,
    title: "More Letters: Tay, jeem, che, dal",
    description: "Building on the first group with four more letters.",
    difficulty: "Beginner",
    type: "character",
    objectives: [
      "Char naye huruf pehchaanna: ٹ، ج، چ، د",
      "Pichle group ke huruf ke saath farq samajhna.",
    ],
    content: {
      explanation:
        "'ٹ' (Tay) ek 'zaban ultee' (retroflex) aawaz hai — zaban thoda peechhe mudti hai. 'ج' (jeem) aur 'چ' (che) qareebi aawazain hain lekin mukhtalif hain: jeem 'j' jaisa aur che 'ch' jaisa. 'د' (dal) 'd' ki aawaz deta hai.",
      examples: [
        { urdu: "ٹ", transliteration: "Tay", meaning: "retroflex 't' sound" },
        { urdu: "ج", transliteration: "jeem", meaning: "'j' sound" },
        { urdu: "چ", transliteration: "che", meaning: "'ch' sound" },
        { urdu: "د", transliteration: "dal", meaning: "'d' sound" },
      ],
      instructions: "Pehle group ke huruf yaad karein, phir in naye huruf ka moqabla karein.",
      exercises: [
        {
          id: "letters-group-2-recognition",
          type: "recognition",
          instruction: "In huruf ko is tarteeb mein pehchaanein.",
          target: "ٹ ج چ د",
        },
      ],
    },
  },
];
