import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type UnsavedChangesModalProps = {
  visible: boolean;
  onContinueEditing: () => void;
  onDiscardChanges: () => void;
};

export function UnsavedChangesModal({
  visible,
  onContinueEditing,
  onDiscardChanges,
}: UnsavedChangesModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onContinueEditing}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable accessibilityLabel="متابعة التعديل" onPress={onContinueEditing} style={styles.backdrop} />
        <View
          accessibilityLabel="لديك تغييرات غير محفوظة"
          accessibilityRole="alert"
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={styles.card}
        >
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.warningIcon}>
            <Ionicons color={colors.semantic.warning} name="warning-outline" size={24} />
          </View>
          <View style={styles.copy}>
            <AppText align="center" variant="sectionTitle">
              لديك تغييرات غير محفوظة
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              هل تريد تجاهل التعديلات والعودة؟
            </AppText>
          </View>
          <View style={styles.actions}>
            <AppButton onPress={onContinueEditing}>متابعة التعديل</AppButton>
            <AppButton onPress={onDiscardChanges} variant="secondary">
              تجاهل التغييرات
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
    padding: spacing.xl,
    width: '100%',
  },
  warningIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  copy: {
    gap: spacing.sm,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
