import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { OnboardingProgress } from './onboarding-progress';

const ACTIONS_MIN_HEIGHT = 132;

type OnboardingShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  actions: ReactNode;
  notice?: ReactNode;
  keyboardAware?: boolean;
}>;

export function OnboardingShell({
  title,
  subtitle,
  currentStep,
  totalSteps,
  actions,
  notice,
  keyboardAware = false,
  children,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = ACTIONS_MIN_HEIGHT + Math.max(insets.bottom, spacing.md) + spacing.xxl;

  return (
    <KeyboardAvoidingView
      behavior={keyboardAware ? (Platform.OS === 'ios' ? 'padding' : 'height') : undefined}
      style={styles.root}
    >
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.48, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomPadding,
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText style={styles.label} variant="caption">
            إعداد Capital
          </AppText>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
          <View style={styles.copy}>
            <AppText style={styles.copyText} variant="screenTitle">{title}</AppText>
            <AppText style={styles.copyText} tone="secondary" variant="supporting">
              {subtitle}
            </AppText>
          </View>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
      <View
        style={[
          styles.actionsWrap,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}
      >
        {notice}
        <View style={styles.actions}>{actions}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.xxl,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.lg,
    width: '100%',
  },
  label: {
    alignSelf: 'stretch',
    color: colors.brand.link,
    fontWeight: '700',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  copy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  copyText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  body: {
    gap: spacing.lg,
  },
  actionsWrap: {
    backgroundColor: 'transparent',
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
  },
  actions: {
    gap: spacing.sm,
  },
});
