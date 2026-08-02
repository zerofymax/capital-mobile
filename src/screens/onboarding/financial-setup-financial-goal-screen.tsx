import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPrototypeNotice } from '@/components/auth';
import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type FinancialGoalOption = {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

const defaultFinancialGoal = 'تحسين التدفق النقدي';
const invalidGoalMessage = 'اختر هدفك المالي للمتابعة';

const financialGoalOptions: FinancialGoalOption[] = [
  {
    title: defaultFinancialGoal,
    description: 'تنظيم حركة الأموال وتجنب نقص السيولة',
    iconName: 'wallet-outline',
  },
  {
    title: 'خفض المصروفات',
    description: 'اكتشاف فرص التوفير وتقليل الهدر',
    iconName: 'trending-down-outline',
  },
  {
    title: 'زيادة الأرباح',
    description: 'تحسين هامش الربح وزيادة العائد',
    iconName: 'trending-up-outline',
  },
  {
    title: 'متابعة صحة النشاط',
    description: 'فهم الأداء المالي بصورة مستمرة',
    iconName: 'pulse-outline',
  },
  {
    title: 'تحصيل الفواتير المتأخرة',
    description: 'متابعة المستحقات وتسريع التحصيل',
    iconName: 'receipt-outline',
  },
];

export function FinancialSetupFinancialGoalScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGoal, setSelectedGoal] = useState(defaultFinancialGoal);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function selectGoal(goal: string) {
    setNotice(null);
    setSelectionError(null);
    setSelectedGoal(goal);
  }

  function handleContinue() {
    if (!selectedGoal) {
      setNotice(null);
      setSelectionError(invalidGoalMessage);
      return;
    }

    setSelectionError(null);
    router.push(routes.financialSetupDataMethod);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.48, 1]}
        start={{ x: 0.22, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top + spacing.xl, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <FinancialSetupProgressHeader
          currentStep={8}
          onBack={() => router.push(routes.financialSetupRecurringCommitments)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText variant="screenTitle">ما هدفك المالي الأهم الآن؟</AppText>
          <AppText tone="secondary" variant="body">
            اختر هدفًا واحدًا ليبني Capital توصياته حوله
          </AppText>
        </View>

        <View accessibilityRole="radiogroup" style={styles.optionList}>
          {financialGoalOptions.map((option) => {
            const selected = option.title === selectedGoal;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.title}
                onPress={() => selectGoal(option.title)}
                style={({ pressed }) => [
                  styles.goalCard,
                  selected && styles.goalCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.goalIcon, selected && styles.goalIconSelected]}>
                  <Ionicons
                    color={selected ? colors.brand.calmGreen : colors.text.tertiary}
                    name={option.iconName}
                    size={20}
                  />
                </View>

                <View style={styles.goalCopy}>
                  <AppText tone="primary" variant="cardTitle">
                    {option.title}
                  </AppText>
                  <AppText tone="secondary" variant="supporting">
                    {option.description}
                  </AppText>
                </View>

                <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected]}>
                  {selected ? <Ionicons color={colors.text.primary} name="checkmark" size={14} /> : null}
                </View>
              </Pressable>
            );
          })}
          {selectionError ? (
            <AppText tone="danger" variant="caption">
              {selectionError}
            </AppText>
          ) : null}
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
          {notice ? <AuthPrototypeNotice message={notice} /> : null}
          <AppButton onPress={handleContinue}>متابعة</AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  titleBlock: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  optionList: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  goalCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.lg,
  },
  goalCardSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  goalIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  goalIconSelected: {
    backgroundColor: 'rgba(79,138,91,0.20)',
    borderColor: 'rgba(167,200,161,0.48)',
  },
  goalCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  selectionIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  selectionIndicatorSelected: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.calmGreen,
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxxl,
  },
  actionArea: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
