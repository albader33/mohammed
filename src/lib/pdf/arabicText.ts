import ArabicReshaper from "arabic-reshaper";
import type { PDFFont } from "pdf-lib";

const ARABIC_RE =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function containsArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

/**
 * pdf-lib does no Arabic glyph shaping, so letters are pre-joined into
 * presentation forms here. For ordering: PDF viewers (Chrome/PDFium
 * included) detect an RTL-script run and reverse the whole glyph run
 * themselves when displaying it, expecting logical order as input.
 * To end up correct after that automatic reversal, only the non-Arabic
 * sub-runs (Latin words, numbers) are pre-reversed here — the viewer's
 * reversal then restores those to natural reading order while carrying
 * the (already-correct) Arabic letters along as-is.
 */
function reshapeAndReorder(text: string): string {
  const shaped = ArabicReshaper.convertArabic(text);
  const chars = Array.from(shaped);
  const isArabic = (ch: string) => ARABIC_RE.test(ch);
  const result: string[] = [];
  let i = 0;
  while (i < chars.length) {
    if (!isArabic(chars[i])) {
      let j = i;
      while (j < chars.length && !isArabic(chars[j])) j++;
      result.push(...chars.slice(i, j).reverse());
      i = j;
    } else {
      result.push(chars[i]);
      i++;
    }
  }
  return result.join("");
}

export interface LaidOutLine {
  /** Ready to pass straight to page.drawText(). */
  text: string;
  width: number;
  isRtl: boolean;
}

/** Word-wraps text (Arabic-aware) to fit maxWidth, returning drawable lines. */
export function layoutParagraph(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): LaidOutLine[] {
  const lines: LaidOutLine[] = [];
  const paragraphs = text.split("\n");

  const toDrawable = (logical: string) => {
    const isRtl = containsArabic(logical);
    const drawable = isRtl ? reshapeAndReorder(logical) : logical;
    return { drawable, isRtl };
  };

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push({ text: "", width: 0, isRtl: false });
      continue;
    }

    let current: string[] = [];
    const flush = () => {
      if (current.length === 0) return;
      const { drawable, isRtl } = toDrawable(current.join(" "));
      lines.push({
        text: drawable,
        width: font.widthOfTextAtSize(drawable, fontSize),
        isRtl,
      });
      current = [];
    };

    for (const word of words) {
      const candidate = [...current, word];
      const { drawable } = toDrawable(candidate.join(" "));
      const width = font.widthOfTextAtSize(drawable, fontSize);
      if (width > maxWidth && current.length > 0) {
        flush();
        current = [word];
      } else {
        current = candidate;
      }
    }
    flush();
  }

  return lines;
}
