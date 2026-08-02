import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import type { FAQItem } from '@/screens/support/support-data';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type FAQRowProps = {
  item: FAQItem;
  expanded: boolean;
  isLast?: boolean;
  onPress: (item: FAQItem) => void;
};

export function FAQRow({ item, expanded, isLast = false, onPress }: FAQRowProps) {
  return (
    <View style={styles.block}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => {
          Haptics.selectionAsync().catch(() => null);
          onPress(item);
        }}
        style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      >
        <View style={styles.copy}>
          <AppText variant="body">{item.question}</AppText>
          {expanded ? (
            <AppText tone="secondary" variant="supporting">
              {item.answer}
            </AppText>
          ) : null}
        </View>
        <Ionicons color={colors.text.tertiary} name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} />
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
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 58,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.74,
  },
});
