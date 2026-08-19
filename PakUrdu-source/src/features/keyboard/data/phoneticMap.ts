/**
 * This tutorial's phonetic key → Urdu character convention.
 *
 * Every lowercase letter key maps to a base Urdu letter; the
 * Shift-variant of a key maps to that letter's closest phonetic
 * relative wherever one exists (e.g. `h` → ہ / `H` → ھ, `s` → س /
 * `S` → ش, `k` → ک / `K` → خ). This mirrors the "same sound, same
 * finger, Shift for the related sound" idea taught in the Level 0
 * lessons — it is a simplified convention for this app, not a claim
 * to reproduce any particular external keyboard standard byte-for-byte.
 *
 * Space and the two punctuation marks used in the course content
 * (، and ۔) map directly from their familiar QWERTY keys (`,` and
 * `.`) so punctuation "just works" without a separate mode.
 */

/** Lowercase-key → Urdu letter. */
export const BASE_KEY_MAP: Record<string, string> = {
  a: "ا",
  b: "ب",
  c: "چ",
  d: "د",
  e: "ی",
  f: "ف",
  g: "گ",
  h: "ہ",
  i: "ظ",
  j: "ج",
  k: "ک",
  l: "ل",
  m: "م",
  n: "ن",
  o: "و",
  p: "پ",
  q: "ق",
  r: "ر",
  s: "س",
  t: "ت",
  u: "ع",
  v: "ٹ",
  w: "ں",
  x: "ڈ",
  y: "ے",
  z: "ز",
};

/** Shift+key → Urdu letter, for keys that have a related-sound variant. */
export const SHIFT_KEY_MAP: Record<string, string> = {
  a: "آ",
  c: "ح",
  g: "غ",
  h: "ھ",
  k: "خ",
  s: "ش",
  t: "ط",
  y: "ئ",
  z: "ص",
  x: "ض",
};

/** Non-letter keys that map directly to a character. */
export const PUNCTUATION_KEY_MAP: Record<string, string> = {
  ",": "،",
  ".": "۔",
};

/**
 * Every key on the visible on-screen keyboard, row by row, in
 * physical QWERTY order. Used only for layout — the actual
 * key → character behavior comes from the maps above.
 */
export const KEYBOARD_ROWS: string[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."],
];

/**
 * Reverse lookup: Urdu character → the physical key (and whether
 * Shift is needed) that produces it. Built once from the forward
 * maps so the VirtualKeyboard can highlight "the key you need right
 * now" for any character in a target string.
 */
export interface KeyLocation {
  key: string;
  shift: boolean;
}

function buildReverseMap(): Map<string, KeyLocation> {
  const reverse = new Map<string, KeyLocation>();
  for (const [key, char] of Object.entries(BASE_KEY_MAP)) {
    reverse.set(char, { key, shift: false });
  }
  for (const [key, char] of Object.entries(SHIFT_KEY_MAP)) {
    reverse.set(char, { key, shift: true });
  }
  for (const [key, char] of Object.entries(PUNCTUATION_KEY_MAP)) {
    reverse.set(char, { key, shift: false });
  }
  reverse.set(" ", { key: " ", shift: false });
  return reverse;
}

export const URDU_TO_KEY: Map<string, KeyLocation> = buildReverseMap();

/** Resolves what character (if any) a raw physical key event produces. */
export function resolveKeyToChar(key: string, shiftKey: boolean): string | null {
  if (key === " ") return " ";
  if (key.length !== 1) return null;

  const lower = key.toLowerCase();
  if (shiftKey && lower in SHIFT_KEY_MAP) return SHIFT_KEY_MAP[lower];
  if (!shiftKey && lower in BASE_KEY_MAP) return BASE_KEY_MAP[lower];
  if (lower in PUNCTUATION_KEY_MAP) return PUNCTUATION_KEY_MAP[lower];
  // A key with no mapped Urdu output (e.g. "x", "i") is simply not
  // typeable — the caller ignores it rather than inserting nothing.
  return null;
}

/** The key/shift combination that would produce a given Urdu character. */
export function keyForChar(char: string): KeyLocation | null {
  return URDU_TO_KEY.get(char) ?? null;
}

export type Hand = "Left" | "Right";
export type Finger = "Pinky" | "Ring" | "Middle" | "Index";

export interface FingerGuide {
  hand: Hand;
  finger: Finger;
}

/** Standard touch-typing finger assignment for the physical QWERTY key. */
export const KEY_FINGER_MAP: Record<string, FingerGuide> = {
  q: { hand: "Left", finger: "Pinky" }, w: { hand: "Left", finger: "Ring" }, e: { hand: "Left", finger: "Middle" },
  r: { hand: "Left", finger: "Index" }, t: { hand: "Left", finger: "Index" },
  a: { hand: "Left", finger: "Pinky" }, s: { hand: "Left", finger: "Ring" }, d: { hand: "Left", finger: "Middle" },
  f: { hand: "Left", finger: "Index" }, g: { hand: "Left", finger: "Index" },
  z: { hand: "Left", finger: "Pinky" }, x: { hand: "Left", finger: "Ring" }, c: { hand: "Left", finger: "Middle" },
  v: { hand: "Left", finger: "Index" }, b: { hand: "Left", finger: "Index" },
  y: { hand: "Right", finger: "Index" }, u: { hand: "Right", finger: "Index" }, i: { hand: "Right", finger: "Middle" },
  o: { hand: "Right", finger: "Ring" }, p: { hand: "Right", finger: "Pinky" },
  h: { hand: "Right", finger: "Index" }, j: { hand: "Right", finger: "Index" }, k: { hand: "Right", finger: "Middle" },
  l: { hand: "Right", finger: "Ring" },
  n: { hand: "Right", finger: "Index" }, m: { hand: "Right", finger: "Index" },
  ",": { hand: "Right", finger: "Middle" }, ".": { hand: "Right", finger: "Ring" },
  " ": { hand: "Right", finger: "Pinky" },
};

export function fingerForKey(key: string): FingerGuide | null {
  return KEY_FINGER_MAP[key] ?? null;
}
