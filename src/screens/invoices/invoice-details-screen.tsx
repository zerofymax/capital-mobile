import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { BottomConfirmSheet, InvoiceHeader, InvoiceMetric, InvoiceProgressBar, InvoiceSectionHeading, InvoiceStatusBadge, NoticeBanner } from './components';
import { deleteInvoice, markInvoiceAsPaid, useInvoicesStore } from './invoices-store';
import { formatSar, getInvoiceSummary, invoiceToneColors } from './invoice-utils';
import { initialInvoices } from './invoices-data';

export function InvoiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { invoices, notice } = useInvoicesStore();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [paidVisible, setPaidVisible] = useState(false);
  const invoice = invoices.find((item) => item.id === params.id) ?? invoices[0] ?? initialInvoices[0]!;
  const summary = useMemo(() => getInvoiceSummary(invoice), [invoice]);
  const tone = invoiceToneColors[summary.displayStatus.tone];

  function handleDelete() {
    deleteInvoice(summary.id);
    setDeleteVisible(false);
    router.replace(routes.invoices);
  }

  function handleMarkPaid() {
    markInvoiceAsPaid(summary.id);
    setPaidVisible(false);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top + spacing.sm, 48),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <InvoiceHeader rtl onBack={() => router.back()} title="تفاصيل الفاتورة" />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SolidCard style={[styles.identityCard, Platform.OS !== 'web' && styles.identityCardAndroid, summary.displayStatus.tone === 'danger' && styles.dangerCard]}>
          {Platform.OS !== 'web' ? (
            <>
              <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
                <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={22} />
              </View>
              <View style={styles.identitySpacer} />
              <InvoiceStatusBadge status={summary.displayStatus} />
              <View style={[styles.identityCopy, styles.identityCopyAndroid]}>
                <AppText adjustsFontSizeToFit align="right" minimumFontScale={0.9} numberOfLines={1} style={styles.identityNameAndroid} variant="sectionTitle">
                  {summary.clientName}
                </AppText>
                <AppText adjustsFontSizeToFit align="right" minimumFontScale={0.9} numberOfLines={1} style={[styles.invoiceNumber, styles.invoiceNumberAndroid]} tone="secondary" variant="caption">
                  {directionSafeText(summary.invoiceNumber)}
                </AppText>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
                <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={22} />
              </View>
              <View style={styles.identityCopy}>
                <AppText variant="sectionTitle">{summary.clientName}</AppText>
                <AppText align="left" style={styles.invoiceNumber} tone="secondary" variant="caption">
                  {directionSafeText(summary.invoiceNumber)}
                </AppText>
              </View>
              <InvoiceStatusBadge status={summary.displayStatus} />
            </>
          )}
        </SolidCard>

        {summary.status === 'overdue' ? <NoticeBanner message="تجاوزت هذه الفاتورة تاريخ الاستحقاق" tone="danger" /> : null}

        <SolidCard style={styles.summaryCard}>
          <InvoiceSectionHeading title="ملخص التحصيل" />
          <View style={styles.summaryMetrics}>
            <InvoiceMetric label="إجمالي الفاتورة" value={summary.total} />
            <InvoiceMetric label="المبلغ المدفوع" tone="green" value={summary.paid} />
            <InvoiceMetric label="المتبقي" tone={summary.displayStatus.tone} value={summary.remaining} />
          </View>
          <View style={styles.progressRow}>
            <AppText tone="secondary" variant="caption">
              نسبة التحصيل
            </AppText>
            <AppText style={{ color: tone.text }} variant="caption">
              {summary.progress}%
            </AppText>
          </View>
          <InvoiceProgressBar progress={summary.progress} tone={summary.displayStatus.tone} />
          <AppText align="center" variant="supporting">
            {summary.paidInFull ? 'تم تحصيل كامل قيمة الفاتورة' : summary.progress > 0 ? `تم تحصيل ${summary.progress}% من قيمة الفاتورة` : 'لم يتم تحصيل أي مبلغ بعد'}
          </AppText>
        </SolidCard>

        <InfoCard summary={summary} />
        <ItemsCard summary={summary} />
        <PaymentHistory summary={summary} />
        <InsightCard summary={summary} />

        {!summary.paidInFull ? (
          <>
            <AppButton iconName="add-outline" onPress={() => router.push({ pathname: routes.recordPayment, params: { id: summary.id } })}>
              تسجيل دفعة
            </AppButton>
            <AppButton iconName="checkmark-circle-outline" onPress={() => setPaidVisible(true)} variant="secondary">
              تحديد كمدفوعة
            </AppButton>
          </>
        ) : null}
        <AppButton iconName="create-outline" onPress={() => router.push({ pathname: routes.editInvoice, params: { id: summary.id } })} variant="secondary">
          تعديل الفاتورة
        </AppButton>
        <AppButton iconName="trash-outline" onPress={() => setDeleteVisible(true)} variant="danger">
          حذف الفاتورة
        </AppButton>
      </ScrollView>

      <BottomConfirmSheet
        description={`سيتم تسجيل المبلغ المتبقي ${summary.remaining.toLocaleString('en-US')} ر.س كدفعة مكتملة.`}
        onPrimaryPress={handleMarkPaid}
        onSecondaryPress={() => setPaidVisible(false)}
        primaryLabel="تحديد كمدفوعة"
        secondaryLabel="إلغاء"
        title="تحديد الفاتورة كمدفوعة؟"
        visible={paidVisible}
      />
      <BottomConfirmSheet
        danger
        description={`سيتم حذف فاتورة ${summary.clientName} رقم ${summary.invoiceNumber} وسجل الدفعات المرتبط بها.`}
        onPrimaryPress={handleDelete}
        onSecondaryPress={() => setDeleteVisible(false)}
        primaryLabel="حذف الفاتورة"
        secondaryLabel="إلغاء"
        title="حذف الفاتورة؟"
        visible={deleteVisible}
      />
    </View>
  );
}

