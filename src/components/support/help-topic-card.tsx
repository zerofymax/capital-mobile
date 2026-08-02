import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { HelpTopic } from '@/screens/support/support-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type HelpTopicCardProps = {
  topic: HelpTopic;
  onPress: (topic: HelpTopic) => void;
};

export function HelpTopicCard({ topic, onPress }: HelpTopicCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(topic);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.green} name={topic.icon} size={20} />
      </View>
      <View style={styles.copy}>
        <AppText numberOfLines={1} variant="cardTitle">
          {topic.title}
        </AppText>
        <AppText numberOfLines={2} tone="secondary" variant="supporting">
          {topic.description}
        </AppText>
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 94,
    padding: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
