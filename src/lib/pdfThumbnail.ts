// Client-only — renders a PDF's first page to a PNG, entirely in the
// browser (pdfjs-dist). Used at upload time to give each brochure a real
// cover-page thumbnail instead of a generic icon.
export async function renderFirstPageToPng(file: File, maxWidth = 800): Promise<Blob> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas context.");

  await page.render({ canvas, canvasContext: context, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not generate thumbnail image."));
    }, "image/png");
  });
}
