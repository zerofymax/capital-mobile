import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { BottomConfirmSheet, InvoiceHeader, InvoiceMetric, InvoiceProgressBar, InvoiceStatusBadge, NoticeBanner } from './components';
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
            paddingTop: Math.max(insets.top + spacing.sm, 48),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <InvoiceHeader onBack={() => router.back()} title="تفاصيل الفاتورة" />

        {notice ? <NoticeBanner message={notice} /> : null}

        <SolidCard style={[styles.identityCard, summary.displayStatus.tone === 'danger' && styles.dangerCard]}>
          <View style={[styles.invoiceIcon, { backgroundColor: tone.tint }]}>
            <Ionicons color={tone.accent} name={summary.displayStatus.icon} size={22} />
          </View>
          <View style={styles.identityCopy}>
            <AppText variant="sectionTitle">{summary.clientName}</AppText>
            <AppText align="left" tone="secondary" variant="caption">
              {directionSafeText(summary.invoiceNumber)}
            </AppText>
          </View>
          <InvoiceStatusBadge status={summary.displayStatus} />
        </SolidCard>

        {summary.status === 'overdue' ? <NoticeBanner message="تجاوزت هذه الفاتورة تاريخ الاستحقاق" tone="danger" /> : null}

        <SolidCard style={styles.summaryCard}>
          <AppText variant="cardTitle">ملخص التحصيل</AppText>
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
  const rows: [string, string][] = [
    ['اسم العميل', summary.clientName],
    ['رقم الفاتورة', summary.invoiceNumber],
    ['تاريخ الإصدار', summary.issueDate],
    ['تاريخ الاستحقاق', summary.dueDate],
    ['مدة السداد', summary.status === 'overdue' ? 'متأخرة 8 أيام' : '27 يومًا'],
    ['حالة الدفع', summary.displayStatus.label],
    ['تاريخ الإنشاء', summary.createdAt],
  ];

  return (
    <View style={styles.section}>
      <AppText variant="cardTitle">معلومات الفاتورة</AppText>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <InfoRow label={label} value={value} />
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
      <AppText variant="cardTitle">بنود الفاتورة</AppText>
      <SolidCard style={styles.infoCard}>
        {summary.items.map((item, index) => (
          <View key={item.id}>
            <View style={styles.itemRow}>
              <View style={styles.itemCopy}>
                <AppText variant="cardTitle">{item.description}</AppText>
                <AppText tone="secondary" variant="caption">
                  {directionSafeText(`الكمية: ${item.quantity} · السعر: ${item.unitPrice.toLocaleString('en-US')} ر.س`)}
                </AppText>
              </View>
              <AppText align="left" style={styles.infoValue} variant="caption">
                {formatSar(item.quantity * item.unitPrice)}
              </AppText>
            </View>
            {index < summary.items.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <Divider />
        <InfoRow label="المجموع الفرعي" value={`${summary.subtotal.toLocaleString('en-US')} ر.س`} />
        <InfoRow label="الخصم" value={`${summary.discount.toLocaleString('en-US')} ر.س`} />
        <InfoRow label="الضريبة" value={`${summary.tax.toLocaleString('en-US')} ر.س`} />
        <Divider />
        <InfoRow label="الإجمالي" tone="green" value={`${summary.total.toLocaleString('en-US')} ر.س`} />
      </SolidCard>
    </View>
  );
}

function PaymentHistory({ summary }: { summary: ReturnType<typeof getInvoiceSummary> }) {
  return (
    <View style={styles.section}>
      <AppText variant="cardTitle">سجل الدفعات</AppText>
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
                    <AppText style={styles.greenText} variant="cardTitle">
                      {formatSar(payment.amount)}
                    </AppText>
                    <AppText tone="secondary" variant="caption">
                      {payment.method} · {payment.date}
                    </AppText>
                    <AppText align="left" tone="secondary" variant="caption">
                      {directionSafeText(payment.reference)}
                    </AppText>
                  </View>
                  <AppText align="left" style={styles.infoValue} variant="caption">
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
      <View style={styles.insightHeader}>
        <Ionicons color={isOverdue ? colors.semantic.danger : '#F3B744'} name="sparkles-outline" size={17} />
        <AppText style={isOverdue ? styles.dangerText : styles.amberText} variant="cardTitle">
          {isOverdue ? 'فاتورة متأخرة' : 'موعد الاستحقاق قريب'}
        </AppText>
      </View>
      <AppText variant="body">
        {summary.paidInFull
          ? 'تم تحصيل هذه الفاتورة بالكامل ولا توجد مبالغ متبقية.'
          : isOverdue
            ? 'تجاوزت هذه الفاتورة موعد الاستحقاق. المتابعة المبكرة قد تساعد على تحصيل المبلغ المتبقي.'
            : hasPartialPayment
              ? `تم تسجيل دفعة جزئية، ولا يزال موعد الفاتورة ${summary.dueText}.`
              : `لم يتم تسجيل أي دفعة لهذه الفاتورة حتى الآن، والموعد ${summary.dueText}.`}
      </AppText>
      <AppText tone="secondary" variant="caption">
        تقدير تجريبي
      </AppText>
    </SolidCard>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={[styles.infoValue, tone === 'green' && styles.greenText]} variant="caption">
        {directionSafeText(value)}
      </AppText>
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
    flexDirection: 'row-reverse',
    gap: spacing.md,
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
  summaryCard: {
    gap: spacing.md,
  },
  summaryMetrics: {
    flexDirection: 'row-reverse',
  },
  progressRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  section: {
    gap: spacing.md,
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  paymentRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
    gap: spacing.sm,
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
