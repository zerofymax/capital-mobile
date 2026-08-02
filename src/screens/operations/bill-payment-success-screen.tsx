import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillSuccessCard, BillSummaryCard } from '@/components/operations';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  defaultBillPaymentSuccess,
  getPrototypeBill,
  type BillPaymentSuccessData,
} from './operations-data';

export function BillPaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { billId } = useLocalSearchParams<{ billId?: string }>();
  const bill = getPrototypeBill(billId);
  const success: BillPaymentSuccessData = {
    ...defaultBillPaymentSuccess,
    amount: bill.amount,
    billTitle: bill.title,
  };

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
        <ModalHeader onClose={() => router.replace(routes.home)} title="تم إنشاء دفع تجريبي" />

        <BillSuccessCard data={success} />

        <View style={styles.section}>
          <AppText variant="sectionTitle">تفاصيل الدفع</AppText>
          <BillSummaryCard
            rows={[
              { label: 'الحالة', value: success.status },
              { label: 'الحساب', value: success.account },
              { label: 'التاريخ', value: success.date },
            ]}
          />
        </View>

        <View style={styles.actions}>
          <AppButton iconName="home-outline" onPress={() => router.replace(routes.home)}>
            العودة إلى الرئيسية
          </AppButton>
          <AppButton iconName="list-outline" onPress={() => router.replace(routes.ledger)} variant="secondary">
            عرض السجل
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
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
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
    flexDirection: 'row-reverse',
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
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  section: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
