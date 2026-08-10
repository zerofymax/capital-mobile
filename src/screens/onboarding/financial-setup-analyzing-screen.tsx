import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { getFinancialSetupTopPadding } from '@/components/onboarding/financial-setup-layout';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const stageDurationMs = 850;
const finalDelayMs = 700;

const analysisStages = [
  'مراجعة معلومات النشاط',
  'تحليل الإيرادات والمصروفات',
  'تقييم التدفق النقدي',
  'تحديد الالتزامات والمخاطر',
  'إعداد التوصيات المالية',
] as const;

export function FinancialSetupAnalyzingScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [pulseValue] = useState(() => new Animated.Value(0));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [completedStages, setCompletedStages] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      pulseValue.setValue(1);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          duration: 1100,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          duration: 1100,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseValue, reducedMotion]);

  useEffect(() => {
    timers.current = analysisStages.map((_, index) =>
      setTimeout(() => {
        setCompletedStages(index + 1);
      }, stageDurationMs * (index + 1)),
    );

    timers.current.push(
      setTimeout(() => {
        setAnalysisComplete(true);
        router.replace(routes.financialSetupReady);
      }, stageDurationMs * analysisStages.length + finalDelayMs),
    );

    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const ringScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });
  const ringOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.32, 0.08],
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.22, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxxl),
            paddingTop: getFinancialSetupTopPadding(insets.top),
          },
        ]}
      >
        <View style={styles.mainArea}>
          <View accessibilityLabel="جاري تحليل وضع نشاطك المالي" style={styles.analysisVisual}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: reducedMotion ? 0.14 : ringOpacity,
                  transform: [{ scale: reducedMotion ? 1.05 : ringScale }],
                },
              ]}
            />
            <View style={styles.visualCore}>
              <Ionicons color={colors.brand.calmGreen} name="analytics-outline" size={42} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <AppText align="center" variant="screenTitle">
              Capital يحلل وضع نشاطك
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              نحوّل بياناتك إلى نظرة مالية واضحة ومخصصة لنشاطك
            </AppText>
          </View>

          <View style={styles.progressTextWrap}>
            <View style={styles.progressNumberRow}>
              <AppText align="center" style={styles.ltrText} tone="secondary" variant="caption">
                {Math.min(completedStages + 1, analysisStages.length)}
              </AppText>
              <AppText align="center" tone="secondary" variant="caption">
                {' من '}
              </AppText>
              <AppText align="center" style={styles.ltrText} tone="secondary" variant="caption">
                {analysisStages.length}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.stagesCard}>
          {analysisStages.map((stage, index) => {
            const isComplete = completedStages > index;
            const isActive = !analysisComplete && completedStages === index;
            const statusText = isComplete ? 'اكتمل' : isActive ? 'جاري التحليل' : '';

            return (
              <View accessibilityLabel={`${stage} ${statusText}`} key={stage} style={styles.stageRow}>
                <StageIndicator isActive={isActive} isComplete={isComplete} />
                <View style={styles.stageCopy}>
                  <AppText style={styles.stageText} tone={isComplete || isActive ? 'primary' : 'tertiary'} variant="supporting">
                    {stage}
                  </AppText>
                  {statusText ? (
                    <AppText style={styles.stageText} tone={isComplete ? 'success' : 'link'} variant="caption">
                      {statusText}
                    </AppText>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomArea}>
          <AppText align="center" tone={analysisComplete ? 'success' : 'tertiary'} variant="supporting">
            لن يستغرق الأمر سوى لحظات
          </AppText>
        </View>
      </View>
    </View>
  );
}

type StageIndicatorProps = {
  isComplete: boolean;
  isActive: boolean;
};

function StageIndicator({ isComplete, isActive }: StageIndicatorProps) {
  if (isComplete) {
    return (
      <View style={[styles.stageIndicator, styles.stageIndicatorComplete]}>
        <Ionicons color={colors.text.primary} name="checkmark" size={13} />
      </View>
    );
  }

  return <View style={[styles.stageIndicator, isActive && styles.stageIndicatorActive]} />;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.xxl,
    paddingHorizontal: spacing.screenX,
  },
  mainArea: {
    alignItems: 'center',
    gap: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  analysisVisual: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  pulseRing: {
    backgroundColor: 'rgba(79,138,91,0.22)',
    borderColor: 'rgba(167,200,161,0.32)',
    borderRadius: 75,
    borderWidth: 1,
    height: 150,
    position: 'absolute',
    width: 150,
  },
  visualCore: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.28)',
    borderColor: 'rgba(167,200,161,0.42)',
    borderRadius: 54,
    borderWidth: 1,
    height: 108,
    justifyContent: 'center',
    width: 108,
  },
  copyBlock: {
    gap: spacing.sm,
    maxWidth: 320,
  },
  progressTextWrap: {
    alignItems: 'center',
  },
  progressNumberRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
  },
  ltrText: {
    direction: 'ltr',
    writingDirection: 'ltr',
  },
  stagesCard: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  stageRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 42,
  },
  stageIndicator: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  stageIndicatorActive: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.calmGreen,
    boxShadow: '0 0 18px rgba(79,138,91,0.36)',
  },
  stageIndicatorComplete: {
    alignItems: 'center',
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.calmGreen,
    justifyContent: 'center',
  },
  stageCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  stageText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  bottomArea: {
    gap: spacing.md,
    marginTop: 'auto',
  },
});
