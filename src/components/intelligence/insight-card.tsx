import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { InsightExpandedContent } from '@/components/intelligence/insight-expanded-content';
import { AppText } from '@/components/ui/app-text';
import type { IntelligenceInsight, InsightType } from '@/screens/intelligence/intelligence-data';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type InsightCardProps = {
  insight: IntelligenceInsight;
  expanded: boolean;
  reducedMotion: boolean;
  onPress: () => void;
  onCtaPress: () => void;
};

const insightMeta: Record<InsightType, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  forecast: { color: colors.brand.green, icon: 'trending-up-outline', label: 'توقع' },
  opportunity: { color: colors.semantic.success, icon: 'bulb-outline', label: 'فرصة' },
  risk: { color: colors.semantic.danger, icon: 'alert-circle-outline', label: 'مخاطرة' },
  warning: { color: colors.semantic.warning, icon: 'warning-outline', label: 'تنبيه' },
};

export function InsightCard({ insight, expanded, reducedMotion, onPress, onCtaPress }: InsightCardProps) {
  const meta = insightMeta[insight.type];
  const layoutTransition = LinearTransition.duration(reducedMotion ? 0 : 180);

  return (
    <Animated.View layout={layoutTransition}>
      <View style={styles.root}>
        <Pressable
          accessibilityHint={expanded ? 'اضغط لطي التفاصيل' : 'اضغط لعرض التفاصيل'}
          accessibilityLabel={`${meta.label}: ${insight.title}`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={onPress}
          style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: `${meta.color}22`,
                borderColor: `${meta.color}44`,
              },
            ]}
          >
            <Ionicons color={meta.color} name={meta.icon} size={18} />
          </View>
          <View style={styles.copy}>
            <AppText style={{ color: meta.color }} variant="caption">
              {insight.statusLabel}
            </AppText>
            <AppText numberOfLines={2} variant="cardTitle">
              {insight.title}
            </AppText>
            <AppText numberOfLines={2} tone="secondary" variant="caption">
              {directionSafeText(insight.summary)}
            </AppText>
          </View>
          <Animated.View style={[styles.chevron, expanded && styles.chevronOpen]}>
            <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
          </Animated.View>
        </Pressable>
        {expanded ? (
          <Animated.View entering={FadeIn.duration(reducedMotion ? 0 : 140)} exiting={FadeOut.duration(reducedMotion ? 0 : 100)}>
            <InsightExpandedContent accentColor={meta.color} insight={insight} onCtaPress={onCtaPress} />
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface.card,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row-reverse',
    gap: 11,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  chevron: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 28,
  },
  chevronOpen: {
    transform: [{ rotate: '-90deg' }],
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }],
  },
});
