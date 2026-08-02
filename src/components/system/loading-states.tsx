import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function FullScreenLoader({ label = 'تحميل كامل للتطبيق' }: { label?: string }) {
  return (
    <SolidCard style={styles.centerCard}>
      <ActivityIndicator accessibilityLabel={label} color={colors.brand.calmGreen} size="large" />
      <AppText align="center" tone="secondary" variant="supporting">
        {label}
      </AppText>
    </SolidCard>
  );
}

export function InlineLoader({ label = 'جار التحميل...' }: { label?: string }) {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator accessibilityLabel={label} color={colors.brand.calmGreen} size="small" />
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
    </View>
  );
}

export function SkeletonCard({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const opacity = useSkeletonOpacity(reducedMotion);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.skeletonCard, { opacity }]}
    >
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.shortLine]} />
    </Animated.View>
  );
}

export function SkeletonRow({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const opacity = useSkeletonOpacity(reducedMotion);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.skeletonRow, { opacity }]}
    >
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonRowCopy}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.shortLine]} />
      </View>
    </Animated.View>
  );
}

export function ProgressButton({
  label = 'جاري الحفظ',
  loading = true,
  onPress,
}: {
  label?: string;
  loading?: boolean;
  onPress?: () => void;
}) {
  return (
    <AppButton disabled={loading} loading={loading} onPress={onPress}>
      {label}
    </AppButton>
  );
}

export function ReportGenerationLoader({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <SolidCard style={styles.reportLoader}>
      <InlineLoader label="جاري تجهيز تقريرك الشهري..." />
      <View style={styles.skeletonStack}>
        <SkeletonRow reducedMotion={reducedMotion} />
        <SkeletonRow reducedMotion={reducedMotion} />
      </View>
      <AppText tone="secondary" variant="caption">
        مع تفعيل «تقليل الحركة» تستبدل الدورانات بنبض ثابت خفيف.
      </AppText>
    </SolidCard>
  );
}

function useSkeletonOpacity(reducedMotion: boolean) {
  const [opacity] = useState(() => new Animated.Value(reducedMotion ? 0.58 : 0.42));

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.58);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 760,
          toValue: 0.78,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 760,
          toValue: 0.42,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, reducedMotion]);

  return opacity;
}

const styles = StyleSheet.create({
  centerCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  inlineLoader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 112,
    padding: spacing.lg,
  },
  skeletonRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 70,
    padding: spacing.md,
  },
  skeletonAvatar: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    height: 38,
    width: 38,
  },
  skeletonRowCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonTitle: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    height: 18,
    width: '46%',
  },
  skeletonLine: {
    backgroundColor: colors.surface.muted,
    borderRadius: radii.pill,
    height: 12,
    width: '100%',
  },
  shortLine: {
    width: '62%',
  },
  reportLoader: {
    gap: spacing.md,
  },
  skeletonStack: {
    gap: spacing.sm,
  },
});
