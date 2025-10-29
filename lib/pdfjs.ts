/**
 * Inspirations
 * @see https://mozilla.github.io/pdf.js/examples/
 * @see https://gist.github.com/imolorhe/f8794d3bb55e1a8065b23bcd0efeebe1
 */
export async function extractImageBlobsFromPdfFile({ file }: { file: File }) {
  const blobs: Blob[] = [];

  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  const { pdfjsLib } = globalThis as any;

  // The workerSrc property shall be specified.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "//mozilla.github.io/pdf.js/build/pdf.worker.mjs";

  const fileUrl = URL.createObjectURL(file);

  const pdfDocument = await pdfjsLib.getDocument(fileUrl).promise;

  const pagesCount = pdfDocument.numPages;

  for (let i = 1; i <= pagesCount; i++) {
    const page = await pdfDocument.getPage(i);

    const scale = 2;
    const viewport = page.getViewport({ scale: scale });

    // Prepare canvas using PDF page dimensions
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    document.body.appendChild(canvas);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png", 1);
    });

    if (blob) {
      blobs.push(blob);
    }

    document.body.removeChild(canvas);
  }

  return blobs;
}
