let workerConfigured = false;

async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }
  return pdfjsLib;
}

export async function loadPdfDocument(data: ArrayBuffer) {
  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  return { doc, destroy: () => loadingTask.destroy() };
}

/** Renders a single page of a PDF to a PNG data URL, scaled to fit within maxWidth. */
export async function renderPageThumbnail(
  data: ArrayBuffer,
  pageNumber: number,
  maxWidth = 240
): Promise<string> {
  const { doc, destroy } = await loadPdfDocument(data);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(scaledViewport.width);
  canvas.height = Math.ceil(scaledViewport.height);
  const context = canvas.getContext("2d")!;

  await page.render({ canvas, canvasContext: context, viewport: scaledViewport })
    .promise;

  const url = canvas.toDataURL("image/png");
  await destroy();
  return url;
}

/** Renders a single page of a PDF onto a canvas, scaled to fit within maxWidth. */
export async function renderPageToCanvas(
  data: ArrayBuffer,
  pageNumber: number,
  maxWidth = 900
): Promise<HTMLCanvasElement> {
  const { doc, destroy } = await loadPdfDocument(data);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(scaledViewport.width);
  canvas.height = Math.ceil(scaledViewport.height);
  const context = canvas.getContext("2d")!;

  await page.render({ canvas, canvasContext: context, viewport: scaledViewport })
    .promise;

  await destroy();
  return canvas;
}

/** Renders every page of a PDF to a PNG blob at the given scale. */
export async function renderAllPagesToBlobs(
  data: ArrayBuffer,
  scale = 2,
  onProgress?: (done: number, total: number) => void
): Promise<Blob[]> {
  const { doc, destroy } = await loadPdfDocument(data);
  const total = doc.numPages;
  const blobs: Blob[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/png")
    );
    blobs.push(blob);
    onProgress?.(i, total);
  }

  await destroy();
  return blobs;
}

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const { doc, destroy } = await loadPdfDocument(data);
  const count = doc.numPages;
  await destroy();
  return count;
}

export interface PageTextBlock {
  text: string;
  xPct: number; // left edge, 0..1 of page width
  yPct: number; // top edge, 0..1 of page height
  widthPct: number;
  heightPct: number;
  fontSize: number; // pt, so a moved copy of this run can reuse it
}

/**
 * Locates each run of text on a page so it can be selected and removed
 * precisely (its own tight box) instead of a hand-drawn, likely
 * oversized rectangle. transform[4]/[5] is the run's baseline-left
 * origin and `height` its font size (both in PDF points) — an
 * ascent/descent split of 0.8/0.2 approximates the run's full glyph
 * height above and below that baseline, close enough for selection.
 *
 * PDF text is often broken into several short runs on the very same
 * line (a font change, a bidi boundary, ...), which would otherwise
 * make a whole visual line take several clicks to fully select — so
 * consecutive runs sharing a baseline with only a small gap between
 * them (ordinary letter/word spacing) are merged into one block, in
 * their original content-stream order so RTL reads correctly.
 */
export async function getPageTextBlocks(
  data: ArrayBuffer,
  pageNumber: number
): Promise<PageTextBlock[]> {
  const { doc, destroy } = await loadPdfDocument(data);
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const { width: pageWidth, height: pageHeight } = viewport;

  interface Run {
    text: string;
    left: number;
    right: number;
    baseline: number;
    height: number;
  }

  const runs: Run[] = [];
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim() || !item.width || !item.height) continue;
    const [, , , , x, baseline] = item.transform;
    runs.push({ text: item.str, left: x, right: x + item.width, baseline, height: item.height });
  }

  const groups: Run[][] = [];
  for (const run of runs) {
    const prev = groups.at(-1)?.at(-1);
    const gap = prev
      ? Math.max(0, run.left - prev.right, prev.left - run.right)
      : Infinity;
    if (prev && Math.abs(run.baseline - prev.baseline) < 0.5 && gap < prev.height * 1.5) {
      groups.at(-1)!.push(run);
    } else {
      groups.push([run]);
    }
  }

  const blocks: PageTextBlock[] = groups.map((group) => {
    const left = Math.min(...group.map((r) => r.left));
    const right = Math.max(...group.map((r) => r.right));
    const baseline = group[0].baseline;
    const height = Math.max(...group.map((r) => r.height));
    const top = baseline + height * 0.8;
    const bottom = baseline - height * 0.2;
    return {
      text: group.map((r) => r.text).join(""),
      xPct: left / pageWidth,
      yPct: (pageHeight - top) / pageHeight,
      widthPct: (right - left) / pageWidth,
      heightPct: (top - bottom) / pageHeight,
      fontSize: height,
    };
  });

  await destroy();
  return blocks;
}
