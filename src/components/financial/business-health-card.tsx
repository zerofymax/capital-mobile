import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText } from '@/utils/rtl';

type BusinessHealthCardProps = {
  label: string;
  badgeLabel?: string;
  score: number;
  maxScore: number;
  status: string;
  description: string;
};

export function BusinessHealthCard({ label, badgeLabel, score, maxScore, status, description }: BusinessHealthCardProps) {
  const progressWidth = 62 * (score / maxScore);

  return (
    <View style={styles.root}>
      <View style={styles.scoreWrap}>
        <View style={styles.scoreRing}>
          <NumericText accessibilityLabel={`${score} من ${maxScore}`} style={styles.scoreText}>
            {score}
          </NumericText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="cardTitle">{label}</AppText>
          {badgeLabel ? (
            <View style={styles.badge}>
              <AppText style={styles.badgeText} variant="caption">
                {badgeLabel}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText tone="success" variant="supporting">
          {status}
        </AppText>
        <AppText tone="secondary" variant="supporting">
          {description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    padding: 18,
  },
  scoreWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 72,
  },
  scoreRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderColor: colors.brand.green,
    borderRadius: radii.pill,
    borderWidth: 7,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  scoreText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.pill,
    height: 4,
    overflow: 'hidden',
    width: 62,
  },
  progressFill: {
    backgroundColor: colors.brand.green,
    height: '100%',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.brand.calmGreen,
    fontSize: 11,
    lineHeight: 15,
  },
});
