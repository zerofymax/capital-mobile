import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, message, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Ionicons color={colors.text.muted} name="file-tray-outline" size={24} />
      </View>
      <AppText align="center" variant="cardTitle">
        {title}
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        {message}
      </AppText>
      {actionLabel ? (
        <AppButton onPress={onActionPress} variant="secondary">
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.glass.overlay,
    borderRadius: radii.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
});
