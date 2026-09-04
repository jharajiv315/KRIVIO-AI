/**
 * CSV Safety & RFC-4180 Serialization Utilities
 * Features:
 * - Spreadsheet Formula Injection (CSV Injection) Mitigation
 * - RFC-4180 Escaping (quotes, multiline, commas)
 * - UTF-8 Byte Order Mark (BOM) for seamless Windows Excel Unicode rendering
 */

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitizes a cell value to prevent spreadsheet formula injection.
 * If a value starts with =, +, -, @, or whitespace command triggers,
 * it is prefixed with a single quote (') so Excel/Sheets treats it as literal text.
 */
export function sanitizeCellForCsv(value: any): string {
  if (value === null || value === undefined) return '';

  let str = String(value);

  // Check for formula injection
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    str = `'${str}`;
  }

  // RFC-4180 Escaping:
  // If string contains commas, quotes, or newlines, wrap in quotes and escape existing quotes with double-quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Serializes an array of headers and rows into an RFC-4180 compliant CSV string with UTF-8 BOM
 */
export function serializeToCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const BOM = '\uFEFF'; // UTF-8 Byte Order Mark for Excel
  const headerLine = headers.map(sanitizeCellForCsv).join(',');

  const bodyLines = rows.map((row) =>
    row.map(sanitizeCellForCsv).join(',')
  );

  return BOM + [headerLine, ...bodyLines].join('\r\n');
}
