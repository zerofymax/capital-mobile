import { getCategories } from '@/state/categories-state';

import type {
  CsvColumnMapping,
  CsvDateFormat,
  CsvRawRow,
  ImportedTransactionDraft,
  ImportedTransactionType,
  ImportSummary,
  ValidatedImportRow,
} from './data-transfer-types';
import { createDuplicateKey, detectDuplicateRows } from './duplicate-detection';

const headerHints: Record<keyof CsvColumnMapping, string[]> = {
  date: ['date', 'transaction_date', 'transaction date', 'تاريخ', 'تاريخ العملية'],
  description: ['description', 'details', 'memo', 'narrative', 'البيان', 'الوصف', 'التفاصيل'],
  amount: ['amount', 'value', 'مبلغ', 'المبلغ', 'القيمة'],
  type: ['type', 'transaction_type', 'debit_credit', 'نوع', 'نوع العملية'],
  category: ['category', 'classification', 'التصنيف', 'الفئة'],
  reference: ['reference', 'ref', 'transaction_id', 'رقم مرجعي', 'المرجع'],
  notes: ['notes', 'note', 'ملاحظات', 'ملاحظة'],
  party: ['party', 'vendor', 'customer', 'merchant', 'المورد', 'العميل', 'الطرف'],
  account: ['account', 'wallet', 'bank account', 'الحساب', 'المحفظة'],
};

export function suggestCsvColumnMapping(headers: readonly string[]): CsvColumnMapping {
  const normalized = headers.map((header) => ({ original: header, normalized: normalizeForMatching(header) }));
  const mapping: CsvColumnMapping = {};
  const usedHeaders = new Set<string>();

  (Object.keys(headerHints) as (keyof CsvColumnMapping)[]).forEach((field) => {
    const match = normalized.find(
      (header) => !usedHeaders.has(header.original) && headerHints[field].some((hint) => header.normalized === normalizeForMatching(hint)),
    );

    if (match) {
      mapping[field] = match.original;
      usedHeaders.add(match.original);
    }
  });

  return mapping;
}

