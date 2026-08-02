import type { CsvExportRow, CsvExportValue } from './data-transfer-types';

const utf8Bom = '\ufeff';

export function serializeCsv(rows: readonly CsvExportRow[], preferredHeaders?: readonly string[], includeBom = true) {
  const headers = preferredHeaders?.length ? [...preferredHeaders] : collectHeaders(rows);
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(normalizeExportValue(row[header]))).join(',')),
  ];

  return `${includeBom ? utf8Bom : ''}${lines.join('\r\n')}`;
}

export function collectHeaders(rows: readonly CsvExportRow[]) {
  const headers: string[] = [];

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    });
  });

  return headers;
}

export function normalizeExportValue(value: CsvExportValue) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return value.replace(/\b(undefined|null|NaN|Infinity)\b/g, '').trim();
}

function escapeCsvCell(value: string) {
  const escaped = value.replace(/"/g, '""');

  return `"${escaped}"`;
}
