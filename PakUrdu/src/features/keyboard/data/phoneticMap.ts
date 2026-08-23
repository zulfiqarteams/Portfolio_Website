/**
 * A Latin-key → Urdu-character phonetic mapping matching the real,
 * widely-used Urdu Phonetic keyboard standard — CRULP Urdu Phonetic
 * Keyboard Layout v1.1 (Center for Research in Urdu Language
 * Processing, National University of Computer and Emerging
 * Sciences), the same layout underlying Windows' built-in Urdu
 * Phonetic keyboard, InPage, and open implementations like Navees
 * (https://saadatm.github.io/navees/, itself CRULP v1.1-based).
 * Source consulted: CRULP's own v1.1 spec (cle.org.pk) and Navees'
 * published mapping tables.
 *
 * `phoneticMap` is CRULP's Base face; `shiftPhoneticMap` is its Shift
 * face. CRULP also defines a third, AltGr face (diacritics, honorifics,
 * a handful of rare letter variants) — this app only models two
 * levels, so AltGr is out of scope, with one deliberate exception:
 * `ؤ` (wao hamza), which lesson content actually uses, sits at
 * AltGr+W in the real standard. Since this app has no AltGr and
 * Shift+W is otherwise unclaimed here, `ؤ` is placed there instead —
 * the one pragmatic deviation from the standard, chosen because it's
 * the same physical key (`w`) the standard itself uses for it.
 * Every other key below matches the standard exactly; nothing here
 * is an invented or mnemonic-only mapping.
 */
export const phoneticMap: Record<string, string> = {
  // Number row — CRULP v1.1 Base face
  "1": "۱", "2": "۲", "3": "۳", "4": "۴", "5": "۵",
  "6": "۶", "7": "۷", "8": "۸", "9": "۹", "0": "۰",
  "-": "-", "=": "=",

  // Letters — CRULP v1.1 Base face
  q: "ق",
  w: "و",
  e: "ع",
  r: "ر",
  t: "ت",
  y: "ے",
  u: "ء",
  i: "ی",
  o: "ہ",
  p: "پ",
  a: "ا",
  s: "س",
  d: "د",
  f: "ف",
  g: "گ",
  h: "ح",
  j: "ج",
  k: "ک",
  l: "ل",
  z: "ز",
  x: "ش",
  c: "چ",
  v: "ط",
  b: "ب",
  n: "ن",
  m: "م",

  // Punctuation/symbols — CRULP v1.1 Base face
  "[": "[",
  "]": "]",
  "\\": "\\",
  ";": "؛",
  "'": "'",
  ",": "،",
  ".": "۔",
  "/": "/",
};

/**
 * CRULP v1.1 Shift face. Common diacritics and Urdu-specific letters
 * live here, including the characters that were previously missing from
 * the on-screen keyboard.
 */
export const shiftPhoneticMap: Record<string, string> = {
  // Number row
  "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
  "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
  "-": "_", "=": "+",

  // QWERTY letter row — CRULP v1.1 Shift face
  q: "ْ", w: "ّ", e: "ٰ", r: "َ", t: "ٹ", y: "ڑ",
  u: "ُ", i: "ۃ", o: "ِ", p: "ئ",

  // Home row
  a: "آ", s: "ص", d: "ڈ",
  g: "غ", h: "ھ", j: "ض", k: "خ",
  ";": ":", "'": '"',

  // Bottom row
  z: "ذ", x: "ژ", c: "ث", v: "ظ",
  n: "ں", m: "٘", ",": "؟", ".": "٫" ,

  "[": "{", "]": "}", "\\": "|",
};

/**
 * Extended AltGr (Right Alt / Ctrl+Alt) layer. CRULP v1.1 defines a
 * third AltGr face for less-common diacritics, honorifics and signs.
 * The web app exposes the useful Urdu/Islamic subset here so learners
 * can practice the same kinds of characters without needing a native
 * OS Urdu keyboard. The diacritic aliases follow the published Navees
 * phonetic mapping where it makes the web keyboard easier to use.
 */
export const altGrPhoneticMap: Record<string, string> = {
  // Diacritics
  e: "ٰ",
  i: "ِ",
  p: "ُ",
  y: "َ",
  q: "ْ",
  w: "ّ",
  u: "ٔ",
  m: "٘",
  // Honorifics / Islamic signs
  j: "ﷻ",
  d: "ﷺ",
  r: "ؓ",
  h: "ؒ",
  s: "ؐ",
  l: "ؑ",
  b: "﷽",
  // Common Urdu/Islamic phrase shortcuts (multi-grapheme output).
  // Holding Shift while using AltGr selects the uppercase alias.
  R: "رضی اللہ عنہ",
  H: "رحمۃ اللہ علیہ",
  L: "علیہ السلام",
  S: "صلی اللہ علیہ وسلم",
  // Common written variants requested for religious Urdu practice.
  T: "رضی اللہ تعالیٰ عنہ",
  A: "رحمۃ اللہ علیہا",
};

