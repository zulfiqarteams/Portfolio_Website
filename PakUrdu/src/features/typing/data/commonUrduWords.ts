/**
 * A curated list of common, everyday Urdu words used to drive the
 * homepage hero typing widget (`HeroTypingWidget`). Deliberately NOT
 * wired to the lesson catalog — same independence `Test.tsx`'s own
 * local sentence pool already documents: the typing engine stays
 * unaware of lesson data, and this hero widget is a marketing/demo
 * surface, not a graded exercise.
 *
 * Chosen for high everyday frequency (pronouns, common verbs,
 * question words, family/home vocabulary, numbers, greetings, basic
 * adjectives) rather than any formal corpus ranking — good enough for
 * a flowing "watch it work" demo, not a claim of a linguistically
 * verified frequency list.
 */
import { highFrequencyIslamicUrduWords } from "./islamicTypingWords";

export const commonUrduWords: string[] = [
  // Balanced homepage/demo corpus: keep Islamic vocabulary present, but do
  // not let it dominate a general Pakistani Urdu typing experience.
  "علی", "حمزہ", "بلال", "احمد", "محمد", "عبداللہ", "حسن", "حسین",
  "فاطمہ", "عائشہ", "سارہ", "سنا", "حنا", "مریم", "زینب", "عمر",
  "عثمان", "سلمان", "دانش", "عمران", "فہد", "حارث", "عروہ", "ماہین",
  ...highFrequencyIslamicUrduWords,
  // Pronouns
  "میں", "تم", "آپ", "وہ", "یہ", "ہم", "اس", "اسے", "ہمیں", "تمہیں",
  "میرا", "میری", "تیرا", "ہمارا", "تمہارا", "اپنا", "کوئی", "سب", "ہر", "کچھ",

  // Question words
  "کیا", "کون", "کیوں", "کب", "کہاں", "کیسے", "کتنا", "کس",

  // Common verbs
  "ہونا", "کرنا", "جانا", "آنا", "دیکھنا", "سننا", "کہنا", "بولنا",
  "لکھنا", "پڑھنا", "کھانا", "پینا", "سونا", "جاگنا", "چلنا", "بیٹھنا",
  "ملنا", "دینا", "لینا", "رکھنا", "بنانا", "سمجھنا", "جاننا", "چاہنا",
  "سیکھنا", "سکھانا", "کھیلنا", "ہنسنا", "رونا", "پوچھنا", "لانا", "بھیجنا",

  // Numbers
  "ایک", "دو", "تین", "چار", "پانچ", "چھ", "سات", "آٹھ", "نو", "دس",

  // Time
  "دن", "رات", "صبح", "شام", "دوپہر", "وقت", "سال", "مہینہ", "ہفتہ", "آج",
  "کل", "ابھی", "پہلے", "بعد",

  // People / family
  "آدمی", "عورت", "بچہ", "لڑکا", "لڑکی", "ماں", "باپ", "بھائی", "بہن",
  "دوست", "استاد", "طالب علم", "خاندان", "مہمان", "پڑوسی",

  // Places
  "گھر", "اسکول", "شہر", "ملک", "دنیا", "دکان", "بازار", "راستہ", "کمرہ",
  "دفتر", "پارک", "باغ", "دریا", "سمندر", "پہاڑ", "گاؤں", "محلہ", "مسجد",

  // Everyday objects
  "کتاب", "قلم", "پانی", "چائے", "روٹی", "چاول", "دودھ", "دروازہ",
  "کھڑکی", "میز", "کرسی", "موبائل", "کمپیوٹر", "تصویر", "خط", "پیسہ", "گاڑی",

  // Nature
  "ہوا", "دھوپ", "بارش", "سورج", "چاند", "ستارہ", "درخت", "پھول", "پھل", "موسم",

  // Adjectives
  "اچھا", "برا", "بڑا", "چھوٹا", "نیا", "پرانا", "خوبصورت", "لمبا",
  "تیز", "آہستہ", "گرم", "ٹھنڈا", "صاف", "آسان", "مشکل", "خوش",
  "اداس", "امیر", "غریب", "سچا", "مضبوط", "کمزور",

  // Conjunctions / prepositions / particles
  "اور", "یا", "لیکن", "اگر", "تو", "کیونکہ", "سے", "پر", "کا",
  "کی", "کے", "تک", "ساتھ", "بغیر",

  // Abstract / everyday concepts
  "بات", "کام", "زبان", "لفظ", "خیال", "سوال", "جواب", "خبر", "کہانی",
  "محبت", "خوشی", "امید", "خواب", "سچائی", "انصاف", "حق",

  // Greetings / common phrases
  "سلام", "شکریہ", "معاف", "خوش آمدید", "الوداع", "مبارک",
];

/**
 * Returns `count` words starting at `startIndex`, wrapping around to
 * the beginning of the list when it runs out — used so the hero
 * widget's word stream never actually "ends", it just keeps cycling.
 */
export function getWordBatch(startIndex: number, count: number): string[] {
  const total = commonUrduWords.length;
  if (total === 0 || count <= 0) return [];

  const batch: string[] = [];
  for (let i = 0; i < count; i++) {
    batch.push(commonUrduWords[(startIndex + i) % total]);
  }
  return batch;
}

/**
 * Builds a single space-joined target string from `count` words
 * starting at `startIndex` — the shape `useTypingEngine` /
 * `TypingCaptureArea` expect as `targetText`.
 */
export function buildWordBatchText(startIndex: number, count: number): string {
  return getWordBatch(startIndex, count).join(" ");
}

/**
 * Builds a single space-joined passage of common Urdu words sized for
 * a given duration, wrapping the word list as many times as needed —
 * a conservative ~3 chars/second budget (matching a slow typist) so
 * even a fast typist won't run out of text before time is up. Callers
 * that show a bounded duration are expected to render only a fixed
 * word-count window of this at once (see `getVisibleWordWindow` in
 * `features/typing/utils/textWindow.ts`) rather than the whole thing,
 * so the display never grows past a few words regardless of how long
 * this passage actually is.
 */
export function buildWordPassage(durationSeconds: number): string {
  const minCharBudget = Math.max(durationSeconds * 3, 40);
  const words: string[] = [];
  let length = 0;
  let i = 0;
  while (length < minCharBudget) {
    const word = commonUrduWords[i % commonUrduWords.length];
    words.push(word);
    length += word.length + 1;
    i++;
  }
  return words.join(" ");
}
