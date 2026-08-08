import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BusinessStageOption = {
  title: string;
  description: string;
};

const businessStageOptions: BusinessStageOption[] = [
  {
    title: 'فكرة أو بداية',
    description: 'لم تبدأ بعد أو ما زلت في أول خطواتك',
  },
  {
    title: 'بدأت تحقيق دخل',
    description: 'لديك عملاء أو مبيعات لكن الأداء ما زال غير ثابت',
  },
  {
    title: 'نشاط مستقر',
    description: 'إيرادات ومصروفات منتظمة شهريًا',
  },
  {
    title: 'في مرحلة نمو',
    description: 'توسع في الفريق أو العملاء أو الأسواق',
  },
  {
    title: 'أستعد للاستثمار',
    description: 'تجهز نشاطك لعرضه على مستثمرين',
  },
  {
    title: 'أواجه تحديات مالية',
    description: 'تحتاج وضوحًا أكبر لتجاوز الصعوبات الحالية',
  },
];

const defaultBusinessStage = 'بدأت تحقيق دخل';

export function FinancialSetupBusinessStageScreen() {
  const insets = useSafeAreaInsets();
  const [selectedStage, setSelectedStage] = useState(defaultBusinessStage);

  function handleContinue() {
    router.push(routes.financialSetupFinancialSnapshot);
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
          currentStep={3}
          onBack={() => router.push(routes.financialSetupBusinessProfile)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">ما مرحلة نشاطك الحالية؟</AppText>
        </View>

        <View accessibilityRole="radiogroup" style={styles.optionList}>
          {businessStageOptions.map((option) => {
            const selected = option.title === selectedStage;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.title}
                onPress={() => setSelectedStage(option.title)}
                style={({ pressed }) => [
                  styles.optionCard,
                  selected && styles.optionCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionBody}>
                  <AppText style={styles.rtlText} tone="primary" variant="cardTitle">
                    {option.title}
                  </AppText>
                  <AppText style={styles.rtlText} tone="secondary" variant="supporting">
                    {option.description}
                  </AppText>
                </View>

                <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected]}>
                  {selected ? <Ionicons color={colors.text.primary} name="checkmark" size={14} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
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
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
    width: '100%',
  },
  optionList: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 82,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  optionBody: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