export function parseImportedMoneyValue(value: string) {
  const normalized = value
    .replace(/ر\.?س|SAR|ريال|ريال سعودي/gi, '')
    .replace(/\s+/g, '')
    .replace(/،/g, ',')
    .replace(/,/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function validateImportedTransactions(
  rows: readonly CsvRawRow[],
  mapping: CsvColumnMapping,
  useAmountSign: boolean,
  existingRows: readonly ImportedTransactionDraft[],
): { validatedRows: ValidatedImportRow[]; summary: ImportSummary } {
  const seenKeys = new Set(existingRows.map(createDuplicateKey));
  const detectedDateFormat = detectDateFormat(rows.map((row) => readCell(row, mapping.date)));
  const validatedRows = rows.map((row, index) => validateRow(row, index + 2, mapping, useAmountSign, detectedDateFormat));
  const withDuplicates = detectDuplicateRows(validatedRows, seenKeys);
  const summary: ImportSummary = {
    totalRows: rows.length,
    validRows: withDuplicates.filter((row) => row.status === 'valid').length,
    duplicateRows: withDuplicates.filter((row) => row.status === 'duplicate').length,
    errorRows: withDuplicates.filter((row) => row.status === 'error').length,
    detectedDateFormat,
  };

  return { validatedRows: withDuplicates, summary };
}

function validateRow(
  row: CsvRawRow,
  rowNumber: number,
  mapping: CsvColumnMapping,
  useAmountSign: boolean,
  dateFormat: CsvDateFormat,
): ValidatedImportRow {
  const errors: string[] = [];
  const rawDate = readCell(row, mapping.date);
  const rawDescription = readCell(row, mapping.description);
  const rawAmount = readCell(row, mapping.amount);
  const amount = parseImportedMoneyValue(rawAmount);
  const normalizedDate = normalizeDateValue(rawDate, dateFormat);
  const type = resolveTransactionType(readCell(row, mapping.type), amount, useAmountSign);

  if (!normalizedDate) {
    errors.push('تاريخ غير صالح');
  }

  if (!rawDescription.trim()) {
    errors.push('الوصف مطلوب');
  }

  if (amount === null || amount === 0) {
    errors.push('المبلغ يجب أن يكون رقمًا أكبر من صفر');
  }

  if (!type) {
    errors.push('نوع العملية غير معروف');
  }

  const category = matchCategory(readCell(row, mapping.category), type ?? 'expense');

  if (errors.length > 0 || amount === null || !normalizedDate || !type) {
    return { rowNumber, status: 'error', errors };
  }

  const draft: ImportedTransactionDraft = {
    rowNumber,
    date: normalizedDate,
    description: rawDescription.trim(),
    amount: Math.abs(amount),
    type,
    category,
    reference: readCell(row, mapping.reference),
    notes: readCell(row, mapping.notes),
    party: readCell(row, mapping.party),
    account: readCell(row, mapping.account),
  };

  return { rowNumber, status: 'valid', draft, errors: [] };
}

function readCell(row: CsvRawRow, header?: string) {
  return header ? (row[header] ?? '').trim() : '';
}

function resolveTransactionType(rawType: string, amount: number | null, useAmountSign: boolean): ImportedTransactionType | null {
  if (useAmountSign && amount !== null) {
    return amount < 0 ? 'expense' : 'income';
  }

  const normalizedType = normalizeForMatching(rawType);
  const incomeValues = ['income', 'credit', 'deposit', 'دخل', 'إيراد', 'ايراد', 'إيداع', 'ايداع'];
  const expenseValues = ['expense', 'debit', 'withdrawal', 'مصروف', 'سحب'];

  if (incomeValues.some((value) => normalizedType === normalizeForMatching(value))) {
    return 'income';
  }

  if (expenseValues.some((value) => normalizedType === normalizeForMatching(value))) {
    return 'expense';
  }

  return null;
}

function matchCategory(rawCategory: string, type: ImportedTransactionType) {
  const normalizedCategory = normalizeForMatching(rawCategory);
  const matchingCategory = getCategories().find(
    (category) => category.type === type && normalizeForMatching(category.name) === normalizedCategory,
  );

  if (matchingCategory) {
    return matchingCategory.name;
  }

  return rawCategory.trim() || (type === 'income' ? 'إيرادات أخرى' : 'مصروفات أخرى');
}

function normalizeDateValue(value: string, format: CsvDateFormat) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const separatorMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (!separatorMatch || format === 'ambiguous') {
    return null;
  }

  const first = Number(separatorMatch[1]);
  const second = Number(separatorMatch[2]);
  const year = Number(separatorMatch[3]);
  const day = format === 'dd/mm/yyyy' || format === 'dd-mm-yyyy' ? first : second;
  const month = format === 'dd/mm/yyyy' || format === 'dd-mm-yyyy' ? second : first;

  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function detectDateFormat(values: readonly string[]): CsvDateFormat {
  const nonEmptyValues = values.map((value) => value.trim()).filter(Boolean);

  if (nonEmptyValues.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))) {
    return 'yyyy-mm-dd';
  }

  const separatorValue = nonEmptyValues.find((value) => /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.test(value));

  if (!separatorValue) {
    return 'ambiguous';
  }

  const parts = separatorValue.split(/[/-]/).map(Number);
  const first = parts[0] ?? 0;
  const second = parts[1] ?? 0;

  if (first > 12 && second <= 12) {
    return separatorValue.includes('/') ? 'dd/mm/yyyy' : 'dd-mm-yyyy';
  }

  return 'ambiguous';
}

function normalizeForMatching(value: string) {
  return value
    .trim()
    .replace(/\u200f|\u200e/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ar-SA');
}
