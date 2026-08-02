import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';

import type { ExportFieldId } from './export-invoices-screen';
import { formatSar, type InvoiceSummary } from './invoice-utils';

export type InvoicePdfField = {
  id: ExportFieldId;
  label: string;
};

export type InvoicePdfSummary = {
  collected: number;
  openCount: number;
  overdueCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  remaining: number;
  totalValue: number;
};

type CreateInvoicePdfOptions = {
  fields: readonly InvoicePdfField[];
  fileName?: string;
  generatedAt?: Date;
  invoices: readonly InvoiceSummary[];
  periodLabel: string;
  scopeLabel: string;
  summary: InvoicePdfSummary;
};

type InvoicePdfResult = {
  numberOfPages: number;
  uri: string;
};

export async function createInvoicePdf(options: CreateInvoicePdfOptions): Promise<InvoicePdfResult> {
  const fileName = sanitizePdfFileName(options.fileName ?? buildInvoicePdfFileName(options.generatedAt));
  const html = buildInvoicePdfHtml(options);
  const printResult = await Print.printToFileAsync({
    html,
    base64: false,
  });
  const temporaryFile = new File(printResult.uri);
  const finalFile = new File(Paths.cache, fileName);

  if (temporaryFile.uri !== finalFile.uri) {
    await temporaryFile.move(finalFile, { overwrite: true });
  }

  return {
    numberOfPages: printResult.numberOfPages,
    uri: finalFile.uri,
  };
}

export function buildInvoicePdfFileName(date = new Date()): string {
  return sanitizePdfFileName(`capital-invoices-${formatLocalDate(date)}.pdf`);
}

