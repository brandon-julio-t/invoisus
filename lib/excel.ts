import * as XLSX from "xlsx";

export const parseFileWithXlsx = async ({ file }: { file: File }) => {
  const isCsv = file.type === "text/csv";

  let arrayBuffer = await file.arrayBuffer();

  if (isCsv) {
    // @see https://stackoverflow.com/a/41363077
    // Force UTF-8 BOM for CSV files
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM
    const originalData = new Uint8Array(arrayBuffer);
    const combinedData = new Uint8Array(bom.length + originalData.length);
    combinedData.set(bom);
    combinedData.set(originalData, bom.length);
    arrayBuffer = combinedData.buffer;
  }

  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,
  });

  return rawData;
};
