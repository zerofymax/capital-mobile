import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { TransactionAction } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type TransactionActionRowProps = {
  action: TransactionAction;
  onPress: (action: TransactionAction) => void;
};

export function TransactionActionRow({ action, onPress }: TransactionActionRowProps) {
  const isDanger = action.tone === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(action);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <AppText style={styles.label} tone={isDanger ? 'danger' : 'primary'} variant="body">
        {action.label}
      </AppText>
      <View style={[styles.iconWrap, isDanger && styles.dangerIcon]}>
        <Ionicons color={isDanger ? colors.semantic.danger : colors.text.muted} name={action.icon} size={19} />
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
  },
  label: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
