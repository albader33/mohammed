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
}

/**
 * Locates each run of text on a page so it can be selected and removed
 * precisely (its own tight box) instead of a hand-drawn, likely
 * oversized rectangle. transform[4]/[5] is the run's baseline-left
 * origin and `height` its font size (both in PDF points) — an
 * ascent/descent split of 0.8/0.2 approximates the run's full glyph
 * height above and below that baseline, close enough for selection.
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

  const blocks: PageTextBlock[] = [];
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim() || !item.width || !item.height) continue;
    const [, , , , x, baseline] = item.transform;
    const top = baseline + item.height * 0.8;
    const bottom = baseline - item.height * 0.2;
    blocks.push({
      text: item.str,
      xPct: x / pageWidth,
      yPct: (pageHeight - top) / pageHeight,
      widthPct: item.width / pageWidth,
      heightPct: (top - bottom) / pageHeight,
    });
  }

  await destroy();
  return blocks;
}
