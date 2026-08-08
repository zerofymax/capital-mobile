import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillPaymentMethodCard, BillSummaryCard } from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  billPaymentPrototypeNote,
  createBillPaymentReviewData,
  getPrototypeBill,
  transferLimits,
} from './operations-data';

export function BillPaymentReviewScreen() {
  const insets = useSafeAreaInsets();
  const { billId } = useLocalSearchParams<{ billId?: string }>();
  const bill = getPrototypeBill(billId);
  const review = createBillPaymentReviewData(bill);

  function handleConfirm() {
    router.push({
      pathname: routes.billPaymentSuccess,
      params: { billId: bill.id },
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
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
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="مراجعة دفع الفاتورة" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            تأكد من تفاصيل الدفع قبل المتابعة
          </AppText>
        </View>

        <BillSummaryCard
          rows={[
            { label: 'الفاتورة', value: review.billTitle },
            { label: 'المورد', value: review.vendor },
            { label: 'المبلغ', value: review.amount, ltr: true },
            { label: 'الرسوم', value: review.fee, ltr: true },
            { label: 'الإجمالي', value: review.total, ltr: true },
            { label: 'الحساب', value: review.account },
            { label: 'التنفيذ', value: review.executionTime },
          ]}
        />

        <View style={styles.section}>
          <AppText variant="sectionTitle">طريقة الدفع</AppText>
          <BillPaymentMethodCard account={transferLimits.fromAccount} balance={transferLimits.availableBalanceLabel} />
        </View>

        <SolidCard style={styles.note}>
          <View style={styles.noteIcon}>
            <Ionicons color={colors.brand.green} name="sparkles-outline" size={18} />
          </View>
          <AppText style={styles.noteText} tone="muted" variant="body">
            {billPaymentPrototypeNote}
          </AppText>
        </SolidCard>

        <View style={styles.actions}>
          <AppButton iconName="checkmark-circle-outline" onPress={handleConfirm}>
            تأكيد الدفع
          </AppButton>
          <AppButton
            iconName="create-outline"
            onPress={() =>
              router.replace({
                pathname: routes.billDetail,
                params: { billId: bill.id },
              })
            }
            variant="secondary"
          >
            تعديل
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="close-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
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
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  intro: {
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  note: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noteIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  noteText: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
