import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { AmountField, InvoiceHeader, InvoiceMiniCard, InvoiceProgressBar, NoticeBanner, PickerSheet, SelectField, TextField } from './components';
import { formatAmountInput, formatSar, formatSignedSar, getInvoiceSummary, getRecentPaymentDateOptions, parseAmount } from './invoice-utils';
import { findPaymentReference, recordPayment, useInvoicesStore } from './invoices-store';
import { initialInvoices, paymentMethodOptions, type Invoice } from './invoices-data';

type PickerType = 'method' | 'date' | null;

type PaymentErrors = {
  amount?: string;
  method?: string;
  date?: string;
  reference?: string;
};

export function RecordPaymentScreen() {
  const insets = useSafeAreaInsets();
  const savingRef = useRef(false);
  const params = useLocalSearchParams<{ id?: string }>();
  const { invoices } = useInvoicesStore();
  const invoice = invoices.find((item) => item.id === params.id) ?? invoices[0] ?? initialInvoices[0]!;
  const summary = getInvoiceSummary(invoice);
  const paymentDateOptions = useMemo(() => getRecentPaymentDateOptions(), []);
  const [amount, setAmount] = useState('3500');
  const [method, setMethod] = useState('تحويل بنكي');
  const [date, setDate] = useState(() => paymentDateOptions[0] ?? '');
  const [reference, setReference] = useState('PAY-2026-0085');
  const [note, setNote] = useState('دفعة أولى من العميل');
  const [picker, setPicker] = useState<PickerType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const parsedAmount = parseAmount(amount) ?? 0;
  const nextPaid = Math.min(summary.paid + Math.max(parsedAmount, 0), summary.total);
  const nextRemaining = Math.max(summary.total - nextPaid, 0);
  const errors = useMemo(
    () => validatePayment({ amount, date, method, reference, remaining: summary.remaining }),
    [amount, date, method, reference, summary.remaining],
  );
  const blockingError = Boolean(errors.amount || errors.method || errors.date || errors.reference);
  const previewInvoice: Invoice = {
    ...invoice,
    paid: nextPaid,
    status: nextRemaining === 0 ? 'paid' : 'partially-paid',
  };

  function handleSave() {
    if (savingRef.current) {
      return;
    }

    setSubmitted(true);

    if (blockingError || parsedAmount <= 0) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    recordPayment(summary.id, {
      amount: parsedAmount,
      date,
      method,
      note: note.trim(),
      reference: reference.trim(),
    });
    router.replace({ pathname: routes.invoiceDetails, params: { id: summary.id } });
  }

  function applyQuick(percent: 25 | 50 | 100) {
    const value = percent === 100 ? summary.remaining : Math.round(summary.remaining * (percent / 100));
    setAmount(String(value));
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: Math.max(insets.top + spacing.sm, 48),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InvoiceHeader rtl onBack={() => router.back()} subtitle="أضف مبلغًا محصلًا إلى الفاتورة" title="تسجيل دفعة" />

          <InvoiceMiniCard invoice={invoice} />

          <AmountField
            androidRtlLayout
            error={submitted || amount !== '3500' ? errors.amount : undefined}
            helper={`المبلغ المتبقي على الفاتورة هو ${summary.remaining.toLocaleString('en-US')} ر.س`}
            label="مبلغ الدفعة"
            onChangeText={(value) => setAmount(formatAmountInput(value))}
            value={amount}
          />
          <View style={styles.quickRow}>
            <QuickAmount label="25%" onPress={() => applyQuick(25)} selected={parsedAmount === Math.round(summary.remaining * 0.25)} />
            <QuickAmount label="50%" onPress={() => applyQuick(50)} selected={parsedAmount === Math.round(summary.remaining * 0.5)} />
            <QuickAmount label="كامل المبلغ" onPress={() => applyQuick(100)} selected={parsedAmount === summary.remaining} />
          </View>
          {parsedAmount === summary.remaining && summary.remaining > 0 ? <NoticeBanner message="سيتم سداد كامل قيمة الفاتورة" /> : null}

          <SelectField androidRtlLayout error={submitted ? errors.method : undefined} iconName="home-outline" label="طريقة الدفع" onPress={() => setPicker('method')} value={method} />
          <SelectField androidRtlLayout error={submitted ? errors.date : undefined} iconName="calendar-outline" label="تاريخ الدفع" ltr onPress={() => setPicker('date')} value={date} />
          <TextField error={submitted ? errors.reference : undefined} label="مرجع الدفعة" ltr onChangeText={setReference} placeholder="PAY-2026-0085" value={reference} />
          <TextField label="ملاحظة" onChangeText={setNote} placeholder="اختياري" value={note} />

          <View style={styles.section}>
            <AppText style={styles.sectionTitle} variant="cardTitle">
              معاينة التحصيل
            </AppText>
            <PaymentPreview after={nextPaid} before={summary.paid} invoice={previewInvoice} payment={Math.max(parsedAmount, 0)} remaining={nextRemaining} />
          </View>

          <AppButton disabled={blockingError || saving} iconName="checkmark-outline" loading={saving} onPress={handleSave}>
            حفظ الدفعة
          </AppButton>
          <AppButton onPress={() => router.back()} variant="ghost">
            إلغاء
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        androidRtlLayout
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setMethod(value);
          setPicker(null);
        }}
        options={paymentMethodOptions}
        selectedValue={method}
        title="اختر طريقة الدفع"
        visible={picker === 'method'}
      />
      <PickerSheet
        ltr
        onClose={() => setPicker(null)}
        onSelect={(value) => {
          setDate(value);
          setPicker(null);
        }}
        options={paymentDateOptions}
        selectedValue={date}
        title="اختر تاريخ الدفع"
        visible={picker === 'date'}
      />
    </View>
  );
}

