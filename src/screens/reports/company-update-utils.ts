import { directionSafeText } from '@/utils/rtl';

import { companyUpdateSectionLabels, createInitialCompanyUpdateValues, formatUpdatePeriod } from './company-update-data';
import type {
  CompanyUpdate,
  CompanyUpdateDisplayStatus,
  CompanyUpdateFinancialSnapshot,
  CompanyUpdateFormValues,
  CompanyUpdatePeriod,
  CompanyUpdatePreviewData,
  CompanyUpdateSectionKey,
} from './company-update-types';

const ltrStart = '\u2066';
const ltrEnd = '\u2069';

export function normalizeMultilineSection(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean);
}

export function hasMeaningfulUpdateContent(values: CompanyUpdateFormValues) {
  return normalizeMultilineSection(values.achievements).length > 0 || normalizeMultilineSection(values.nextSteps).length > 0;
}

export function hasAnyUpdateContent(values: CompanyUpdateFormValues) {
  return (
    normalizeMultilineSection(values.achievements).length > 0 ||
    normalizeMultilineSection(values.challenges).length > 0 ||
    normalizeMultilineSection(values.companyNeeds).length > 0 ||
    normalizeMultilineSection(values.hiringUpdate).length > 0 ||
    normalizeMultilineSection(values.nextSteps).length > 0
  );
}

export function resolveCompanyUpdateDisplayStatus({
  dirty,
  savedUpdate,
  update,
}: {
  dirty: boolean;
  savedUpdate: CompanyUpdate | undefined;
  update: CompanyUpdate;
}): CompanyUpdateDisplayStatus {
  if (savedUpdate?.status === 'saved') {
    return dirty ? 'dirty' : 'saved';
  }

  if (dirty || hasAnyUpdateContent(update) || update.financialSnapshot !== null) {
    return 'draft';
  }

  return 'none';
}

export function getCompanyUpdateDisplayStatusLabel(status: CompanyUpdateDisplayStatus) {
  if (status === 'saved') {
    return 'محفوظ';
  }

  if (status === 'dirty') {
    return 'تغييرات غير محفوظة';
  }

  if (status === 'draft') {
    return 'مسودة غير محفوظة';
  }

  return 'لا يوجد تحديث لهذه الفترة';
}

export function createCompanyUpdateDraft(
  period: CompanyUpdatePeriod,
  financialSnapshot: CompanyUpdateFinancialSnapshot | null,
): CompanyUpdate {
  const values = createInitialCompanyUpdateValues(period.key);
  const now = 'اليوم';

  return {
    ...values,
    createdAt: now,
    financialSnapshot,
    id: `company-update-${period.key}`,
    month: period.month,
    periodKey: period.key,
    status: 'draft',
    updatedAt: now,
    year: period.year,
  };
}

export function buildExecutiveSummary(snapshot: CompanyUpdateFinancialSnapshot | null, periodLabel: string) {
  if (!snapshot) {
    return 'لا توجد بيانات مالية كافية لهذه الفترة. يمكنك كتابة التحديث يدويًا، وستظهر الأرقام تلقائيًا عند توفر البيانات.';
  }

  const parts: string[] = [];

  if (isFiniteNumber(snapshot.revenue)) {
    const growth = isFiniteNumber(snapshot.revenueGrowth) ? `، مع نمو قدره ${formatPercent(snapshot.revenueGrowth)}` : '';
    parts.push(`حققت الشركة إيرادات بقيمة ${formatSar(snapshot.revenue)} خلال ${periodLabel}${growth}.`);
  }

  if (isFiniteNumber(snapshot.mrr)) {
    parts.push(`يبلغ ${isolateLtr('MRR')} المدخل يدويًا ${formatSar(snapshot.mrr)} ضمن تحديث الشركة.`);
  }

  if (isFiniteNumber(snapshot.cash) && isFiniteNumber(snapshot.runwayMonths)) {
    parts.push(`تكفي السيولة الحالية لنحو ${formatMonths(snapshot.runwayMonths)} بالمعدل الحالي.`);
  }

  if (parts.length === 0) {
    return 'لا توجد بيانات مالية كافية لهذه الفترة. يمكنك كتابة التحديث يدويًا، وستظهر الأرقام تلقائيًا عند توفر البيانات.';
  }

  return parts.join(' ');
}

