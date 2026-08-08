import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

const androidPhysicalRtlRow = Platform.OS === 'android'
  ? { direction: 'ltr' as const, flexDirection: 'row-reverse' as const }
  : {};
const androidPhysicalRightAlignedColumn = Platform.OS === 'android'
  ? { direction: 'ltr' as const }
  : {};

type CapitalInsightCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
};

export function CapitalInsightCard({ eyebrow, title, description, ctaLabel, onPress }: CapitalInsightCardProps) {
  return (
    <View style={styles.root}>
      <View style={styles.blurFallback} />
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(24,58,46,0.55)', 'rgba(14,20,28,0.75)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <AppText style={styles.eyebrow} variant="caption">
            {directionSafeText(eyebrow)}
          </AppText>
          <View style={styles.aiIcon}>
            <Ionicons color={colors.text.primary} name="sparkles-outline" size={16} />
          </View>
        </View>
        <View style={styles.copy}>
          <AppText style={styles.copyText} variant="cardTitle">
            {title}
          </AppText>
          <AppText style={styles.copyText} tone="muted" variant="body">
            {description}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <AppText style={styles.ctaText} variant="supporting">
            {ctaLabel}
          </AppText>
          <Ionicons color={colors.brand.green} name="arrow-up-outline" size={14} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  blurFallback: {
    backgroundColor: colors.glass.fillDeep,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.md,
    padding: spacing.xl,
    position: 'relative',
    width: '100%',
    zIndex: 1,
    ...androidPhysicalRightAlignedColumn,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    width: '100%',
    ...androidPhysicalRtlRow,
  },
  aiIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.22)',
    borderColor: 'rgba(167,200,161,0.4)',
    borderRadius: radii.small,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  eyebrow: {
    color: colors.brand.link,
    flex: 1,
    fontWeight: '700',
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  copy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    gap: spacing.md,
    minWidth: 0,
    width: '100%',
    ...androidPhysicalRightAlignedColumn,
  },
  copyText: {
    alignSelf: 'stretch',
    flexShrink: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'rtl',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-start',
    minHeight: 44,
    ...androidPhysicalRtlRow,
  },
  ctaText: {
    color: colors.brand.green,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
