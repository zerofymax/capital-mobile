import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type CardActionItem = {
  id: 'freeze' | 'limits' | 'number' | 'settings';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'warning';
};

type CardActionGridProps = {
  actions: CardActionItem[];
  onPress: (action: CardActionItem) => void;
};

export function CardActionGrid({ actions, onPress }: CardActionGridProps) {
  return (
    <View style={styles.root}>
      {actions.map((action) => {
        const warning = action.tone === 'warning';

        return (
          <Pressable
            accessibilityRole="button"
            key={action.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => null);
              onPress(action);
            }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, warning && styles.warningIcon]}>
              <Ionicons color={warning ? colors.semantic.warning : colors.text.muted} name={action.icon} size={20} />
            </View>
            <AppText align="center" numberOfLines={2} tone={warning ? 'warning' : 'primary'} variant="caption">
              {action.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 94,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  warningIcon: {
    backgroundColor: colors.semantic.warningTint,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