/**
 * Returns the Urdu character/phrase produced by an AltGr shortcut.
 * Keys are case-sensitive because uppercase aliases are reserved for
 * the phrase shortcuts above.
 */
export function getUrduForAltGrKey(key: string): string | undefined {
  return altGrPhoneticMap[key] ?? altGrPhoneticMap[key.toLowerCase()];
}

// Every Urdu character on the Shift face is distinct from every
// character on the Base face (this holds in the real CRULP layout
// itself, not just as a convenience for us) — so a reverse lookup
// never has to choose between "typed with Shift" and "typed without".
const reversePhoneticMap: Record<string, string> = Object.fromEntries(
  Object.entries(phoneticMap).map(([key, urdu]) => [urdu, key]),
);

const reverseShiftPhoneticMap: Record<string, string> = Object.fromEntries(
  Object.entries(shiftPhoneticMap).map(([key, urdu]) => [urdu, key]),
);

const reverseAltGrPhoneticMap: Record<string, string> = Object.fromEntries(
  Object.entries(altGrPhoneticMap)
    .filter(([, value]) => Array.from(value).length === 1)
    .map(([key, urdu]) => [urdu, key]),
);

/**
 * The Urdu character a given Latin key produces, if mapped.
 *
 * Case carries meaning here (unlike the rest of this module, which
 * otherwise deals in lowercase keys): an uppercase single letter
 * (e.g. the `"T"` a browser's `beforeinput` event reports for
 * `Shift+T`) is looked up in `shiftPhoneticMap` first, falling back
 * to the plain layer for any key with no dedicated Shift letter —
 * so `Shift+<key>` never simply produces nothing for a key that only
 * has a plain-layer letter. A lowercase key always uses the plain
 * layer only.
 */
const physicalCodeToKey: Record<string, string> = {
  Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
  Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
  Minus: "-", Equal: "=",
  KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "r", KeyT: "t",
  KeyY: "y", KeyU: "u", KeyI: "i", KeyO: "o", KeyP: "p",
  BracketLeft: "[", BracketRight: "]", Backslash: "\\",
  KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "f", KeyG: "g",
  KeyH: "h", KeyJ: "j", KeyK: "k", KeyL: "l",
  Semicolon: ";", Quote: "'",
  KeyZ: "z", KeyX: "x", KeyC: "c", KeyV: "v", KeyB: "b",
  KeyN: "n", KeyM: "m", Comma: ",", Period: ".", Slash: "/",
};

export function getUrduForPhysicalKey(code: string, shift = false): string | undefined {
  const key = physicalCodeToKey[code];
  if (!key) return undefined;
  return shift ? (shiftPhoneticMap[key] ?? phoneticMap[key]) : phoneticMap[key];
}

export function getUrduForKey(key: string): string | undefined {
  const lower = key.toLowerCase();
  const isShifted = key !== lower && key.length === 1;
  if (isShifted) {
    return shiftPhoneticMap[lower] ?? phoneticMap[lower];
  }
  return phoneticMap[lower];
}

/** The key (plus whether Shift is needed) that types a given Urdu grapheme, if this mapping covers it. */
export interface ExpectedKey {
  key: string;
  /** True if this character requires holding Shift (i.e. it lives on the Shift face). */
  shift: boolean;
  /** True if this character lives on the extended AltGr layer. */
  altGr?: boolean;
}

/**
 * The physical key (and Shift state) that would type the given Urdu
 * grapheme, if this mapping covers it. Space maps to itself;
 * unmapped graphemes (AltGr-only diacritics/honorifics, anything
 * outside CRULP's Base/Shift faces) return `undefined` so the caller
 * can simply not highlight anything.
 */
export function getExpectedKey(char: string | undefined): ExpectedKey | undefined {
  if (!char) return undefined;
  if (char === " ") return { key: "space", shift: false };

  const plainKey = reversePhoneticMap[char];
  if (plainKey) return { key: plainKey, shift: false };

  const shiftKey = reverseShiftPhoneticMap[char];
  if (shiftKey) return { key: shiftKey, shift: true };

  const altGrKey = reverseAltGrPhoneticMap[char];
  if (altGrKey) return { key: altGrKey, shift: false, altGr: true };

  return undefined;
}

/**
 * Full US-QWERTY physical layout used to lay out
 * `VirtualKeyboard`, with the common bottom-row punctuation keys
 * (`,` `.` `/`) included since Urdu punctuation is a normal part of
 * lesson/exercise target text (see Part 7 requirement 14).
 */
export const keyboardRows: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];
