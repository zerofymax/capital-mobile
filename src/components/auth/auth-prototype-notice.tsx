import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type AuthPrototypeNoticeProps = {
  message: string;
  tone?: 'warning' | 'danger';
};

export function AuthPrototypeNotice({ message, tone = 'warning' }: AuthPrototypeNoticeProps) {
  const color = tone === 'danger' ? colors.semantic.danger : colors.semantic.warning;
  const backgroundColor = tone === 'danger' ? colors.semantic.dangerTint : colors.semantic.warningTint;
  const borderColor = tone === 'danger' ? 'rgba(229,103,90,0.24)' : 'rgba(232,163,61,0.24)';

  return (
    <View accessibilityLiveRegion="polite" style={[styles.root, { backgroundColor, borderColor }]}>
      <Ionicons color={color} name="information-circle-outline" size={17} />
      <AppText style={[styles.text, { color }]} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
