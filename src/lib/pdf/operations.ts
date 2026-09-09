import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { renderPageToCanvas } from "./core";
import { layoutParagraph } from "./arabicText";

export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function baseName(name: string) {
  return name.replace(/\.pdf$/i, "");
}

/** Merge multiple PDF files (in the given order) into a single PDF. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToArrayBuffer(file);
    const src = await PDFDocument.load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export interface PageRange {
  from: number; // 1-based inclusive
  to: number; // 1-based inclusive
}

/** Split a PDF into multiple PDFs, one per given page range. */
export async function splitPdf(
  file: File,
  ranges: PageRange[]
): Promise<{ blob: Blob; name: string }[]> {
  const bytes = await fileToArrayBuffer(file);
  const src = await PDFDocument.load(bytes);
  const results: { blob: Blob; name: string }[] = [];

  for (const range of ranges) {
    const out = await PDFDocument.create();
    const indices = [];
    for (let i = range.from; i <= range.to; i++) indices.push(i - 1);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    const outBytes = await out.save();
    results.push({
      blob: new Blob([new Uint8Array(outBytes)], { type: "application/pdf" }),
      name: `${baseName(file.name)}_${range.from}-${range.to}.pdf`,
    });
  }
  return results;
}

/** Keep only the given 1-based page numbers, in that order. */
export async function extractPages(
  file: File,
  pageNumbers: number[]
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const indices = pageNumbers.map((n) => n - 1);
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const outBytes = await out.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}

/** Remove the given 1-based page numbers. */
export async function deletePages(
  file: File,
  pageNumbers: number[]
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const toDelete = new Set(pageNumbers);
  const keep = [];
  for (let i = 1; i <= total; i++) if (!toDelete.has(i)) keep.push(i);
  return extractPages(file, keep);
}

/** Reorder pages: order is an array of 1-based original page numbers in new order. */
export async function reorderPages(
  file: File,
  order: number[]
): Promise<Blob> {
  return extractPages(file, order);
}

/** Rotate specific pages (1-based) by an additional delta in degrees (multiple of 90). */
export async function rotatePages(
  file: File,
  pageNumbers: number[],
  deltaDegrees: number
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  const target = new Set(pageNumbers);
  doc.getPages().forEach((page, idx) => {
    if (target.has(idx + 1)) {
      const current = page.getRotation().angle;
      page.setRotation(degrees(current + deltaDegrees));
    }
  });
  const outBytes = await doc.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}

/** Convert a list of image files (JPG/PNG) into a single PDF, one image per page. */
export async function imagesToPdf(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToArrayBuffer(file);
    const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
    const image = isPng
      ? await out.embedPng(bytes)
      : await out.embedJpg(bytes);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  const outBytes = await out.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}

export type WatermarkPosition = "center" | "diagonal";

export async function addWatermark(
  file: File,
  text: string,
  opts: { opacity?: number; fontSize?: number; color?: [number, number, number] } = {}
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const { opacity = 0.18, fontSize = 48, color = [0.35, 0.24, 0.93] } = opts;

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(...color),
      opacity,
      rotate: degrees(45),
    });
  });

  const outBytes = await doc.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left";

export async function addPageNumbers(
  file: File,
  opts: { position?: PageNumberPosition; startAt?: number } = {}
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { position = "bottom-center", startAt = 1 } = opts;

  const pages = doc.getPages();
  pages.forEach((page, idx) => {
    const { width } = page.getSize();
    const label = String(idx + startAt);
    const fontSize = 11;
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    let x = width / 2 - textWidth / 2;
    if (position === "bottom-right") x = width - textWidth - 36;
    if (position === "bottom-left") x = 36;

    page.drawText(label, {
      x,
      y: 24,
      size: fontSize,
      font,
      color: rgb(0.2, 0.16, 0.35),
    });
  });

  const outBytes = await doc.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}

/** Basic re-serialization compression: strips unused objects and compresses object streams. */
export async function compressPdf(
  file: File
): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  const outBytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
  return { blob, originalSize: bytes.byteLength, newSize: outBytes.byteLength };
}

/** A box drawn over existing content on one page, to hide/"delete" it. */
export interface RedactEdit {
  id: string;
  type: "redact";
  page: number; // 1-based
  xPct: number; // left edge, 0..1 of page width
  yPct: number; // top edge, 0..1 of page height
  widthPct: number;
  heightPct: number;
  // Fill color, rgb 0..1. Sampled from the page background around the
  // covered text so a colored background doesn't turn white; falls
  // back to white when nothing was sampled (e.g. a hand-drawn box).
  color?: [number, number, number];
}

/** A new paragraph of text added at an arbitrary spot on one page. */
export interface TextEdit {
  id: string;
  type: "text";
  page: number; // 1-based
  xPct: number; // left edge of the text box, 0..1 of page width
  yPct: number; // top edge of the text box, 0..1 of page height
  widthPct: number; // box width, 0..1 of page width
  fontSize: number; // pt
  color: [number, number, number]; // rgb 0..1
  text: string;
}