export function buildInvoicePdfHtml({
  fields,
  generatedAt = new Date(),
  invoices,
  periodLabel,
  scopeLabel,
  summary,
}: CreateInvoicePdfOptions) {
  const invoiceCards = invoices.map((invoice) => renderInvoiceCard(invoice, fields)).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <style>
      @page {
        size: A4;
        margin: 16mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: #ffffff;
        color: #17211e;
        direction: rtl;
        font-family: Arial, Tahoma, sans-serif;
        font-size: 12px;
        line-height: 1.7;
        margin: 0;
        text-align: right;
      }

      .report {
        width: 100%;
      }

      .report-header {
        border-bottom: 2px solid #1f5a3a;
        margin-bottom: 18px;
        padding-bottom: 14px;
      }

      .brand {
        color: #1f5a3a;
        direction: ltr;
        font-size: 19px;
        font-weight: 700;
        text-align: right;
        unicode-bidi: isolate;
      }

      h1 {
        font-size: 24px;
        margin: 4px 0 12px;
      }

      h2 {
        font-size: 17px;
        margin: 0 0 10px;
      }

      h3 {
        font-size: 14px;
        margin: 0 0 8px;
      }

      .meta-grid,
      .summary-grid {
        display: grid;
        gap: 8px 16px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .meta-item,
      .summary-item {
        border: 1px solid #dbe4e0;
        border-radius: 8px;
        padding: 8px 10px;
      }

      .label {
        color: #62716b;
        display: block;
        font-size: 10px;
        margin-bottom: 2px;
      }

      .value {
        color: #17211e;
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .summary {
        background: #f6f8f7;
        border: 1px solid #dbe4e0;
        border-radius: 10px;
        margin-bottom: 18px;
        padding: 14px;
      }

      .invoice-card {
        border: 1px solid #dbe4e0;
        border-radius: 10px;
        break-inside: auto;
        line-height: 1.5;
        margin-bottom: 12px;
        page-break-inside: auto;
        padding: 12px;
      }

      .invoice-basic-block,
      .section-start,
      .invoice-item-row,
      .payment-row,
      .notes-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .invoice-heading {
        align-items: center;
        border-bottom: 1px solid #e7eeeb;
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 6px;
      }

      .invoice-heading h2 {
        margin: 0;
      }

      .field-row,
      .detail-row {
        align-items: flex-start;
        border-bottom: 1px solid #eef2f0;
        display: flex;
        gap: 16px;
        justify-content: space-between;
        padding: 5px 0;
      }

      .field-row:last-child,
      .detail-row:last-child {
        border-bottom: 0;
      }

      .field-label {
        color: #62716b;
        flex: 0 0 34%;
      }

      .field-value {
        flex: 1;
        font-weight: 700;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .nested-section {
        background: #f8faf9;
        border: 1px solid #e3ebe7;
        border-radius: 8px;
        margin-top: 8px;
        padding: 8px;
      }

      .nested-entry {
        border-bottom: 1px solid #e3ebe7;
        break-inside: avoid;
        margin-bottom: 6px;
        page-break-inside: avoid;
        padding-bottom: 6px;
      }

      .nested-entry:last-child {
        border-bottom: 0;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .empty {
        color: #77847f;
        margin: 0;
      }

      .ltr {
        direction: ltr;
        display: inline-block;
        text-align: left;
        unicode-bidi: isolate;
      }

      .money {
        direction: ltr;
        display: inline-flex;
        align-items: baseline;
        flex-direction: row;
        gap: 4px;
        text-align: left;
        unicode-bidi: isolate;
        white-space: nowrap;
      }

      .money-number {
        direction: ltr;
        unicode-bidi: isolate;
      }

      .money-currency {
        direction: rtl;
        unicode-bidi: isolate;
      }

      .footer {
        border-top: 1px solid #dbe4e0;
        color: #62716b;
        font-size: 10px;
        margin-top: 18px;
        padding-top: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <main class="report">
      <header class="report-header">
        <div class="brand">Capital</div>
        <h1>تقرير الفواتير</h1>
        <div class="meta-grid">
          ${renderMetaItem('تاريخ إنشاء التقرير', formatArabicDate(generatedAt))}
          ${renderMetaItem('نطاق الفواتير', scopeLabel)}
          ${renderMetaItem('الفترة الزمنية', periodLabel)}
          ${renderMetaItem('عدد الفواتير المشمولة', invoices.length)}
        </div>
      </header>

      <section class="summary">
        <h2>ملخص الفواتير المحددة</h2>
        <div class="summary-grid">
          ${renderSummaryMoneyItem('إجمالي قيمة الفواتير', summary.totalValue)}
          ${renderSummaryMoneyItem('المبلغ المحصل', summary.collected)}
          ${renderSummaryMoneyItem('المتبقي للتحصيل', summary.remaining)}
          ${renderSummaryItem('عدد المدفوعة', safeNumberText(summary.paidCount))}
          ${renderSummaryItem('عدد المدفوعة جزئيًا', safeNumberText(summary.partiallyPaidCount))}
          ${renderSummaryItem('عدد غير المكتملة', safeNumberText(summary.openCount))}
          ${renderSummaryItem('عدد المتأخرة', safeNumberText(summary.overdueCount))}
        </div>
      </section>

      <section class="invoice-list">
        ${invoiceCards || '<p class="empty">لا توجد فواتير مطابقة للخيارات الحالية.</p>'}
      </section>

      <footer class="footer">تم إنشاء هذا التقرير محليًا بواسطة تطبيق Capital.</footer>
    </main>
  </body>
</html>`;
}

export function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInvoiceCard(invoice: InvoiceSummary, fields: readonly InvoicePdfField[]) {
  const includesClientName = fields.some((field) => field.id === 'clientName');
  const includesInvoiceNumber = fields.some((field) => field.id === 'invoiceNumber');
  const detailFields = fields.filter((field) => field.id !== 'clientName' && field.id !== 'invoiceNumber');
  const basicFields = detailFields.filter((field) => !isSectionField(field.id));
  const sectionFields = detailFields.filter((field) => isSectionField(field.id));
  const basicContent = basicFields.map((field) => renderInvoiceField(invoice, field)).join('');
  const sectionContent = sectionFields.map((field) => renderInvoiceField(invoice, field)).join('');
  const headingTitle = includesClientName ? invoice.clientName.trim() || 'عميل غير محدد' : !includesInvoiceNumber ? 'فاتورة' : '';

  return `<article class="invoice-card">
    <div class="invoice-basic-block">
      <div class="invoice-heading">
        ${headingTitle ? `<h2>${escapeHtml(headingTitle)}</h2>` : ''}
        ${includesInvoiceNumber ? `<span class="ltr">${escapeHtml(invoice.invoiceNumber)}</span>` : ''}
      </div>
      <div class="invoice-basic-details">
        ${basicContent}
      </div>
    </div>
    ${sectionContent}
  </article>`;
}

function renderInvoiceField(invoice: InvoiceSummary, field: InvoicePdfField) {
  switch (field.id) {
    case 'issueDate':
      return renderFieldRow(field.label, invoice.issueDate);
    case 'dueDate':
      return renderFieldRow(field.label, invoice.dueDate);
    case 'status':
      return renderFieldRow(field.label, invoice.displayStatus.label);
    case 'total':
      return renderMoneyFieldRow(field.label, invoice.total);
    case 'paid':
      return renderMoneyFieldRow(field.label, invoice.paid);
    case 'remaining':
      return renderMoneyFieldRow(field.label, invoice.remaining);
    case 'items':
      return renderInvoiceItems(invoice, field.label);
    case 'payments':
      return renderInvoicePayments(invoice, field.label);
    case 'notes':
      return renderNotes(invoice, field.label);
    case 'invoiceNumber':
    case 'clientName':
      return '';
  }
}

function renderInvoiceItems(invoice: InvoiceSummary, label: string) {
  const entries = invoice.items.map((item) => {
    const lineTotal = safeMultiply(item.quantity, item.unitPrice);
    return `<div class="nested-entry invoice-item-row">
      <h3>${escapeHtml(item.description || 'بند بدون وصف')}</h3>
      ${renderDetailRow('الكمية', safeNumberText(item.quantity), 'ltr')}
      ${renderMoneyDetailRow('سعر الوحدة', item.unitPrice)}
      ${renderMoneyDetailRow('إجمالي البند', lineTotal)}
    </div>`;
  });

  return `<section class="nested-section">
    <div class="section-start">
      <h3>${escapeHtml(label)}</h3>
      ${entries[0] ?? '<p class="empty">لا توجد بنود مسجلة.</p>'}
    </div>
    ${entries.slice(1).join('')}
  </section>`;
}

function renderInvoicePayments(invoice: InvoiceSummary, label: string) {
  const entries = invoice.payments.map(
    (payment) => `<div class="nested-entry payment-row">
      ${renderDetailRow('تاريخ الدفع', payment.date)}
      ${renderMoneyDetailRow('المبلغ', payment.amount)}
      ${payment.method ? renderDetailRow('وسيلة الدفع', payment.method) : ''}
      ${payment.reference ? renderDetailRow('المرجع', payment.reference, 'ltr') : ''}
      ${payment.note ? renderDetailRow('ملاحظة', payment.note) : ''}
    </div>`,
  );

  return `<section class="nested-section">
    <div class="section-start">
      <h3>${escapeHtml(label)}</h3>
      ${entries[0] ?? '<p class="empty">لا توجد دفعات مسجلة.</p>'}
    </div>
    ${entries.slice(1).join('')}
  </section>`;
}

function renderNotes(invoice: InvoiceSummary, label: string) {
  return `<section class="nested-section notes-section">
    <h3>${escapeHtml(label)}</h3>
    <p>${escapeHtml(invoice.notes?.trim() || 'لا توجد ملاحظات مسجلة.')}</p>
  </section>`;
}

function renderMetaItem(label: string, value: string | number) {
  return `<div class="meta-item">
    <span class="label">${escapeHtml(label)}</span>
    <span class="value">${escapeHtml(value)}</span>
  </div>`;
}

function renderSummaryItem(label: string, value: string) {
  return `<div class="summary-item">
    <span class="label">${escapeHtml(label)}</span>
    <span class="value">${escapeHtml(value)}</span>
  </div>`;
}

function renderSummaryMoneyItem(label: string, value: number) {
  return `<div class="summary-item">
    <span class="label">${escapeHtml(label)}</span>
    <span class="value">${renderMoney(value)}</span>
  </div>`;
}

function renderFieldRow(label: string, value: string | number, direction: ValueDirection = 'default') {
  return `<div class="field-row">
    <span class="field-label">${escapeHtml(label)}</span>
    <span class="field-value${getDirectionClassName(direction)}">${escapeHtml(value)}</span>
  </div>`;
}

function renderMoneyFieldRow(label: string, value: number) {
  return `<div class="field-row">
    <span class="field-label">${escapeHtml(label)}</span>
    <span class="field-value">${renderMoney(value)}</span>
  </div>`;
}

function renderDetailRow(label: string, value: string, direction: ValueDirection = 'default') {
  return `<div class="detail-row">
    <span class="field-label">${escapeHtml(label)}</span>
    <span class="field-value${getDirectionClassName(direction)}">${escapeHtml(value)}</span>
  </div>`;
}

function renderMoneyDetailRow(label: string, value: number | null) {
  return `<div class="detail-row">
    <span class="field-label">${escapeHtml(label)}</span>
    <span class="field-value">${renderMoney(value)}</span>
  </div>`;
}

function renderMoney(value: number | null) {
  const parts = getMoneyParts(value);

  if (!parts) {
    return '<span>غير متاح</span>';
  }

  return `<span class="money"><span class="money-number">${escapeHtml(parts.number)}</span><span class="money-currency">${escapeHtml(parts.currency)}</span></span>`;
}

function getMoneyParts(value: number | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  const formatted = formatSar(value).replace(/[\u2066-\u2069]/g, '').trim();
  const numberMatch = formatted.match(/[+-]?\d[\d,]*(?:\.\d+)?/);

  if (!numberMatch) {
    return null;
  }

  return {
    number: numberMatch[0],
    currency: `${formatted.slice(0, numberMatch.index)} ${formatted.slice((numberMatch.index ?? 0) + numberMatch[0].length)}`.trim(),
  };
}

function safeNumberText(value: number) {
  return Number.isFinite(value) ? value.toLocaleString('en-US') : '0';
}

function safeMultiply(left: number, right: number) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return null;
  }

  return left * right;
}

type ValueDirection = 'default' | 'ltr' | 'money';

function getDirectionClassName(direction: ValueDirection) {
  return direction === 'default' ? '' : ` ${direction}`;
}

function isSectionField(fieldId: ExportFieldId) {
  return fieldId === 'items' || fieldId === 'payments' || fieldId === 'notes';
}

function formatArabicDate(date: Date) {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();

  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(safeDate);
  } catch {
    return formatLocalDate(safeDate);
  }
}

function formatLocalDate(date: Date) {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function sanitizePdfFileName(fileName: string): string {
  const sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '-').trim();
  const safeBaseName = sanitized || `capital-invoices-${formatLocalDate(new Date())}`;

  return safeBaseName.toLowerCase().endsWith('.pdf') ? safeBaseName : `${safeBaseName}.pdf`;
}
