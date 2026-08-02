import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type ConfirmationTone = 'neutral' | 'warning' | 'danger' | 'success';

export type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmationTone;
  onConfirm: () => void;
  onCancel: () => void;
};

const toneConfig: Record<
  ConfirmationTone,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    tint: string;
    border: string;
    buttonVariant: 'primary' | 'secondary' | 'danger';
  }
> = {
  neutral: {
    icon: 'help-outline',
    color: colors.text.muted,
    tint: colors.surface.muted,
    border: colors.surface.border,
    buttonVariant: 'primary',
  },
  warning: {
    icon: 'warning-outline',
    color: colors.semantic.warning,
    tint: colors.semantic.warningTint,
    border: 'rgba(232,163,61,0.30)',
    buttonVariant: 'primary',
  },
  danger: {
    icon: 'alert-circle-outline',
    color: colors.semantic.danger,
    tint: colors.semantic.dangerTint,
    border: 'rgba(229,103,90,0.30)',
    buttonVariant: 'danger',
  },
  success: {
    icon: 'checkmark-circle-outline',
    color: colors.semantic.success,
    tint: colors.semantic.successTint,
    border: 'rgba(79,138,91,0.30)',
    buttonVariant: 'primary',
  },
};

export function ConfirmationDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'إلغاء',
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const config = toneConfig[tone];

  return (
    <Modal animationType="fade" onRequestClose={onCancel} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessibilityLabel={cancelLabel} onPress={onCancel} style={styles.backdrop} />
        <View
          accessibilityLabel={title}
          accessibilityRole="alert"
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={styles.card}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.iconWrap, { backgroundColor: config.tint, borderColor: config.border }]}
          >
            <Ionicons color={config.color} name={config.icon} size={25} />
          </View>

          <View style={styles.copy}>
            <AppText align="center" variant="sectionTitle">
              {title}
            </AppText>
            {description ? (
              <AppText align="center" style={styles.description} tone="secondary" variant="body">
                {description}
              </AppText>
            ) : null}
          </View>

          <View style={styles.actions}>
            <AppButton onPress={onConfirm} variant={config.buttonVariant}>
              {confirmLabel}
            </AppButton>
            <AppButton onPress={onCancel} variant="secondary">
              {cancelLabel}
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.xl,
    maxWidth: 430,
    padding: spacing.xl,
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  copy: {
    gap: spacing.sm,
  },
  description: {
    lineHeight: 25,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