export type PdfEdit = RedactEdit | TextEdit;

const ARABIC_FONT_URL = "/fonts/Amiri-Regular.ttf";
const ARABIC_FONT_FAMILY = "Amiri";
// A page carrying an edit is rasterized (see applyPdfEdits) at this many
// pixels per PDF point — 2x gives ~144 DPI, sharp on screen and in print
// without ballooning file size.
const REDACT_RASTER_SCALE = 2;

let arabicFontReady: Promise<void> | null = null;
function ensureArabicCanvasFont(): Promise<void> {
  if (!arabicFontReady) {
    arabicFontReady = fetch(ARABIC_FONT_URL)
      .then((res) => res.arrayBuffer())
      .then(async (bytes) => {
        const face = new FontFace(ARABIC_FONT_FAMILY, bytes);
        await face.load();
        document.fonts.add(face);
      });
  }
  return arabicFontReady;
}

function colorToCss(color: [number, number, number]): string {
  return `rgb(${color.map((c) => Math.round(c * 255)).join(",")})`;
}

/** Paints one edited page's redaction boxes and new text onto its raster canvas. */
function drawEditsOnCanvas(canvas: HTMLCanvasElement, pageEdits: PdfEdit[]) {
  const ctx = canvas.getContext("2d")!;

  for (const edit of pageEdits) {
    if (edit.type !== "redact") continue;
    ctx.fillStyle = edit.color ? colorToCss(edit.color) : "white";
    ctx.fillRect(
      edit.xPct * canvas.width,
      edit.yPct * canvas.height,
      edit.widthPct * canvas.width,
      edit.heightPct * canvas.height
    );
  }

  for (const edit of pageEdits) {
    if (edit.type !== "text" || !edit.text.trim()) continue;
    const fontSize = edit.fontSize * REDACT_RASTER_SCALE;
    ctx.font = `${fontSize}px ${ARABIC_FONT_FAMILY}`;
    ctx.fillStyle = colorToCss(edit.color);
    ctx.textBaseline = "alphabetic";

    const boxX = edit.xPct * canvas.width;
    const boxTop = edit.yPct * canvas.height;
    const boxWidth = edit.widthPct * canvas.width;
    const lineHeight = fontSize * 1.5;

    const lines = layoutParagraph(edit.text, ctx, boxWidth);
    lines.forEach((line, i) => {
      if (!line.text) return;
      // Canvas's own bidi/shaping engine handles the run correctly as
      // long as direction+alignment match the paragraph's script — no
      // manual glyph reordering needed (unlike drawing via pdf-lib).
      ctx.direction = line.isRtl ? "rtl" : "ltr";
      ctx.textAlign = line.isRtl ? "right" : "left";
      const x = line.isRtl ? boxX + boxWidth : boxX;
      ctx.fillText(line.text, x, boxTop + i * lineHeight + fontSize);
    });
  }
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("تعذر تحويل الصفحة المعدّلة إلى صورة."));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}

/**
 * Apply a set of redaction boxes and/or new text paragraphs to a PDF.
 *
 * A redaction that only drew a rectangle over the existing content stream
 * left the original text objects intact underneath it: selecting,
 * searching, or extracting the page's text still recovered whatever was
 * "deleted". So any page carrying at least one edit is fully rasterized
 * (rendered to an image with the edits painted on top) and rebuilt as an
 * image-only page — no text object, "deleted" or otherwise, survives on
 * it. Pages with no edits are copied through unchanged, keeping their
 * real, selectable text.
 */
export async function applyPdfEdits(
  file: File,
  edits: PdfEdit[]
): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const srcDoc = await PDFDocument.load(bytes);
  const srcPages = srcDoc.getPages();

  const editsByPage = new Map<number, PdfEdit[]>();
  for (const edit of edits) {
    editsByPage.set(edit.page, [...(editsByPage.get(edit.page) ?? []), edit]);
  }

  if (edits.some((e) => e.type === "text")) {
    await ensureArabicCanvasFont();
  }

  const out = await PDFDocument.create();

  for (let i = 0; i < srcPages.length; i++) {
    const pageEdits = editsByPage.get(i + 1);
    if (!pageEdits || pageEdits.length === 0) {
      const [copied] = await out.copyPages(srcDoc, [i]);
      out.addPage(copied);
      continue;
    }

    const { width, height } = srcPages[i].getSize();
    const canvas = await renderPageToCanvas(bytes.slice(0), i + 1, width * REDACT_RASTER_SCALE);
    drawEditsOnCanvas(canvas, pageEdits);

    const image = await out.embedPng(await canvasToPngBytes(canvas));
    const newPage = out.addPage([width, height]);
    newPage.drawImage(image, { x: 0, y: 0, width, height });
  }

  const outBytes = await out.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}
