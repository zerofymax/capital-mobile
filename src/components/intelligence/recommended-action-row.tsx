import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { RecommendedAction } from '@/screens/intelligence/intelligence-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type RecommendedActionRowProps = {
  action: RecommendedAction;
  completed: boolean;
  isLast?: boolean;
  onPress: () => void;
};

export function RecommendedActionRow({ action, completed, isLast = false, onPress }: RecommendedActionRowProps) {
  return (
    <Pressable
      accessibilityLabel={action.title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.root, !isLast && styles.withBorder, pressed && styles.pressed]}
    >
      <View style={[styles.priority, completed && styles.priorityDone]}>
        {completed ? (
          <Ionicons color={colors.semantic.success} name="checkmark-outline" size={16} />
        ) : (
          <AppText align="center" style={styles.priorityText} variant="caption">
            {action.priority}
          </AppText>
        )}
      </View>
      <View style={styles.copy}>
        <AppText numberOfLines={1} style={completed && styles.completedTitle} variant="body">
          {action.title}
        </AppText>
        <AppText numberOfLines={2} tone="secondary" variant="caption">
          {directionSafeText(action.description)}
        </AppText>
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  withBorder: {
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
  },
  priority: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.14)',
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.small,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  priorityDone: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.35)',
  },
  priorityText: {
    color: colors.brand.green,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  completedTitle: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
