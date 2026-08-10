import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ConfirmationSheetProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function ConfirmationSheet({
  title,
  message,
  confirmLabel,
  cancelLabel = 'إلغاء',
  danger,
  onConfirm,
  onCancel,
}: ConfirmationSheetProps) {
  return (
    <GlassSurface radius={radii.sheet} style={styles.sheet}>
      <View style={styles.handle} />
      <AppText style={styles.copyText} variant="sectionTitle">{title}</AppText>
      <AppText style={styles.copyText} tone="secondary" variant="supporting">
        {message}
      </AppText>
      <View style={styles.actions}>
        <AppButton onPress={onConfirm} variant={danger ? 'danger' : 'primary'}>
          {confirmLabel}
        </AppButton>
        <AppButton onPress={onCancel} variant="secondary">
          {cancelLabel}
        </AppButton>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.text.tertiary,
    borderRadius: radii.pill,
    height: 4,
    opacity: 0.55,
    width: 42,
  },
  copyText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.sm,
  },
});
