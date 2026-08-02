import { File, Paths } from 'expo-file-system';

import { serializeCsv } from '@/screens/data-transfer/csv-serializer';
import type { CsvExportRow, CsvExportValue } from '@/screens/data-transfer/data-transfer-types';
import type { ExportFieldId } from './export-invoices-screen';
import type { InvoiceSummary } from './invoice-utils';

export type InvoiceCsvField = {
  id: ExportFieldId;
  label: string;
};

const arabicMonthIndexes: Record<string, number> = {
  يناير: 0,
  فبراير: 1,
  مارس: 2,
  أبريل: 3,
  مايو: 4,
  يونيو: 5,
  يوليو: 6,
  أغسطس: 7,
  سبتمبر: 8,
  أكتوبر: 9,
  نوفمبر: 10,
  ديسمبر: 11,
};

export function createInvoiceCsv(invoices: readonly InvoiceSummary[], fields: readonly InvoiceCsvField[]) {
  const headers = fields.map((field) => field.label);
  const rows = invoices.map((invoice) => buildInvoiceCsvRow(invoice, fields));

  return serializeCsv(rows, headers);
}

export function buildInvoiceExportFileName(date = new Date()) {
  const localDate = formatLocalDate(date);
  return sanitizeFileName(`capital-invoices-${localDate}.csv`);
}

export function writeInvoiceCsvToCache(csvContent: string, fileName: string) {
  const file = new File(Paths.cache, sanitizeFileName(fileName));
  file.create({ overwrite: true });
  file.write(csvContent, { encoding: 'utf8' });

  return file.uri;
}

export function formatInvoiceDateForCsv(value: string) {
  const normalized = normalizeDigits(value.replace('اليوم، ', '').trim());

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return isValidIsoDate(normalized) ? normalized : '';
  }

  const [dayText, monthText, yearText] = normalized.split(/\s+/);
  const monthIndex = monthText ? arabicMonthIndexes[monthText] : undefined;
  const day = Number(dayText);
  const year = Number(yearText);

  if (!Number.isInteger(day) || !Number.isInteger(year) || monthIndex === undefined) {
    return '';
  }

  const candidate = `${year.toString().padStart(4, '0')}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isValidIsoDate(candidate) ? candidate : '';
}

function buildInvoiceCsvRow(invoice: InvoiceSummary, fields: readonly InvoiceCsvField[]): CsvExportRow {
  return fields.reduce<CsvExportRow>((row, field) => {
    row[field.label] = getInvoiceCsvValue(invoice, field.id);
    return row;
  }, {});
}

function getInvoiceCsvValue(invoice: InvoiceSummary, fieldId: ExportFieldId): CsvExportValue {
  switch (fieldId) {
    case 'invoiceNumber':
      return invoice.invoiceNumber;
    case 'clientName':
      return invoice.clientName;
    case 'issueDate':
      return formatInvoiceDateForCsv(invoice.issueDate);
    case 'dueDate':
      return formatInvoiceDateForCsv(invoice.dueDate);
    case 'status':
      return invoice.displayStatus.label;
    case 'total':
      return finiteNumberOrEmpty(invoice.total);
    case 'paid':
      return finiteNumberOrEmpty(invoice.paid);
    case 'remaining':
      return finiteNumberOrEmpty(invoice.remaining);
    case 'items':
      return invoice.items
        .map((item) => `${item.description} × ${finiteNumberOrEmpty(item.quantity)} × ${finiteNumberOrEmpty(item.unitPrice)}`)
        .join(' | ');
    case 'payments':
      return invoice.payments
        .map((payment) => {
          const date = formatInvoiceDateForCsv(payment.date);
          return date ? `${date}: ${finiteNumberOrEmpty(payment.amount)}` : '';
        })
        .filter(Boolean)
        .join(' | ');
    case 'notes':
      return invoice.notes ?? '';
  }
}

function finiteNumberOrEmpty(value: number) {
  return Number.isFinite(value) ? value : '';
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[\/\\:*?"<>|]/g, '-');
}

function normalizeDigits(value: string) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const easternArabicDigits = '۰۱۲۳۴۵۶۷۸۹';

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabicDigits.indexOf(digit)));
}

function isValidIsoDate(value: string) {
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12) {
    return false;
  }

  return day >= 1 && day <= new Date(year, month, 0).getDate();
}
