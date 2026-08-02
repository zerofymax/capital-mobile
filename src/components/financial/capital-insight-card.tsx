import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

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
          <View style={styles.aiIcon}>
            <Ionicons color={colors.text.primary} name="sparkles-outline" size={16} />
          </View>
          <AppText style={styles.eyebrow} variant="caption">
            {directionSafeText(eyebrow)}
          </AppText>
        </View>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText tone="muted" variant="body">
          {description}
        </AppText>
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
    gap: spacing.md,
    padding: spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 9,
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
    fontWeight: '700',
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row-reverse',
    gap: 6,
    minHeight: 44,
  },
  ctaText: {
    color: colors.brand.green,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