export function buildCompanyUpdatePreviewData(update: CompanyUpdate): CompanyUpdatePreviewData {
  const periodLabel = formatUpdatePeriod(update);
  const sectionKeys: readonly CompanyUpdateSectionKey[] = ['achievements', 'challenges', 'companyNeeds', 'hiringUpdate', 'nextSteps'];

  return {
    executiveSummary: buildExecutiveSummary(update.financialSnapshot, periodLabel),
    financialSnapshot: update.financialSnapshot,
    periodLabel,
    sections: sectionKeys.map((key) => ({
      key,
      title: companyUpdateSectionLabels[key],
      items: normalizeMultilineSection(update[key]),
    })),
    title: 'تحديث شركة Capital',
  };
}

export function buildCompanyUpdateShareText(update: CompanyUpdate) {
  const preview = buildCompanyUpdatePreviewData(update);
  const lines: string[] = [`تحديث شركة Capital — ${preview.periodLabel}`, '', 'ملخص تنفيذي:', preview.executiveSummary];
  const metrics = buildSnapshotMetricLines(preview.financialSnapshot);

  if (metrics.length > 0) {
    lines.push('', 'الأرقام الرئيسية:', ...metrics.map((metric) => `• ${metric}`));
  }

  preview.sections.forEach((section) => {
    if (section.items.length === 0) {
      return;
    }

    lines.push('', `${section.title}:`, ...section.items.map((item) => `• ${item}`));
  });

  return lines.map((line) => directionSafeText(line)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function buildSnapshotMetricLines(snapshot: CompanyUpdateFinancialSnapshot | null) {
  if (!snapshot) {
    return [];
  }

  return [
    metricLine('الإيرادات', formatSar(snapshot.revenue)),
    metricLine('نمو الإيرادات', formatPercent(snapshot.revenueGrowth)),
    metricLine('السيولة', formatSar(snapshot.cash)),
    metricLine('الحرق الشهري', formatSar(snapshot.monthlyBurn)),
    metricLine('مدة بقاء السيولة', formatMonths(snapshot.runwayMonths)),
    metricLine(`${isolateLtr('MRR')} — يدوي`, formatSar(snapshot.mrr)),
    metricLine(`${isolateLtr('Churn')} — يدوي`, formatPercent(snapshot.churnRate)),
    metricLine('العملاء الجدد', formatNumber(snapshot.newCustomers, 'عميل')),
    metricLine('العملاء النشطون — إدخال يدوي', formatNumber(snapshot.activeCustomers, 'عميل')),
    metricLine('عدد الموظفين', formatNumber(snapshot.employees, 'موظف')),
    snapshot.keyGoalLabel && isFiniteNumber(snapshot.keyGoalProgress)
      ? `أهم هدف: ${snapshot.keyGoalLabel} (${formatPercent(snapshot.keyGoalProgress, 0)})`
      : null,
  ].filter((line): line is string => Boolean(line));
}

export function formatSar(value: number | null) {
  if (!isFiniteNumber(value)) {
    return 'غير متاح';
  }

  return `${Math.round(value).toLocaleString('en-US')} ر.س`;
}

export function formatPercent(value: number | null, digits = 1) {
  if (!isFiniteNumber(value)) {
    return 'غير متاح';
  }

  return `${value.toFixed(digits)}%`;
}

export function formatMonths(value: number | null) {
  if (!isFiniteNumber(value)) {
    return 'غير متاح';
  }

  return `${value.toFixed(1)} شهر`;
}

export function formatNumber(value: number | null, suffix = '') {
  if (!isFiniteNumber(value)) {
    return 'غير متاح';
  }

  return `${Math.round(value).toLocaleString('en-US')}${suffix ? ` ${suffix}` : ''}`;
}

function metricLine(label: string, value: string) {
  return value === 'غير متاح' ? null : `${label}: ${value}`;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function isolateLtr(value: string) {
  return `${ltrStart}${value}${ltrEnd}`;
}
