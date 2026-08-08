import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { IntelligenceInsight } from '@/screens/intelligence/intelligence-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type InsightExpandedContentProps = {
  insight: IntelligenceInsight;
  accentColor: string;
  onCtaPress: () => void;
};

export function InsightExpandedContent({ insight, accentColor, onCtaPress }: InsightExpandedContentProps) {
  return (
    <View style={styles.root}>
      <AppText align="right" style={styles.explanation} tone="muted" variant="supporting">
        {directionSafeText(insight.explanation)}
      </AppText>
      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
            الأثر المتوقع
          </AppText>
          <AppText align="right" style={[styles.impactValue, { color: accentColor }]} variant="supporting">
            {directionSafeText(insight.estimatedImpact)}
          </AppText>
        </View>
        <View style={styles.detailItem}>
          <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
            الإجراء التالي
          </AppText>
          <AppText align="right" numberOfLines={3} style={styles.rtlText} variant="supporting">
            {directionSafeText(insight.recommendedAction)}
          </AppText>
        </View>
      </View>
      {insight.ctaLabel ? (
        <Pressable
          accessibilityLabel={insight.ctaLabel}
          accessibilityRole="button"
          onPress={onCtaPress}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: `${accentColor}24`,
              borderColor: `${accentColor}55`,
            },
            pressed && styles.pressed,
          ]}
        >
          <AppText align="center" style={{ color: accentColor }} variant="supporting">
            {insight.ctaLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    width: '100%',
  },
  explanation: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  detailGrid: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  detailItem: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
    width: '100%',
  },
  impactValue: {
    alignSelf: 'stretch',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  cta: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
