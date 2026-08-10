import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HorizontalFilterChips } from '@/components/financial';
import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import {
  getTabScreenContentBottomPadding,
  tabScreenContentInsetAdjustmentBehavior,
} from '@/components/navigation/navigation-metrics';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import { InvoiceCard, InvoiceMetric, InvoiceProgressBar, NoticeBanner } from './components';
import { clearInvoicesNotice, useInvoicesStore } from './invoices-store';
import {
  getInvoiceCollectionSummary,
  getInvoiceSummary,
  getRoundedCollectionRate,
} from './invoice-utils';
import type { InvoiceStatusId } from './invoices-data';

type InvoiceFilter = 'all' | 'awaiting-payment' | 'due-soon' | 'overdue' | 'partially-paid' | 'paid';

const filters: { id: InvoiceFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'paid', label: 'مدفوعة' },
  { id: 'partially-paid', label: 'مدفوعة جزئيًا' },
  { id: 'overdue', label: 'متأخرة' },
  { id: 'due-soon', label: 'مستحقة قريبًا' },
  { id: 'awaiting-payment', label: 'بانتظار الدفع' },
];

export function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const { invoices, notice } = useInvoicesStore();
  const exportNavigationLockedRef = useRef(false);
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [query, setQuery] = useState('');
  const summaries = useMemo(() => invoices.map(getInvoiceSummary), [invoices]);
  const collectionSummary = useMemo(() => getInvoiceCollectionSummary(invoices), [invoices]);
  const total = collectionSummary.totalAmount;
  const collected = collectionSummary.collectedAmount;
  const remaining = collectionSummary.remainingAmount;
  const progress = getRoundedCollectionRate(collectionSummary.collectionRate) ?? 0;
  const openInvoices = summaries.filter((invoice) => invoice.open);
  const paidInvoices = summaries.filter((invoice) => invoice.paidInFull);
  const visibleOpen = openInvoices.filter((invoice) => matchesSearch(invoice.clientName, invoice.invoiceNumber, query) && matchesFilter(invoice.status, filter));
  const visiblePaid = filter === 'all' || filter === 'paid' ? paidInvoices.filter((invoice) => matchesSearch(invoice.clientName, invoice.invoiceNumber, query)) : [];
  const overdueCount = collectionSummary.overdueCount;
  const dueSoonCount = collectionSummary.dueSoonCount;

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(clearInvoicesNotice, 2600);

    return () => clearTimeout(timeout);
  }, [notice]);

  function openDetails(id: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.invoiceDetails, params: { id } });
  }

  function handleExportInvoices() {
    if (exportNavigationLockedRef.current) {
      return;
    }

    exportNavigationLockedRef.current = true;
    Haptics.selectionAsync().catch(() => null);
    router.push(routes.exportInvoices);
    setTimeout(() => {
      exportNavigationLockedRef.current = false;
    }, 650);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: getTabScreenContentBottomPadding(insets.bottom),
              paddingTop: Math.max(spacing.sm, 48 - insets.top),
            },
          ]}
          contentInsetAdjustmentBehavior={tabScreenContentInsetAdjustmentBehavior}
          showsVerticalScrollIndicator={false}
        >
        <InvoicesHeader onBack={() => router.back()} onExport={handleExportInvoices} />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SummaryCard collected={collected} dueSoonCount={dueSoonCount} openCount={openInvoices.length} overdueCount={overdueCount} progress={progress} remaining={remaining} total={total} />

        <View style={styles.searchBox}>
          <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
          <TextInput
            accessibilityLabel="بحث الفواتير"
            onChangeText={setQuery}
            placeholder="ابحث باسم العميل أو رقم الفاتورة"
            placeholderTextColor={colors.text.tertiary}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <HorizontalFilterChips items={filters} selectedValue={filter} onChange={setFilter} />

        {visibleOpen.length ? (
          <View style={styles.section}>
            <SectionHeading title="الفواتير المفتوحة" />
            <View style={styles.invoiceList}>
              {visibleOpen.map((invoice) => (
                <InvoiceCard invoice={invoice} key={invoice.id} layoutVariant="invoicesListRtl" onPress={openDetails} />
              ))}
            </View>
          </View>
        ) : null}

        {visiblePaid.length ? (
          <View style={styles.section}>
            <SectionHeading title="الفواتير المدفوعة" />
            <View style={styles.invoiceList}>
              {visiblePaid.map((invoice) => (
                <InvoiceCard invoice={invoice} key={invoice.id} layoutVariant="invoicesListRtl" onPress={openDetails} />
              ))}
            </View>
          </View>
        ) : null}

        <InsightCard />

        <AppButton iconName="add-outline" onPress={() => router.push(routes.addInvoice)}>
          إضافة فاتورة
        </AppButton>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InvoicesHeader({ onBack, onExport }: { onBack: () => void; onExport: () => void }) {
  const backAction = (
    <CapitalGlassIconButton
      accessibilityLabel="رجوع"
      hitSlop={8}
      iconColor={colors.text.muted}
      iconName="chevron-back-outline"
      iconSize={21}
      onPress={onBack}
      pressedStyle={styles.pressed}
      radius={radii.control}
      style={styles.headerAction}
    />
  );
  const headerCopy = (
    <View style={[styles.headerCopy, Platform.OS !== 'web' && styles.androidHeaderCopy]}>
      <AppText align="right" style={styles.headerTitle} variant="screenTitle">
        الفواتير المستحقة
      </AppText>
      <AppText align="right" style={styles.headerSubtitle} tone="secondary" variant="supporting">
        تابع الفواتير ومواعيد التحصيل
      </AppText>
    </View>
  );
  const exportAction = (
    <CapitalGlassIconButton
      accessibilityLabel="تصدير الفواتير"
      hitSlop={8}
      iconColor={colors.text.muted}
      iconName="share-outline"
      iconSize={20}
      onPress={onExport}
      pressedStyle={styles.pressed}
      radius={radii.control}
      style={styles.headerAction}
    />
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.header, styles.androidHeader]}>
        <View style={styles.androidHeaderActions}>
          {backAction}
          {exportAction}
        </View>
        {headerCopy}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {backAction}
      {headerCopy}
      {exportAction}
    </View>
  );
}

