import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { FinancialAmount } from '@/components/financial/financial-amount';
import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type SummaryMetric = {
  key: string;
  label: string;
  value: number;
  tone: 'success' | 'danger' | 'primary';
  signed?: boolean;
};

type FinancialHeroCardProps = {
  label: string;
  amount: number;
  monthlyChange: string;
  ctaLabel: string;
  metrics: readonly SummaryMetric[];
  valuesHidden: boolean;
  onToggleVisibility: () => void;
  onCtaPress?: () => void;
  currencySymbol?: string;
};

export function FinancialHeroCard({
  label,
  amount,
  monthlyChange,
  ctaLabel,
  metrics,
  valuesHidden,
  onToggleVisibility,
  onCtaPress,
  currencySymbol,
}: FinancialHeroCardProps) {
  return (
    <View style={styles.root}>
      <View style={styles.blurFallback} />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(38,46,62,0.62)', 'rgba(20,24,32,0.58)', 'rgba(10,13,18,0.62)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.008)', 'rgba(255,255,255,0)']}
        style={styles.whiteGlow}
      />
      <LinearGradient
        colors={['rgba(79,138,91,0.055)', 'rgba(79,138,91,0.012)', 'rgba(79,138,91,0)']}
        style={styles.greenGlow}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText style={styles.heroLabel} tone="secondary" variant="body">
            {label}
          </AppText>
          <Pressable
            accessibilityLabel={valuesHidden ? 'إظهار الرصيد' : 'إخفاء الرصيد'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onToggleVisibility}
            style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.text.muted} name={valuesHidden ? 'eye-off-outline' : 'eye-outline'} size={16} />
          </Pressable>
        </View>

        <FinancialAmount currencySymbol={currencySymbol} hidden={valuesHidden} size="hero" signed value={amount} />

        <View style={styles.changeBadge}>
          <AppText style={styles.changeText} variant="caption">
            {directionSafeText(monthlyChange)}
          </AppText>
        </View>

        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <View key={metric.key} style={styles.metricCell}>
              <AppText tone="secondary" variant="caption">
                {metric.label}
              </AppText>
              <FinancialAmount
                currencySymbol={currencySymbol}
                hidden={valuesHidden}
                signed={metric.signed}
                tone={metric.tone}
                value={metric.value}
              />
            </View>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={onCtaPress} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <AppText align="center" variant="buttonLabel">
            {ctaLabel}
          </AppText>
          <Ionicons color={colors.text.primary} name="arrow-up-outline" size={14} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 32,
    borderWidth: 1,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.35), 0 22px 46px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
  blurFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.glass.fillDeep,
  },
  whiteGlow: {
    borderRadius: 34,
    height: 68,
    left: 16,
    position: 'absolute',
    top: 10,
    width: 68,
    zIndex: 0,
  },
  greenGlow: {
    borderRadius: 38,
    bottom: 16,
    height: 76,
    position: 'absolute',
    right: 14,
    width: 76,
    zIndex: 0,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: 22,
    paddingVertical: 26,
    position: 'relative',
    zIndex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: '#A7AFBB',
    fontWeight: '500',
  },
  eyeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 9,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79,138,91,0.13)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  changeText: {
    color: colors.semantic.success,
    fontWeight: '700',
  },
  metricsRow: {
    borderTopColor: 'rgba(255,255,255,0.10)',
    borderTopWidth: 1,
    direction: 'rtl',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: 18,
  },
  metricCell: {
    flex: 1,
    gap: 5,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.brand.ctaEnd,
    borderRadius: radii.button,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 14px rgba(79,138,91,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    height: 46,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
