const ARABIC_RE =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function containsArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

export interface LaidOutLine {
  text: string;
  width: number;
  isRtl: boolean;
}

/**
 * Word-wraps text (Arabic-aware) to fit maxWidth, returning drawable lines.
 * Measurement and shaping both go through a Canvas 2D context: canvas
 * fillText() runs the browser's real text-shaping/bidi engine, so mixed
 * Arabic/Latin/digit runs come out correctly joined and ordered without
 * any manual glyph-reordering — ctx.font must already be set by the
 * caller to the right family/size before this runs.
 */
export function layoutParagraph(
  text: string,
  ctx: CanvasRenderingContext2D,
  maxWidth: number
): LaidOutLine[] {
  const lines: LaidOutLine[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push({ text: "", width: 0, isRtl: false });
      continue;
    }

    let current: string[] = [];
    const flush = () => {
      if (current.length === 0) return;
      const joined = current.join(" ");
      lines.push({
        text: joined,
        width: ctx.measureText(joined).width,
        isRtl: containsArabic(joined),
      });
      current = [];
    };

    for (const word of words) {
      const candidate = [...current, word].join(" ");
      const width = ctx.measureText(candidate).width;
      if (width > maxWidth && current.length > 0) {
        flush();
        current = [word];
      } else {
        current = [...current, word];
      }
    }
    flush();
  }

  return lines;
}
