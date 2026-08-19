import type { Lesson } from "@/features/lessons/types";

/**
 * Level 0 — Getting Started.
 * Assumes the learner knows nothing about Urdu typing yet. No Urdu
 * typing is expected from the learner in this level — only reading.
 */
export const level0Lessons: Lesson[] = [
  {
    id: "intro-what-is-urdu-typing",
    levelId: "level-0",
    moduleId: "module-orientation",
    order: 1,
    title: "What Is Urdu Typing?",
    description: "A quick orientation before you type a single letter.",
    difficulty: "Beginner",
    type: "introduction",
    objectives: [
      "Samajhna ke Urdu typing kya hai.",
      "Jaanna ke yeh course aapko kahan tak le jaayega.",
    ],
    content: {
      explanation:
        "Urdu typing ka matlab hai apne computer ya phone par Urdu huruf (letters) likhna — jis tarah aap haath se Urdu likhte hain, usi tarah keyboard se bhi likha ja sakta hai. Yeh course aapko bilkul shuru se, ek ek huruf se, professional-level Urdu typing tak le jaayega.",
      instructions:
        "Is lesson mein koi typing nahi — sirf padhein aur samjhein ke aage kya hoga.",
    },
  },
  {
    id: "intro-phonetic-typing",
    levelId: "level-0",
    moduleId: "module-orientation",
    order: 2,
    title: "What Is Phonetic Typing?",
    description: "How the sound of a letter maps to a key on your keyboard.",
    difficulty: "Beginner",
    type: "introduction",
    objectives: [
      "Samajhna ke 'phonetic' typing ka matlab kya hai.",
      "Jaanna ke aawaz (sound) aur key ka taluq kaise banta hai.",
    ],
    content: {
      explanation:
        "Phonetic typing mein har English keyboard key ko Urdu huruf ki aawaz (sound) ke mutabiq istemal kiya jaata hai. Misaal ke taur par, jo key English mein 'b' ki aawaz deti hai, wahi key Urdu ka huruf 'ب' (bay) likhti hai — kyunke dono ki aawaz milti hai. Isi tarah 's' se 'س' (seen) banta hai. Isse aapko koi naya keyboard layout yaad karne ki zaroorat nahi — sirf aawaz par dhyan dena hai.",
      examples: [
        { urdu: "ب", transliteration: "b", meaning: "the 'b' sound" },
        { urdu: "س", transliteration: "s", meaning: "the 's' sound" },
        { urdu: "م", transliteration: "m", meaning: "the 'm' sound" },
      ],
      instructions:
        "Upar diye gaye huruf ko ghor se dekhein aur unki aawaz zehan mein rakhein. Typing agle lessons mein shuru hogi.",
    },
  },
  {
    id: "intro-keyboard-layout",
    levelId: "level-0",
    moduleId: "module-orientation",
    order: 3,
    title: "Understanding the Keyboard",
    description: "How your everyday keyboard becomes an Urdu keyboard.",
    difficulty: "Beginner",
    type: "introduction",
    objectives: [
      "Jaanna ke koi alag hardware ki zaroorat nahi.",
      "Samajhna ke keyboard ki har key ka Urdu mein kirdar kya hoga.",
    ],
    content: {
      explanation:
        "Aapko koi khaas Urdu keyboard kharidne ki zaroorat nahi. Aapka mojooda (existing) English keyboard hi kaafi hai — phonetic typing software har key ko sahih Urdu huruf mein badal deta hai. Is course mein aage chal kar har key ka Urdu huruf ke saath taluq tafseel se dikhaya jaayega.",
      instructions:
        "Apna keyboard saamne rakhein — agle lessons mein isi par amal (practice) shuru hoga.",
    },
  },
  {
    id: "intro-basic-posture",
    levelId: "level-0",
    moduleId: "module-orientation",
    order: 4,
    title: "Basic Typing Posture",
    description: "Sitting and hand position that keeps typing comfortable.",
    difficulty: "Beginner",
    type: "introduction",
    objectives: [
      "Sahih baithne ka tareeqa jaanna.",
      "Haathon ki position samajhna taake thakaan (fatigue) na ho.",
    ],
    content: {
      explanation:
        "Achi typing sirf sahih huruf jaanne se nahi, balke aaram deh (comfortable) posture se bhi banti hai. Seedhi kamar se baithein, kalaaiyan (wrists) seedhi rakhein, aur screen aankhon ke barabar rakhein. Yeh aadatein shuru se apnaana aage chal kar speed aur accuracy dono mein madad deti hain.",
      instructions: "Koi typing nahi — sirf apni baithak (sitting position) check karein.",
    },
  },
  {
    id: "intro-first-exercise",
    levelId: "level-0",
    moduleId: "module-orientation",
    order: 5,
    title: "Your First Typing Exercise",
    description: "A gentle first look at what a lesson's practice section will feel like.",
    difficulty: "Beginner",
    type: "introduction",
    objectives: [
      "Jaanna ke practice section kaisa dikhta hai.",
      "Agle level (Urdu Letters) ke liye tayyar hona.",
    ],
    content: {
      explanation:
        "Mubarak ho — aap ne orientation mukammal kar li! Agle level mein aap apne pehle Urdu huruf seekhna aur pehchaanna shuru karenge. Yahan neeche wala practice section sirf ek jhalak (preview) hai ke asal typing exercises kaisi dikhengi.",
      instructions: "Yeh sirf ek preview hai — abhi typing engine tayyar nahi hai.",
      exercises: [
        {
          id: "intro-first-exercise-preview",
          type: "recognition",
          instruction: "Neeche diya gaya huruf ghor se dekhein aur pehchaanein.",
          target: "ا",
        },
      ],
    },
  },
];
