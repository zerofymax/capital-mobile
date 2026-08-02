import type { CsvDelimiter, CsvParseResult } from './data-transfer-types';

const delimiterCandidates: CsvDelimiter[] = [',', ';', '\t'];

export function stripUtf8Bom(text: string) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function normalizeCsvHeader(header: string) {
  return header.replace(/\u200f|\u200e/g, '').trim().replace(/\s+/g, ' ');
}

export function detectCsvDelimiter(text: string): CsvDelimiter {
  const sample = stripUtf8Bom(text).split(/\r\n|\n|\r/).slice(0, 8).join('\n');
  const scores = delimiterCandidates.map((delimiter) => {
    const rows = parseRows(sample, delimiter).filter((row) => row.some((cell) => cell.trim().length > 0));
    const lengths = rows.map((row) => row.length).filter((length) => length > 1);
    const consistency = lengths.length > 0 ? mostFrequent(lengths) * 2 : 0;
    const totalColumns = lengths.reduce((sum, length) => sum + length, 0);

    return { delimiter, score: consistency + totalColumns };
  });

  return scores.sort((first, second) => second.score - first.score)[0]?.delimiter ?? ',';
}

export function parseCsvText(text: string): CsvParseResult {
  const cleanText = stripUtf8Bom(text).trim();
  const delimiter = detectCsvDelimiter(cleanText);
  const parsedRows = parseRows(cleanText, delimiter).filter((row) => row.some((cell) => cell.trim().length > 0));
  const errors = [];

  if (parsedRows.length === 0) {
    return { headers: [], rows: [], delimiter, errors: [{ rowNumber: 1, message: 'ملف CSV فارغ' }] };
  }

  const headers = parsedRows[0]!.map(normalizeCsvHeader);

  if (headers.length === 0 || headers.every((header) => header.length === 0)) {
    errors.push({ rowNumber: 1, message: 'صف العناوين غير صالح' });
  }

  const rows = parsedRows.slice(1).map((row, rowIndex) => {
    const rawRow: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      if (!header) {
        return;
      }

      rawRow[header] = (row[columnIndex] ?? '').trim();
    });

    if (row.length > headers.length) {
      errors.push({ rowNumber: rowIndex + 2, message: 'يحتوي الصف على أعمدة أكثر من العناوين' });
    }

    return rawRow;
  });

  return { headers, rows, delimiter, errors };
}

function parseRows(text: string, delimiter: CsvDelimiter) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows;
}

function mostFrequent(values: number[]) {
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  return Math.max(0, ...Array.from(counts.values()));
}
