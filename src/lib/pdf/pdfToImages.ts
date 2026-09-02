import JSZip from "jszip";
import { renderAllPagesToBlobs } from "./core";
import { baseName } from "./operations";

export async function pdfToImagesZip(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const blobs = await renderAllPagesToBlobs(bytes, 2, onProgress);

  const zip = new JSZip();
  const name = baseName(file.name);
  blobs.forEach((blob, idx) => {
    zip.file(`${name}_page_${String(idx + 1).padStart(2, "0")}.png`, blob);
  });

  return zip.generateAsync({ type: "blob" });
}
