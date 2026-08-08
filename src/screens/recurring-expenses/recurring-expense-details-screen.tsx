import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { getCategoryById } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { paymentMethodOptions } from './recurring-expenses-data';
import {
  deleteRecurringExpense,
  pauseRecurringExpense,
  recordRecurringPayment,
  resumeRecurringExpense,
  useRecurringExpensesStore,
} from './recurring-expenses-store';
import type { RecurringExpense, RecurringPaymentMethod, RecurringPaymentRecord } from './recurring-expenses-types';
import {
  calculateMonthlyEquivalent,
  calculateAnnualEquivalent,
  formatDisplayDate,
  formatDueDistance,
  formatFrequencyLabel,
  formatPaymentMethodLabel,
  formatRenewalModeLabel,
  formatSar,
  parseAmount,
  prototypeToday,
} from './recurring-expenses-utils';

export function RecurringExpenseDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { expenses } = useRecurringExpensesStore();
  const expense = expenses.find((item) => item.id === params.id);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bottomPadding = Math.max(insets.bottom + spacing.xxxl + spacing.xl, spacing.screenBottom);

  if (!expense) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <View style={[styles.missingWrap, { paddingBottom: bottomPadding }]}>
          <ModalHeader title="تعذر العثور على المصروف" />
          <AppText align="center" tone="secondary" variant="supporting">
            ربما تم حذف المصروف من بيانات النموذج المحلي.
          </AppText>
          <AppButton onPress={() => router.replace(routes.recurringExpenses)}>العودة للمصروفات</AppButton>
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(expense.categoryId);
  const monthlyEquivalent = calculateMonthlyEquivalent(expense.amount, expense.frequency, expense.customInterval);
  const annualEquivalent = calculateAnnualEquivalent(expense.amount, expense.frequency, expense.customInterval);

  function handleDelete() {
    if (!expense) {
      return;
    }

    deleteRecurringExpense(expense.id);
    setConfirmDelete(false);
    router.replace(routes.recurringExpenses);
  }

  function handlePauseToggle() {
    if (!expense) {
      return;
    }

    if (expense.status === 'paused') {
      resumeRecurringExpense(expense.id);
      return;
    }

    pauseRecurringExpense(expense.id);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader title="تفاصيل المصروف المتكرر" />

        <SolidCard style={[styles.heroCard, expense.needsReview && styles.reviewCard]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, expense.needsReview && styles.reviewIcon]}>
              <Ionicons
                color={expense.needsReview ? colors.semantic.warning : colors.brand.calmGreen}
                name={category?.icon ?? 'repeat-outline'}
                size={24}
              />
            </View>
            <View style={styles.heroCopy}>
              <AppText style={styles.heroTitle} variant="screenTitle">{expense.name}</AppText>
              <AppText style={styles.heroDescription} tone="secondary" variant="supporting">
                {expense.vendor} · {category?.name ?? 'مصروفات'}
              </AppText>
            </View>
          </View>
          <View style={styles.heroMetrics}>
            <Metric label="المبلغ" value={formatSar(expense.amount)} />
            <Metric label="شهريًا تقديريًا" value={formatSar(monthlyEquivalent)} />
            <Metric label="سنويًا تقديريًا" value={formatSar(annualEquivalent)} />
          </View>
        </SolidCard>

        <SolidCard style={styles.sectionCard}>
          <SectionTitle>الاستحقاق القادم</SectionTitle>
          <View style={styles.dueSummary}>
            <View>
              <AppText tone="secondary" variant="caption">
                الموعد
              </AppText>
              <AppText style={styles.ltrValue} variant="cardTitle">
                {expense.nextDueDate ? formatDisplayDate(expense.nextDueDate) : 'لا يوجد'}
              </AppText>
            </View>
            <View>
              <AppText align="left" tone="secondary" variant="caption">
                المسافة
              </AppText>
              <AppText align="left" variant="cardTitle">
                {expense.status === 'paused' ? 'متوقف مؤقتًا' : formatDueDistance(expense.nextDueDate)}
              </AppText>
            </View>
          </View>
          <InfoRow label="التكرار" value={formatFrequencyLabel(expense.frequency, expense.customInterval)} />
          <InfoRow label="طريقة التجديد" value={formatRenewalModeLabel(expense.renewalMode)} />
          <InfoRow label="طريقة الدفع" value={formatPaymentMethodLabel(expense.paymentMethod)} />
          <InfoRow label="الحساب" value={expense.accountId ?? 'غير محدد'} />
          <InfoRow label="رقم مرجعي" value={expense.reference ?? 'غير محدد'} />
          <InfoRow label="المسؤول" value={expense.owner} />
          <InfoRow label="الحالة" value={expense.status === 'active' ? 'نشط' : 'متوقف'} />
          <InfoRow label="التذكير" value={expense.reminderDays ? `قبل ${expense.reminderDays} أيام` : 'بدون تذكير'} />
          <InfoRow label="تاريخ البداية" value={formatDisplayDate(expense.startDate)} />
          <InfoRow label="تاريخ النهاية" value={expense.endDate ? formatDisplayDate(expense.endDate) : 'غير محدد'} />
        </SolidCard>

        {expense.needsReview ? (
          <SolidCard style={styles.reviewInsight}>
            <View style={styles.reviewHeader}>
              <Ionicons color={colors.semantic.warning} name="warning-outline" size={18} />
              <AppText style={styles.reviewTitle} variant="cardTitle">
                يحتاج مراجعة
              </AppText>
            </View>
            <AppText style={styles.reviewText} variant="supporting">
              {expense.reviewReason ?? 'هذا المصروف يحتاج مراجعة قبل التجديد القادم.'}
            </AppText>
            {expense.monthlySavingOpportunity ? (
              <AppText style={styles.reviewSaving} variant="caption">
                {directionSafeText(`فرصة توفير: ${formatSar(expense.monthlySavingOpportunity)} شهريًا`)}
              </AppText>
            ) : null}
          </SolidCard>
        ) : null}

        <SolidCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Pressable accessibilityRole="button" onPress={() => setPaymentVisible(true)} style={styles.inlineButton}>
              <Ionicons color={colors.brand.calmGreen} name="add-outline" size={16} />
              <AppText style={styles.inlineButtonText} variant="caption">
                تسجيل دفعة
              </AppText>
            </Pressable>
            <AppText style={styles.sectionHeaderTitle} variant="sectionTitle">سجل الدفعات</AppText>
          </View>
          {expense.payments.length > 0 ? (
            <View style={styles.paymentList}>
              {expense.payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyPayments}>
              <Ionicons color={colors.text.tertiary} name="card-outline" size={24} />
              <AppText align="center" tone="secondary" variant="supporting">
                لا توجد دفعات مسجلة بعد.
              </AppText>
            </View>
          )}
        </SolidCard>

        {expense.notes ? (
          <SolidCard style={styles.sectionCard}>
            <SectionTitle>ملاحظات</SectionTitle>
            <AppText style={styles.notes} variant="supporting">
              {expense.notes}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.actions}>
          <AppButton iconName="card-outline" onPress={() => setPaymentVisible(true)}>
            تسجيل دفعة
          </AppButton>
          <AppButton
            iconName="create-outline"
            onPress={() => router.push({ pathname: routes.editRecurringExpense, params: { id: expense.id } })}
            variant="secondary"
          >
            تعديل المصروف
          </AppButton>
          <AppButton iconName={expense.status === 'paused' ? 'play-outline' : 'pause-outline'} onPress={handlePauseToggle} variant="secondary">
            {expense.status === 'paused' ? 'إعادة التفعيل' : 'إيقاف مؤقت'}
          </AppButton>
          <AppButton iconName="trash-outline" onPress={() => setConfirmDelete(true)} variant="danger">
            حذف المصروف
          </AppButton>
        </View>
      </ScrollView>

      <RecordPaymentSheet expense={expense} onClose={() => setPaymentVisible(false)} visible={paymentVisible} />
      <ConfirmationDialog
        confirmLabel="حذف المصروف"
        description="سيتم حذف المصروف وسجل دفعاته من النسخة التجريبية الحالية، ولا يمكن التراجع."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف المصروف؟"
        tone="danger"
        visible={confirmDelete}
      />
    </SafeAreaView>
  );
}

function ModalHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons
          color={colors.text.primary}
          name={Platform.OS === 'android' ? 'chevron-back-outline' : 'chevron-forward-outline'}
          size={21}
        />
      </Pressable>
      <View style={styles.headerTitleContainer}>
        <AppText align={Platform.OS === 'android' ? 'right' : 'center'} style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
      </View>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleWrapper}>
      <AppText style={styles.sectionTitle} variant="sectionTitle">{children}</AppText>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <AppText align="center" tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="center" style={styles.metricValue} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.infoValue} variant="caption">
        {directionSafeText(value)}
      </AppText>
    </View>
  );
}

function PaymentRow({ payment }: { payment: RecurringPaymentRecord }) {
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentIcon}>
        <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={16} />
      </View>
      <View style={styles.paymentCopy}>
        <AppText variant="caption">{formatPaymentMethodLabel(payment.method)}</AppText>
        <AppText tone="secondary" variant="caption">
          {formatDisplayDate(payment.date)}
        </AppText>
      </View>
      <AppText align="left" style={styles.paymentAmount} variant="caption">
        {directionSafeText(formatSar(payment.amount))}
      </AppText>
    </View>
  );
}

function RecordPaymentSheet({
  expense,
  visible,
  onClose,
}: {
  expense: RecurringExpense;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(String(expense.amount));
  const [date, setDate] = useState(expense.nextDueDate ?? prototypeToday);
  const [method, setMethod] = useState<RecurringPaymentMethod>(expense.paymentMethod);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const paymentDateOptions = [expense.nextDueDate, prototypeToday, '2026-08-01', '2026-08-10', '2026-09-01']
    .filter((value): value is string => Boolean(value))
    .filter((value, index, list) => list.indexOf(value) === index);

  function handleSave() {
    const parsedAmount = parseAmount(amount);

    if (parsedAmount === null || parsedAmount <= 0) {
      setError('أدخل مبلغ دفعة أكبر من صفر');
      return;
    }

    if (!date.trim()) {
      setError('أدخل تاريخ الدفعة');
      return;
    }

    recordRecurringPayment(expense.id, {
      amount: parsedAmount,
      date,
      method,
      note: note.trim() || undefined,
    });
    setError(null);
    onClose();
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.xxl, 52) }]}>
          <View style={styles.sheetGrabber} />
          <View style={styles.sheetHeader}>
            {Platform.OS === 'android' ? (
              <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose}>
                <AppText tone="link" variant="supporting">إلغاء</AppText>
              </Pressable>
            ) : null}
            <AppText style={styles.sheetTitle} variant="sectionTitle">تسجيل دفعة</AppText>
          </View>
          <SheetField label="مبلغ الدفعة" onChangeText={setAmount} suffix="ر.س" value={amount} />
          <View style={styles.fieldWrap}>
            <AppText style={styles.sheetSectionTitle} variant="cardTitle">تاريخ الدفعة</AppText>
            <View style={styles.datePickerRow}>
              {paymentDateOptions.map((option) => {
                const selected = option === date;

                return (
                  <Pressable
                    accessibilityLabel={formatDisplayDate(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option}
                    onPress={() => setDate(option)}
                    style={[styles.dateChip, selected && styles.dateChipActive]}
                  >
                    <AppText
                      align="center"
                      style={[styles.sheetChipText, selected && styles.dateChipTextActive]}
                      variant="caption"
                    >
                      {formatDisplayDate(option)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.fieldWrap}>
            <AppText style={styles.sheetSectionTitle} variant="cardTitle">طريقة الدفع</AppText>
            <View style={styles.sheetChips}>
              {paymentMethodOptions.map((option) => {
                const selected = option.id === method;

                return (
                  <Pressable
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={option.id}
                    onPress={() => setMethod(option.id)}
                    style={[styles.sheetChip, selected && styles.sheetChipActive]}
                  >
                    <AppText
                      align="center"
                      style={[styles.sheetChipText, selected && styles.sheetChipTextActive]}
                      variant="caption"
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SheetField label="ملاحظة" multiline onChangeText={setNote} optional value={note} />
          {error ? (
            <AppText tone="danger" variant="caption">
              {error}
            </AppText>
          ) : null}
          <AppButton iconName="checkmark-outline" onPress={handleSave}>حفظ الدفعة</AppButton>
          {Platform.OS === 'ios' ? <AppButton onPress={onClose} variant="ghost">إلغاء</AppButton> : null}
        </View>
      </View>
    </Modal>
  );
}

function SheetField({
  label,
  value,
  suffix,
  optional,
  multiline,
  onChangeText,
}: {
  label: string;
  value: string;
  suffix?: string;
  optional?: boolean;
  multiline?: boolean;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.sheetLabel}>
        {optional ? (
          <AppText tone="secondary" variant="caption">
            اختياري
          </AppText>
        ) : null}
        <AppText style={styles.sheetFieldLabel} variant="cardTitle">{label}</AppText>
      </View>
      <View style={[styles.sheetInputWrap, suffix && styles.physicalLtrRow, multiline && styles.sheetTextArea]}>
        <TextInput
          multiline={multiline}
          onChangeText={onChangeText}
          placeholderTextColor={colors.text.tertiary}
          style={[styles.sheetInput, suffix && styles.sheetNumericInput, multiline && styles.sheetTextAreaInput]}
          value={value}
        />
        {suffix ? (
          <AppText tone="secondary" variant="caption">
            {suffix}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  missingWrap: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    minHeight: 52,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitleContainer: {
    alignItems: 'flex-end',
    direction: 'rtl',
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroCard: {
    gap: spacing.lg,
  },
  reviewCard: {
    backgroundColor: '#151007',
    borderColor: 'rgba(232,163,61,0.28)',
  },
  heroTop: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.button,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  reviewIcon: {
    backgroundColor: colors.semantic.warningTint,
  },
  heroCopy: {
    alignItems: 'flex-end',
    direction: 'rtl',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  heroTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroMetrics: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  metric: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  metricValue: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  dueSummary: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.input,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
  infoRow: {
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    width: '100%',
  },
  infoLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text.primary,
    maxWidth: '58%',
    writingDirection: 'ltr',
  },
  reviewInsight: {
    backgroundColor: '#151007',
    borderColor: 'rgba(232,163,61,0.28)',
    gap: spacing.sm,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  reviewTitle: {
    color: colors.semantic.warning,
  },
  reviewText: {
    lineHeight: 24,
  },
  reviewSaving: {
    color: colors.semantic.warning,
  },
  sectionHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionHeaderTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inlineButton: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inlineButtonText: {
    color: colors.brand.calmGreen,
  },
  paymentList: {
    gap: spacing.sm,
  },
  paymentRow: {
    alignItems: 'center',
    borderTopColor: colors.surface.separator,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  paymentIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  paymentCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  paymentAmount: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  emptyPayments: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  notes: {
    alignSelf: 'stretch',
    lineHeight: 25,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.md,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  sheetGrabber: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 34,
  },
  sheetHeader: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  sheetTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  fieldWrap: {
    gap: spacing.sm,
  },
  sheetSectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sheetLabel: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sheetFieldLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sheetInputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  physicalLtrRow: {
    direction: 'ltr',
    flexDirection: 'row',
  },
  sheetInput: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sheetNumericInput: {
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  sheetTextArea: {
    alignItems: 'flex-start',
    minHeight: 92,
    paddingVertical: spacing.sm,
  },
  sheetTextAreaInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  datePickerRow: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateChip: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateChipActive: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  dateChipTextActive: {
    color: colors.brand.calmGreen,
  },
  sheetChips: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sheetChip: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sheetChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  sheetChipTextActive: {
    color: colors.text.primary,
  },
  sheetChipText: {
    writingDirection: 'rtl',
  },
});
