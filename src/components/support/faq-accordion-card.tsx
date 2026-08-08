import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { FaqItem } from '@/screens/support/faq-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type FaqAccordionCardProps = {
  item: FaqItem;
  onPress: (item: FaqItem) => void;
};

export function FaqAccordionCard({ item, onPress }: FaqAccordionCardProps) {
  return (
    <Pressable
      accessibilityLabel={item.question}
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(item);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.questionRow}>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={19} />
        <AppText style={styles.question} variant="body">
          {item.question}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  questionRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  question: {
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
