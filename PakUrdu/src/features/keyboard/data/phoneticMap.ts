/**
 * Authoritative keyboard data for the PakUrdu typing engine and virtual keyboard.
 *
 * Baseline:
 * - CRULP Urdu Phonetic Keyboard Layout v1.1 (CLE/CRULP, 2007): Base + AltGr.
 * - CLE Urdu Phonetic Keyboard Layout v1.2 (2019): updated Shift face.
 * - Keyman Urdu Phonetic (CRULP) documentation used as a secondary cross-check.
 *
 * Sources:
 * https://cle.org.pk/software/localization/keyboards/CRULPphonetickbv1.1.html
 * https://cle.org.pk/software/localization/keyboards/CLEphonetickbv1.2.html
 * https://help.keyman.com/keyboard/urdu_phonetic_crulp/1.2.2/urdu_phonetic_crulp
 *
 * The Base face is shared by the CRULP/CLE versions used here. The Shift
 * face follows CLE v1.2 where it differs, while the extended AltGr face
 * remains the CRULP v1.1 reference layer. The same data drives physical
 * input, virtual-key labels and expected-key/finger guidance.
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
  // CRULP Urdu Phonetic v1.2 Shift face (CLE, Oct 2019).
  "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
  "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
  "-": "_", "=": "+",

  q: "ْ", w: "ّ", e: "ٰ", r: "ڑ", t: "ٹ",
  y: "َ", u: "ئ", i: "ِ", o: "ۃ", p: "ُ",
  "[": "}", "]": "{", "\\": "|",

  a: "آ", s: "ص", d: "ڈ",
  g: "غ", h: "ھ", j: "ض", k: "خ", l: "لؕ",
  ";": ":", "'": '"',

  z: "ذ", x: "ژ", c: "ث", v: "ظ", b: "ݨ",
  n: "ں", m: "٘", ",": "ٌ", ".": "٫", "/": "؟",
};

/**
 * Extended AltGr (Right Alt / Ctrl+Alt), from the CRULP v1.1 AltGr
 * face. CRULP v1.2 changes the Shift face while retaining the
 * v1.1 extended layer.
 */
export const altGrPhoneticMap: Record<string, string> = {
  // Number/symbol row
  "1": "!", "2": "@", "3": "#", "5": "٪", "7": "&", "8": "*", "9": ")", "0": "(",
  // QWERTY row — CRULP v1.1 AltGr
  q: "ٓ", w: "؂", e: "ٖ", r: "ؓ", t: "ؔ", y: "؁", u: "ٔ", i: "ؑ", o: "ٕ", p: "ٗ",
  // Home row
  a: "ﷲ", s: "ؐ", d: "ﷺ", g: "ٛ", h: "ؒ", j: "ﷻ",
  // Bottom row
  z: "؏", x: "؎", c: "؃", v: "ؕ", b: "﷽", n: "؀",
  ",": ">", ".": "<",
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
  return shift ? (Object.prototype.hasOwnProperty.call(shiftPhoneticMap, key) ? shiftPhoneticMap[key] : undefined) : phoneticMap[key];
}

export function getUrduForKey(key: string): string | undefined {
  const lower = key.toLowerCase();
  const isShifted = key !== lower && key.length === 1;
  if (isShifted) {
    return Object.prototype.hasOwnProperty.call(shiftPhoneticMap, lower)
      ? shiftPhoneticMap[lower]
      : undefined;
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
