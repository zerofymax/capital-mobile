import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LedgerFilterChip } from '@/components/financial';
import { EmptyState, EmptyStateIcon } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  formatSubscriptionAmount,
  getSubscriptionInvoices,
  invoiceExportMessage,
  useSubscriptionState,
  type BillingInvoice,
  type SubscriptionState,
} from './subscription-data';

type InvoiceStatus = 'paid' | 'due' | 'refunded' | 'failed';
type InvoiceFilter = 'all' | InvoiceStatus;
type InvoiceTone = 'success' | 'warning' | 'muted' | 'danger';

const invoiceFilters: { id: InvoiceFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'paid', label: 'مدفوعة' },
  { id: 'due', label: 'مستحقة' },
  { id: 'refunded', label: 'مستردة' },
  { id: 'failed', label: 'فاشلة' },
];

export function BillingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const subscription = useSubscriptionState();
  const invoices = getSubscriptionInvoices(subscription);
  const [selectedFilter, setSelectedFilter] = useState<InvoiceFilter>('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>('july-2026');
  const [feedback, setFeedback] = useState<string | null>(null);

  const visibleInvoices = useMemo(() => {
    if (selectedFilter === 'all') {
      return invoices;
    }

    return invoices.filter((invoice) => invoice.status === selectedFilter);
  }, [invoices, selectedFilter]);

  function goBackToSubscription() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.currentSubscription);
  }

  function handleFilterPress(filter: InvoiceFilter) {
    Haptics.selectionAsync().catch(() => null);
    setSelectedFilter(filter);
    setExpandedInvoiceId(null);
    setFeedback(null);
  }

  function toggleInvoice(invoiceId: string) {
    Haptics.selectionAsync().catch(() => null);
    setExpandedInvoiceId((current) => (current === invoiceId ? null : invoiceId));
    setFeedback(null);
  }

  function showDownloadFeedback() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setFeedback(invoiceExportMessage);
  }

  function handleSupportPress() {
    Haptics.selectionAsync().catch(() => null);
    router.push(routes.contactSupport);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BillingHistoryHeader onBackPress={goBackToSubscription} />
        <BillingSummaryCard invoiceCount={invoices.length} subscription={subscription} />
        <FilterChips selectedFilter={selectedFilter} onFilterPress={handleFilterPress} />

        <View style={styles.section}>
          <AppText variant="sectionTitle">2026</AppText>
          {visibleInvoices.length > 0 ? (
            visibleInvoices.map((invoice) => (
              <InvoiceCard
                expanded={expandedInvoiceId === invoice.id}
                invoice={invoice}
                key={invoice.id}
                onDownload={showDownloadFeedback}
                onPress={() => toggleInvoice(invoice.id)}
              />
            ))
          ) : (
            <EmptyState
              description="لا توجد فواتير ضمن هذه الحالة."
              icon={<EmptyStateIcon name="document-text-outline" />}
              title="لا توجد فواتير"
            />
          )}
        </View>

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="warning" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <SupportCard onPress={handleSupportPress} />
      </ScrollView>
    </View>
  );
}

function BillingHistoryHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الاشتراك الحالي"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" numberOfLines={1} variant="screenTitle">
          سجل الفواتير
        </AppText>
        <AppText align="center" tone="secondary" variant="caption">
          عرض المدفوعات والفواتير السابقة
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function BillingSummaryCard({ invoiceCount, subscription }: { invoiceCount: number; subscription: SubscriptionState }) {
  const totalPayments = formatSubscriptionAmount(subscription.monthlyPrice * invoiceCount, subscription.currency);
  const lastPayment = formatSubscriptionAmount(subscription.monthlyPrice, subscription.currency);

  return (
    <SolidCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>
          <Ionicons color={colors.brand.calmGreen} name="receipt-outline" size={21} />
        </View>
        <View style={styles.copy}>
          <AppText variant="cardTitle">ملخص الفوترة</AppText>
          <AppText tone="secondary" variant="caption">
            جميع القيم المعروضة تجريبية ومحلية فقط.
          </AppText>
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryMetric label="إجمالي المدفوعات" value={totalPayments} />
        <SummaryMetric label="عدد الفواتير" value={`${invoiceCount}`} />
        <SummaryMetric label="آخر دفعة" value={lastPayment} />
        <SummaryMetric label="تاريخ آخر دفعة" value="15 يوليو 2026" />
      </View>
    </SolidCard>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryMetric}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.ltrText} variant="body">
        {value}
      </AppText>
    </View>
  );
}

function FilterChips({
  selectedFilter,
  onFilterPress,
}: {
  selectedFilter: InvoiceFilter;
  onFilterPress: (filter: InvoiceFilter) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.filtersContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersScroller}
    >
      {invoiceFilters.map((filter) => (
        <LedgerFilterChip
          key={filter.id}
          label={filter.label}
          onPress={() => onFilterPress(filter.id)}
          selected={selectedFilter === filter.id}
        />
      ))}
    </ScrollView>
  );
}

