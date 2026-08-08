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
        <Ionicons color={colors.text.tertiary} name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} />
        <View style={styles.copy}>
          <AppText style={styles.copyText} variant="body">{item.question}</AppText>
          {expanded ? (
            <AppText style={styles.copyText} tone="secondary" variant="supporting">
              {item.answer}
            </AppText>
          ) : null}
        </View>
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
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
  },
  copy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  copyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
  },
});
