import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import type { LegalContentType } from '@/screens/support/support-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type LegalRowProps = {
  id: LegalContentType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isLast?: boolean;
  onPress: (id: LegalContentType) => void;
};

export function LegalRow({ id, icon, label, isLast = false, onPress }: LegalRowProps) {
  return (
    <View style={styles.block}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          Haptics.selectionAsync().catch(() => null);
          onPress(id);
        }}
        style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
        <View style={styles.iconWrap}>
          <Ionicons color={colors.text.muted} name={icon} size={19} />
        </View>
        <AppText style={styles.label} variant="body">
          {label}
        </AppText>
      </Pressable>
      {isLast ? null : <Divider />}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  root: {
    alignItems: 'center',
    direction: 'ltr',
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
