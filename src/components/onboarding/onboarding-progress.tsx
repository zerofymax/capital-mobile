import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View style={styles.root}>
      <AppText tone="tertiary" variant="caption">
        {currentStep} / {totalSteps}
      </AppText>
      <View style={styles.track} accessibilityRole="progressbar">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const active = index < currentStep;
          return <View key={index} style={[styles.segment, active && styles.segmentActive]} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  track: {
    flexDirection: 'row-reverse',
    gap: spacing.xs,
  },
  segment: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: radii.pill,
    flex: 1,
    height: 5,
  },
  segmentActive: {
    backgroundColor: colors.brand.green,
  },
});
