import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type LoadingIndicatorProps = {
  label?: string;
};

export function LoadingIndicator({ label = 'جار التحميل...' }: LoadingIndicatorProps) {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.brand.green} />
      <AppText align="center" tone="secondary" variant="supporting">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
