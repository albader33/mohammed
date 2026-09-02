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
