import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type FinancialSetupProgressHeaderProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export function FinancialSetupProgressHeader({
  currentStep,
  totalSteps,
  onBack,
}: FinancialSetupProgressHeaderProps) {
  const safeTotalSteps = Math.max(totalSteps, 1);
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), safeTotalSteps);

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="العودة"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.primary} name="chevron-back-outline" size={20} />
        </Pressable>

        <View style={styles.stepBadge}>
          <View style={styles.badgeNumberRow}>
            <AppText align="center" style={styles.ltrText} variant="caption">
              {safeCurrentStep}
            </AppText>
            <AppText align="center" style={styles.ltrText} variant="caption">
              {' / '}
            </AppText>
            <AppText align="center" style={styles.ltrText} variant="caption">
              {safeTotalSteps}
            </AppText>
          </View>
        </View>
      </View>

      <View accessibilityLabel={`الخطوة ${safeCurrentStep} من ${safeTotalSteps}`} style={styles.progressTrack}>
        {Array.from({ length: safeTotalSteps }).map((_, index) => {
          const active = index >= safeTotalSteps - safeCurrentStep;

          return <View key={index} style={[styles.progressSegment, active && styles.progressSegmentActive]} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  topRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeNumberRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  progressTrack: {
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressSegment: {
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderRadius: radii.pill,
    flex: 1,
    height: 4,
  },
  progressSegmentActive: {
    backgroundColor: colors.brand.mediumGreen,
  },
  ltrText: {
    direction: 'ltr',
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