function InfoCard({ summary }: { summary: ReturnType<typeof getInvoiceSummary> }) {
  const rows: { label: string; value: string; ltr?: boolean }[] = [
    { label: 'اسم العميل', value: summary.clientName },
    { label: 'رقم الفاتورة', ltr: true, value: summary.invoiceNumber },
    { label: 'تاريخ الإصدار', ltr: true, value: summary.issueDate },
    { label: 'تاريخ الاستحقاق', ltr: true, value: summary.dueDate },
    { label: 'مدة السداد', value: summary.status === 'overdue' ? 'متأخرة 8 أيام' : '27 يومًا' },
    { label: 'حالة الدفع', value: summary.displayStatus.label },
    { label: 'تاريخ الإنشاء', ltr: true, value: summary.createdAt },
  ];

  return (
    <View style={styles.section}>
      <InvoiceSectionHeading title="معلومات الفاتورة" />
      <SolidCard style={styles.infoCard}>
        {rows.map((row, index) => (
          <View key={row.label}>
            <InfoRow label={row.label} ltr={row.ltr} value={row.value} />
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ItemsCard({ summary }: { summary: ReturnType<typeof getInvoiceSummary> }) {
  return (
    <View style={styles.section}>
      <InvoiceSectionHeading title="بنود الفاتورة" />
      <SolidCard style={styles.infoCard}>
        {summary.items.map((item, index) => (
          <View key={item.id}>
            <View style={[styles.itemRow, Platform.OS !== 'web' && styles.itemRowAndroid]}>
              {Platform.OS !== 'web' ? (
                <AppText align="left" style={[styles.infoValue, styles.ltrValue]} variant="caption">
                  {formatSar(item.quantity * item.unitPrice)}
                </AppText>
              ) : null}
              <View style={[styles.itemCopy, Platform.OS !== 'web' && styles.itemCopyAndroid]}>
                <AppText style={Platform.OS !== 'web' ? styles.itemTextAndroid : undefined} variant="cardTitle">
                  {item.description}
                </AppText>
                <AppText style={Platform.OS !== 'web' ? styles.itemTextAndroid : undefined} tone="secondary" variant="caption">
                  {directionSafeText(`الكمية: ${item.quantity} · السعر: ${item.unitPrice.toLocaleString('en-US')} ر.س`)}
                </AppText>
              </View>
              {Platform.OS !== 'web' ? null : (
                <AppText align="left" style={[styles.infoValue, styles.ltrValue]} variant="caption">
                  {formatSar(item.quantity * item.unitPrice)}
                </AppText>
              )}
            </View>
            {index < summary.items.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <Divider />
        <InfoRow label="المجموع الفرعي" ltr value={`${summary.subtotal.toLocaleString('en-US')} ر.س`} />
        <InfoRow label="الخصم" ltr value={`${summary.discount.toLocaleString('en-US')} ر.س`} />
        <InfoRow label="الضريبة" ltr value={`${summary.tax.toLocaleString('en-US')} ر.س`} />
        <Divider />
        <InfoRow label="الإجمالي" ltr tone="green" value={`${summary.total.toLocaleString('en-US')} ر.س`} />
      </SolidCard>
    </View>
  );
}

function PaymentHistory({ summary }: { summary: ReturnType<typeof getInvoiceSummary> }) {
  return (
    <View style={styles.section}>
      <InvoiceSectionHeading title="سجل الدفعات" />
      {summary.payments.length ? (
        <SolidCard style={styles.infoCard}>
          {summary.payments.map((payment, index) => {
            const remainingAfter = Math.max(summary.total - summary.payments.slice(0, index + 1).reduce((sum, item) => sum + item.amount, 0), 0);

            return (
              <View key={payment.id}>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentIcon}>
                    <Ionicons color="#35D39A" name="add-outline" size={17} />
                  </View>
                  <View style={styles.itemCopy}>
                    <AppText style={[styles.greenText, styles.ltrValue]} variant="cardTitle">
                      {formatSar(payment.amount)}
                    </AppText>
                    <AppText tone="secondary" variant="caption">
                      {payment.method} · {payment.date}
                    </AppText>
                    <AppText align="left" tone="secondary" variant="caption">
                      {directionSafeText(payment.reference)}
                    </AppText>
                  </View>
                  <AppText align="left" style={[styles.infoValue, styles.ltrValue]} variant="caption">
                    {directionSafeText(`المتبقي بعد هذه الدفعة: ${remainingAfter.toLocaleString('en-US')} ر.س`)}
                  </AppText>
                </View>
                {index < summary.payments.length - 1 ? <Divider /> : null}
              </View>
            );
          })}
        </SolidCard>
      ) : (
        <SolidCard style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={colors.text.tertiary} name="card-outline" size={24} />
          </View>
          <AppText align="center" variant="cardTitle">
            لا توجد دفعات مسجلة
          </AppText>
          <AppText align="center" tone="secondary" variant="supporting">
            سيظهر هنا سجل المبالغ المحصلة من هذه الفاتورة.
          </AppText>
        </SolidCard>
      )}
    </View>
  );
}

function InsightCard({ summary }: { summary: ReturnType<typeof getInvoiceSummary> }) {
  const isOverdue = summary.dueTiming.state === 'overdue';
  const hasPartialPayment = summary.paid > 0 && !summary.paidInFull;

  return (
    <SolidCard style={[styles.insightCard, isOverdue && styles.warningInsight]}>
      <View style={[styles.insightHeader, Platform.OS !== 'web' && styles.insightHeaderAndroid]}>
        <Ionicons color={isOverdue ? colors.semantic.danger : '#F3B744'} name="sparkles-outline" size={17} />
        <AppText style={[isOverdue ? styles.dangerText : styles.amberText, Platform.OS !== 'web' && styles.insightTitleAndroid]} variant="cardTitle">
          {isOverdue ? 'فاتورة متأخرة' : 'موعد الاستحقاق قريب'}
        </AppText>
      </View>
      <AppText style={Platform.OS !== 'web' ? styles.insightTextAndroid : undefined} variant="body">
        {summary.paidInFull
          ? 'تم تحصيل هذه الفاتورة بالكامل ولا توجد مبالغ متبقية.'
          : isOverdue
            ? 'تجاوزت هذه الفاتورة موعد الاستحقاق. المتابعة المبكرة قد تساعد على تحصيل المبلغ المتبقي.'
            : hasPartialPayment
              ? `تم تسجيل دفعة جزئية، ولا يزال موعد الفاتورة ${summary.dueText}.`
              : `لم يتم تسجيل أي دفعة لهذه الفاتورة حتى الآن، والموعد ${summary.dueText}.`}
      </AppText>
      <AppText style={Platform.OS !== 'web' ? styles.insightTextAndroid : undefined} tone="secondary" variant="caption">
        تقدير تجريبي
      </AppText>
    </SolidCard>
  );
}

function InfoRow({ label, value, tone, ltr = false }: { label: string; value: string; tone?: 'green'; ltr?: boolean }) {
  const labelText = (
    <AppText style={Platform.OS !== 'web' ? styles.infoLabelAndroid : undefined} tone="secondary" variant="caption">
      {label}
    </AppText>
  );
  const valueText = (
    <AppText align="left" style={[styles.infoValue, ltr && styles.ltrValue, Platform.OS !== 'web' && styles.infoValueAndroid, tone === 'green' && styles.greenText]} variant="caption">
      {directionSafeText(value)}
    </AppText>
  );

  return (
    <View style={[styles.infoRow, Platform.OS !== 'web' && styles.infoRowAndroid]}>
      {Platform.OS !== 'web' ? valueText : labelText}
      {Platform.OS !== 'web' ? labelText : valueText}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  identityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  identityCardAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  identitySpacer: {
    flexShrink: 0,
    width: spacing.sm,
  },
  dangerCard: {
    backgroundColor: 'rgba(42,10,10,0.50)',
    borderColor: 'rgba(229,103,90,0.28)',
  },
  invoiceIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  identityCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  identityCopyAndroid: {
    alignItems: 'flex-end',
  },
  identityNameAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invoiceNumber: {
    writingDirection: 'ltr',
  },
  invoiceNumberAndroid: {
    flexShrink: 0,
    textAlign: 'right',
    width: '100%',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryMetrics: {
    flexDirection: 'row',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 34,
  },
  infoRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  infoLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text.primary,
    flexShrink: 1,
    fontWeight: '700',
    textAlign: 'left',
  },
  infoValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  itemCopyAndroid: {
    alignItems: 'flex-end',
  },
  itemTextAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  paymentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
  },
  paymentIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(53,211,154,0.12)',
    borderRadius: radii.control,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  insightCard: {
    backgroundColor: 'rgba(45,29,2,0.60)',
    borderColor: 'rgba(243,183,68,0.26)',
    gap: spacing.sm,
  },
  warningInsight: {
    backgroundColor: 'rgba(42,10,10,0.50)',
    borderColor: 'rgba(229,103,90,0.28)',
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightHeaderAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  insightTitleAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  insightTextAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  greenText: {
    color: '#35D39A',
  },
  amberText: {
    color: '#F3B744',
  },
  dangerText: {
    color: colors.semantic.danger,
  },
});