function QuickAmount({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.quickChip, selected && styles.quickChipActive, pressed && styles.pressed]}
    >
      <AppText align="center" style={selected && styles.quickTextActive} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}

function PaymentPreview({ before, payment, after, remaining, invoice }: { before: number; payment: number; after: number; remaining: number; invoice: Invoice }) {
  const preview = getInvoiceSummary(invoice);
  const collectionLabel = (
    <AppText style={Platform.OS === 'android' ? styles.previewRowLabelAndroid : undefined} tone="secondary" variant="caption">
      نسبة التحصيل
    </AppText>
  );
  const collectionValue = (
    <AppText style={[styles.blueText, Platform.OS === 'android' && styles.previewRowValueAndroid]} variant="caption">
      {preview.progress}%
    </AppText>
  );
  const remainingLabel = (
    <AppText style={Platform.OS === 'android' ? styles.previewRowLabelAndroid : undefined} tone="secondary" variant="caption">
      المتبقي بعد الدفعة
    </AppText>
  );
  const remainingValue = (
    <AppText align="left" style={[styles.previewValue, Platform.OS === 'android' && styles.previewRowValueAndroid]} variant="caption">
      {formatSar(remaining)}
    </AppText>
  );

  return (
    <SolidCard style={[styles.previewCard, preview.paidInFull && styles.paidPreviewCard]}>
      <View style={styles.previewNumbers}>
        <PreviewMetric label="قبل" value={before} />
        <PreviewMetric label="الدفعة" tone="green" value={payment} />
        <PreviewMetric label="بعد" tone="green" value={after} />
      </View>
      <View style={[styles.progressRow, Platform.OS === 'android' && styles.progressRowAndroid]}>
        {Platform.OS === 'android' ? collectionValue : collectionLabel}
        {Platform.OS === 'android' ? collectionLabel : collectionValue}
      </View>
      <InvoiceProgressBar progress={preview.progress} tone={preview.paidInFull ? 'green' : 'blue'} />
      <View style={[styles.progressRow, Platform.OS === 'android' && styles.progressRowAndroid]}>
        {Platform.OS === 'android' ? remainingValue : remainingLabel}
        {Platform.OS === 'android' ? remainingLabel : remainingValue}
      </View>
      <AppText align={Platform.OS === 'android' ? 'right' : 'center'} style={Platform.OS === 'android' ? styles.previewDescriptionAndroid : undefined} variant="supporting">
        {preview.paidInFull
          ? 'تم سداد كامل قيمة الفاتورة.'
          : directionSafeText(`بعد تسجيل الدفعة، سيتبقى ${remaining.toLocaleString('en-US')} ر.س على الفاتورة.`)}
      </AppText>
    </SolidCard>
  );
}

function PreviewMetric({ label, value, tone }: { label: string; value: number; tone?: 'green' }) {
  return (
    <View style={[styles.previewMetric, Platform.OS === 'android' && styles.previewMetricAndroid]}>
      <AppText align={Platform.OS === 'android' ? 'right' : 'center'} style={Platform.OS === 'android' ? styles.previewMetricLabelAndroid : undefined} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align={Platform.OS === 'android' ? 'left' : 'center'} style={[styles.previewValue, Platform.OS === 'android' && styles.previewMetricValueAndroid, tone === 'green' && styles.greenText]} variant="caption">
        {tone === 'green' ? formatSignedSar(value) : formatSar(value)}
      </AppText>
    </View>
  );
}

function validatePayment({ amount, date, method, reference, remaining }: { amount: string; date: string; method: string; reference: string; remaining: number }) {
  const errors: PaymentErrors = {};
  const parsedAmount = parseAmount(amount);

  if (!amount.trim()) {
    errors.amount = 'يرجى إدخال مبلغ الدفعة';
  } else if (parsedAmount === null || parsedAmount <= 0) {
    errors.amount = 'أدخل مبلغًا أكبر من صفر';
  } else if (parsedAmount > remaining) {
    errors.amount = 'المبلغ المدخل أكبر من المبلغ المتبقي على الفاتورة';
  }

  if (!method.trim()) {
    errors.method = 'يرجى اختيار طريقة الدفع';
  }

  if (!date.trim()) {
    errors.date = 'يرجى اختيار تاريخ الدفع';
  }

  if (reference.trim() && findPaymentReference(reference.trim())) {
    errors.reference = 'مرجع الدفعة مستخدم مسبقًا';
  }

  return errors;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  quickRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  quickChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.sm,
  },
  quickChipActive: {
    backgroundColor: 'rgba(53,211,154,0.14)',
    borderColor: 'rgba(53,211,154,0.34)',
  },
  quickTextActive: {
    color: '#35D39A',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  previewCard: {
    gap: spacing.md,
  },
  paidPreviewCard: {
    backgroundColor: 'rgba(5,38,24,0.68)',
    borderColor: 'rgba(53,211,154,0.32)',
  },
  previewNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewMetric: {
    gap: spacing.xs,
    minWidth: 86,
  },
  previewMetricAndroid: {
    alignItems: 'stretch',
  },
  previewMetricLabelAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  previewMetricValueAndroid: {
    textAlign: 'left',
    width: '100%',
  },
  previewValue: {
    color: colors.text.primary,
    fontWeight: '700',
    writingDirection: 'ltr',
  },
  greenText: {
    color: '#35D39A',
  },
  blueText: {
    color: '#2EA8FF',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressRowAndroid: {
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  previewRowLabelAndroid: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewRowValueAndroid: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  previewDescriptionAndroid: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