function InvoiceCard({
  invoice,
  expanded,
  onDownload,
  onPress,
}: {
  invoice: BillingInvoice;
  expanded: boolean;
  onDownload: () => void;
  onPress: () => void;
}) {
  return (
    <SolidCard style={styles.invoiceCard}>
      <Pressable
        accessibilityLabel={`${invoice.invoiceNumber}. ${invoice.amount}. ${invoice.issueDate}. ${invoice.statusLabel}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [styles.invoicePressable, pressed && styles.pressed]}
      >
        <View style={styles.invoiceTopRow}>
          <View style={styles.invoiceIcon}>
            <Ionicons color={colors.brand.calmGreen} name="document-text-outline" size={20} />
          </View>
          <View style={styles.invoiceCopy}>
            <AppText align="left" numberOfLines={1} style={styles.ltrText} variant="body">
              {invoice.invoiceNumber}
            </AppText>
            <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
              {invoice.planName}
            </AppText>
          </View>
          <InvoiceStatusBadge label={invoice.statusLabel} tone={invoice.tone} />
        </View>

        <View style={styles.invoiceMetaRow}>
          <View style={styles.metaItem}>
            <AppText tone="secondary" variant="caption">
              المبلغ
            </AppText>
            <AppText align="left" style={styles.ltrText} variant="supporting">
              {invoice.amount}
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <AppText tone="secondary" variant="caption">
              تاريخ الدفع
            </AppText>
            <AppText variant="supporting">{invoice.paymentDate}</AppText>
          </View>
        </View>

        <View style={styles.periodRow}>
          <AppText style={styles.periodText} tone="secondary" variant="caption">
            {invoice.period}
          </AppText>
          <Ionicons color={colors.text.tertiary} name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.expandedArea}>
          <Divider />
          <InfoRow label="رقم الفاتورة" ltr value={invoice.invoiceNumber} />
          <Divider />
          <InfoRow label="الخطة" ltr value={invoice.planName} />
          <Divider />
          <InfoRow label="فترة الاشتراك" value={invoice.period} />
          <Divider />
          <InfoRow label="تاريخ الإصدار" value={invoice.issueDate} />
          <Divider />
          <InfoRow label="المبلغ قبل الضريبة" ltr value={invoice.amount} />
          <Divider />
          <InfoRow label="الضريبة" value="غير محسوبة في النموذج" />
          <Divider />
          <InfoRow label="الإجمالي" ltr value={invoice.amount} />
          <Divider />
          <InfoRow label="وسيلة الدفع" ltr value={invoice.paymentMethodLabel} />
          <Divider />
          <InfoRow label="الحالة" value={invoice.statusLabel} />
          {invoice.status === 'paid' ? (
            <AppButton onPress={onDownload} style={styles.downloadButton} variant="secondary">
              تصدير الفاتورة — قريبًا
            </AppButton>
          ) : null}
        </View>
      ) : null}
    </SolidCard>
  );
}

function InvoiceStatusBadge({ label, tone }: { label: string; tone: InvoiceTone }) {
  const styleByTone: Record<InvoiceTone, { backgroundColor: string; borderColor: string; textTone: 'success' | 'warning' | 'danger' | 'secondary' }> = {
    success: {
      backgroundColor: colors.semantic.successTint,
      borderColor: 'rgba(79,138,91,0.30)',
      textTone: 'success',
    },
    warning: {
      backgroundColor: colors.semantic.warningTint,
      borderColor: 'rgba(232,163,61,0.30)',
      textTone: 'warning',
    },
    danger: {
      backgroundColor: colors.semantic.dangerTint,
      borderColor: 'rgba(229,103,90,0.30)',
      textTone: 'danger',
    },
    muted: {
      backgroundColor: colors.surface.muted,
      borderColor: colors.surface.border,
      textTone: 'secondary',
    },
  };
  const badgeStyle = styleByTone[tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: badgeStyle.backgroundColor, borderColor: badgeStyle.borderColor }]}>
      <AppText align="center" tone={badgeStyle.textTone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function InfoRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={[styles.infoValue, ltr && styles.ltrText]} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function SupportCard({ onPress }: { onPress: () => void }) {
  return (
    <SolidCard style={styles.supportCard}>
      <View style={styles.supportIcon}>
        <Ionicons color={colors.brand.calmGreen} name="chatbubble-ellipses-outline" size={20} />
      </View>
      <View style={styles.copy}>
        <AppText variant="cardTitle">هل لديك استفسار عن فاتورة؟</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          تواصل مع الدعم بخصوص الفوترة أو حالة الدفع.
        </AppText>
        <AppButton onPress={onPress} style={styles.supportButton} variant="secondary">
          التواصل مع الدعم
        </AppButton>
      </View>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 54,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryMetric: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 72,
    padding: spacing.md,
  },
  filtersScroller: {
    marginHorizontal: -16,
  },
  filtersContent: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: 16,
  },
  section: {
    gap: spacing.md,
  },
  invoiceCard: {
    padding: 0,
    overflow: 'hidden',
  },
  invoicePressable: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  invoiceTopRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  invoiceIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  invoiceCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  invoiceMetaRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  metaItem: {
    flex: 1,
    gap: spacing.xs,
  },
  periodRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  periodText: {
    flex: 1,
    lineHeight: 19,
  },
  expandedArea: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 42,
  },
  infoValue: {
    flex: 1,
  },
  downloadButton: {
    marginTop: spacing.sm,
    minHeight: 44,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackText: {
    flex: 1,
  },
  supportCard: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  supportIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  supportButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  description: {
    lineHeight: 22,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
