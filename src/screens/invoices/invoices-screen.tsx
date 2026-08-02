import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  { id: 'awaiting-payment', label: 'بانتظار الدفع' },
  { id: 'due-soon', label: 'مستحقة قريبًا' },
  { id: 'overdue', label: 'متأخرة' },
  { id: 'partially-paid', label: 'مدفوعة جزئيًا' },
  { id: 'paid', label: 'مدفوعة' },
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

        <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((item) => (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: item.id === filter }}
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={({ pressed }) => [styles.filterChip, item.id === filter && styles.filterChipActive, pressed && styles.pressed]}
            >
              <AppText align="center" style={item.id === filter && styles.filterTextActive} variant="caption">
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        {visibleOpen.length ? (
          <View style={styles.section}>
            <AppText variant="sectionTitle">الفواتير المفتوحة</AppText>
            <View style={styles.invoiceList}>
              {visibleOpen.map((invoice) => (
                <InvoiceCard invoice={invoice} key={invoice.id} onPress={openDetails} />
              ))}
            </View>
          </View>
        ) : null}

        {visiblePaid.length ? (
          <View style={styles.section}>
            <AppText variant="sectionTitle">الفواتير المدفوعة</AppText>
            <View style={styles.invoiceList}>
              {visiblePaid.map((invoice) => (
                <InvoiceCard invoice={invoice} key={invoice.id} onPress={openDetails} />
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
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.headerAction}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" style={styles.headerTitle} variant="screenTitle">
          الفواتير المستحقة
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          تابع الفواتير ومواعيد التحصيل
        </AppText>
      </View>
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
  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <AppText variant="sectionTitle">ملخص الفواتير</AppText>
        <View style={styles.alertBadge}>
          <AppText style={styles.alertBadgeText} variant="caption">
            {overdueCount} متأخرة
          </AppText>
        </View>
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
      <View style={styles.progressRow}>
        <AppText tone="secondary" variant="caption">
          نسبة التحصيل
        </AppText>
        <AppText style={styles.progressValue} variant="caption">
          {progress}%
        </AppText>
      </View>
      <InvoiceProgressBar progress={progress} tone="green" />
      <AppText align="center" variant="supporting">
        {directionSafeText(`تم تحصيل ${progress}% من قيمة الفواتير الحالية`)}
      </AppText>
    </SolidCard>
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
      <View style={styles.insightHeader}>
        <Ionicons color="#9DD5FF" name="sparkles-outline" size={17} />
        <AppText style={styles.linkText} variant="cardTitle">
          تحصيل الفواتير
        </AppText>
      </View>
      <AppText variant="body">لديك فاتورة متأخرة بقيمة 6,500 ر.س وفاتورتان مستحقتان خلال الأسبوع القادم.</AppText>
      <AppText tone="secondary" variant="caption">
        تقدير تجريبي
      </AppText>
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
  headerTitle: {
    fontSize: 25,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
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
  progressValue: {
    color: '#35D39A',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
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
  filterRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: 1,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
  filterChipActive: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  section: {
    gap: spacing.md,
  },
  invoiceList: {
    gap: spacing.md,
  },
  insightCard: {
    backgroundColor: 'rgba(2,25,42,0.92)',
    borderColor: 'rgba(46,168,255,0.22)',
    gap: spacing.sm,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  linkText: {
    color: '#9DD5FF',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
