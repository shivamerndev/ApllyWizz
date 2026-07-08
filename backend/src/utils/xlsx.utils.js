import xlsx from "xlsx";

/**
 * Parses an Excel file buffer and returns raw JSON rows along with the first sheet name.
 * @param {Buffer} fileBuffer
 * @returns {{ rawRows: Array<Object>, sheetName: string }}
 */

export function parseExcelBuffer(fileBuffer) {
  let workbook;
  try {
    workbook = xlsx.read(fileBuffer, { type: "buffer" });
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel file contains no sheets.");

  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return { rawRows, sheetName };
}
