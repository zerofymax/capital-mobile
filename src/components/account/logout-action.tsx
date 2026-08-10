import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type LogoutActionProps = {
  confirming: boolean;
  onRequest: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LogoutAction({ confirming, onRequest, onCancel, onConfirm }: LogoutActionProps) {
  if (confirming) {
    return (
      <View style={styles.confirmCard}>
        <View style={styles.confirmHeader}>
          <Ionicons color={colors.semantic.danger} name="log-out-outline" size={18} />
          <AppText style={styles.dangerText} variant="cardTitle">
            تسجيل الخروج؟
          </AppText>
        </View>
        <AppText style={styles.confirmDescription} tone="secondary" variant="body">
          {directionSafeText('سيتم إنهاء الجلسة الحالية التجريبية فقط.')}
        </AppText>
        <View style={styles.actions}>
          <AppButton onPress={onCancel} style={styles.actionButton} variant="secondary">
            إلغاء
          </AppButton>
          <AppButton onPress={onConfirm} style={styles.actionButton} variant="danger">
            تسجيل الخروج
          </AppButton>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel="تسجيل الخروج"
      accessibilityRole="button"
      onPress={onRequest}
      style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
    >
      <Ionicons color={colors.semantic.danger} name="log-out-outline" size={18} />
      <AppText style={styles.dangerText} variant="buttonLabel">
        تسجيل الخروج
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(229,103,90,0.08)',
    borderColor: 'rgba(229,103,90,0.22)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  confirmCard: {
    backgroundColor: 'rgba(229,103,90,0.08)',
    borderColor: 'rgba(229,103,90,0.22)',
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  confirmHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  confirmDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  actions: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
  },
  dangerText: {
    color: colors.semantic.danger,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