function SummaryCard({
  total,
  collected,
  remaining,
  openCount,
  overdueCount,
  dueSoonCount,
  progress,
}: {
  total: number;
  collected: number;
  remaining: number;
  openCount: number;
  overdueCount: number;
  dueSoonCount: number;
  progress: number;
}) {
  const summaryTitle = (
    <View style={styles.summaryTitleSlot}>
      <AppText style={styles.summaryTitle} variant="sectionTitle">
        ملخص الفواتير
      </AppText>
    </View>
  );
  const alertBadge = (
    <View style={styles.alertBadge}>
      <AppText style={styles.alertBadgeText} variant="caption">
        {overdueCount} متأخرة
      </AppText>
    </View>
  );
  const progressLabel = (
    <AppText style={Platform.OS !== 'web' ? styles.progressLabel : undefined} tone="secondary" variant="caption">
      نسبة التحصيل
    </AppText>
  );
  const progressValue = (
    <AppText style={[styles.progressValue, Platform.OS !== 'web' && styles.progressValueAndroid]} variant="caption">
      {progress}%
    </AppText>
  );

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={[styles.summaryHeader, Platform.OS !== 'web' && styles.summaryHeaderAndroid]}>
        {Platform.OS !== 'web' ? alertBadge : summaryTitle}
        {Platform.OS !== 'web' ? summaryTitle : alertBadge}
      </View>
      <View style={styles.summaryMain}>
        <InvoiceMetric label="إجمالي المستحق" value={total} />
        <InvoiceMetric label="المحصّل" tone="green" value={collected} />
        <InvoiceMetric label="المتبقي للتحصيل" tone="amber" value={remaining} />
      </View>
      <View style={styles.summaryCounts}>
        <CountMetric label="فواتير مفتوحة" value={openCount} />
        <CountMetric label="متأخرة" tone="danger" value={overdueCount} />
        <CountMetric label="مستحقة قريبًا" tone="amber" value={dueSoonCount} />
      </View>
      <View style={[styles.progressRow, Platform.OS !== 'web' && styles.progressRowAndroid]}>
        {Platform.OS !== 'web' ? progressValue : progressLabel}
        {Platform.OS !== 'web' ? progressLabel : progressValue}
      </View>
      <InvoiceProgressBar progress={progress} startFromLeftOnAndroid tone="green" />
      <AppText align="center" variant="supporting">
        {directionSafeText(`تم تحصيل ${progress}% من قيمة الفواتير الحالية`)}
      </AppText>
    </SolidCard>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleWrapper}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">
        {title}
      </AppText>
    </View>
  );
}

function CountMetric({ label, value, tone }: { label: string; value: number; tone?: 'danger' | 'amber' }) {
  return (
    <View style={styles.countMetric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={[styles.countValue, tone === 'danger' && styles.dangerText, tone === 'amber' && styles.amberText]} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function InsightCard() {
  return (
    <SolidCard style={styles.insightCard}>
      <View style={styles.insightLayout}>
        <Ionicons color="#9DD5FF" name="sparkles-outline" size={17} />
        <View style={styles.insightCopy}>
          <AppText style={styles.linkText} variant="cardTitle">
            تحصيل الفواتير
          </AppText>
          <AppText style={styles.insightText} variant="body">
            لديك فاتورة متأخرة بقيمة 6,500 ر.س وفاتورتان مستحقتان خلال الأسبوع القادم.
          </AppText>
          <AppText style={styles.insightCaption} tone="secondary" variant="caption">
            تقدير تجريبي
          </AppText>
        </View>
      </View>
    </SolidCard>
  );
}

function matchesSearch(clientName: string, invoiceNumber: string, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return clientName.toLowerCase().includes(normalized) || invoiceNumber.toLowerCase().includes(normalized);
}

function matchesFilter(status: InvoiceStatusId, filter: InvoiceFilter) {
  if (filter === 'all') {
    return true;
  }

  return status === filter;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  androidHeader: {
    direction: 'ltr',
    width: '100%',
  },
  androidHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
  },
  headerAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  androidHeaderCopy: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 25,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryHeaderAndroid: {
    direction: 'ltr',
    width: '100%',
  },
  summaryTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  summaryTitleSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  alertBadge: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  alertBadgeText: {
    color: colors.semantic.danger,
    fontSize: 11,
    lineHeight: 16,
  },
  summaryMain: {
    flexDirection: 'row-reverse',
  },
  summaryCounts: {
    flexDirection: 'row-reverse',
  },
  countMetric: {
    alignItems: 'center',
    borderLeftColor: colors.surface.separator,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: spacing.xs,
  },
  countValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    writingDirection: 'ltr',
  },
  dangerText: {
    color: colors.semantic.danger,
  },
  amberText: {
    color: '#F3B744',
  },
  progressRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  progressRowAndroid: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  progressLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  progressValue: {
    color: '#35D39A',
  },
  progressValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invoiceList: {
    gap: spacing.md,
    ...Platform.select({ android: { alignSelf: 'stretch', width: '100%' } }),
  },
  insightCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.22)',
  },
  insightLayout: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  insightCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  insightCaption: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  linkText: {
    alignSelf: 'stretch',
    color: '#9DD5FF',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  insightText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
