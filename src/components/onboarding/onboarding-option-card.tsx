import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type OnboardingOptionCardProps = {
  title: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  compact?: boolean;
  onPress: () => void;
};

export function OnboardingOptionCard({
  title,
  description,
  iconName = 'ellipse-outline',
  selected = false,
  compact = false,
  onPress,
}: OnboardingOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress();
      }}
      style={({ pressed }) => [
        styles.root,
        compact && styles.compact,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.copy}>
        <AppText style={styles.copyText} variant="cardTitle">{title}</AppText>
        {description ? (
          <AppText style={styles.copyText} tone="secondary" variant="supporting">
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons color={selected ? colors.brand.green : colors.text.secondary} name={iconName} size={20} />
      </View>
      <Ionicons
        color={selected ? colors.brand.green : colors.text.tertiary}
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 78,
    padding: spacing.lg,
  },
  compact: {
    minHeight: 62,
    paddingVertical: spacing.md,
  },
  selected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(79,138,91,0.24)',
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  copyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
