/**
 * Splits text into grapheme clusters instead of raw JS string
 * indices/`text[i]`. This matters for Urdu: combining marks (e.g.
 * short-vowel diacritics) and other multi-code-point sequences must
 * stay attached to the base letter they modify, or `text[index]`
 * would slice through the middle of a single visual character.
 *
 * `Intl.Segmenter` (available in all current evergreen browsers) is
 * the correct tool for this — it understands grapheme-cluster
 * boundaries per Unicode's text segmentation rules. Where it isn't
 * available, `Array.from` is used as a fallback: it at least handles
 * surrogate-pair (astral) code points correctly via the string
 * iterator protocol, even though it won't group combining marks with
 * their base character. That fallback is intentionally conservative
 * rather than silently wrong for the common case.
 */
let segmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter !== undefined) return segmenter;
  try {
    segmenter =
      typeof Intl !== "undefined" && "Segmenter" in Intl
        ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
        : null;
  } catch {
    segmenter = null;
  }
  return segmenter;
}

export function segmentGraphemes(text: string): string[] {
  const seg = getSegmenter();
  if (seg) {
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}
