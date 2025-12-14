import Papa from "papaparse";
/**
 * Parse a CSV File into array of rows (objects).
 */
export async function parseCSVToRows(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (err: any) => reject(err),
    });
  });
}

/**
 * Convert a CSV string to rows
 */
export function parseCSVString(csv: string): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => resolve(results.data as Record<string, any>[]),
      error: (err: any) => reject(err),
    });
  });
}