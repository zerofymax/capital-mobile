import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalBottomSheetHeaderSurface } from '@/components/navigation/capital-bottom-sheet-header-surface';
import { AppButton, AppText } from '@/components/ui';
import type { OperationTransaction } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText, NumericText } from '@/utils/rtl';

type DeleteTransactionSheetProps = {
  visible: boolean;
  transaction: OperationTransaction;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTransactionSheet({
  visible,
  transaction,
  onCancel,
  onConfirm,
}: DeleteTransactionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable accessibilityLabel="إلغاء حذف المعاملة" onPress={onCancel} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <CapitalBottomSheetHeaderSurface />
          <View style={styles.handle} />
          <View style={styles.iconWrap}>
            <Ionicons color={colors.semantic.danger} name="trash-outline" size={24} />
          </View>
          <View style={styles.copy}>
            <AppText align="center" variant="sectionTitle">
              حذف المعاملة؟
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              سيتم حذف هذه المعاملة وتحديث الأرقام والتقارير المرتبطة بها.
            </AppText>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryCopy}>
              <AppText numberOfLines={1} variant="cardTitle">
                {transaction.title}
              </AppText>
              <AppText tone="secondary" variant="caption">
                {directionSafeText('15 يوليو 2026')}
              </AppText>
            </View>
            <NumericText
              style={[
                styles.summaryAmount,
                transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
              ]}
            >
              {transaction.type === 'income' ? '+18,500 ر.س' : transaction.amount}
            </NumericText>
          </View>

          <View style={styles.actions}>
            <AppButton onPress={onConfirm} variant="danger">
              حذف المعاملة
            </AppButton>
            <AppButton onPress={onCancel} variant="secondary">
              إلغاء
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
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
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 44,
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  copy: {
    gap: spacing.sm,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.md,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  summaryAmount: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  incomeAmount: {
    color: colors.semantic.success,
  },
  expenseAmount: {
    color: colors.semantic.danger,
  },
  actions: {
    gap: spacing.md,
  },
});
