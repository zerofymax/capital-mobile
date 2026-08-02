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

const invalidSelectionMessage = 'اختر تصنيف مصروف واحدًا على الأقل';

const expenseCategories = [
  'رواتب',
  'تسويق',
  'أدوات وبرامج',
  'استضافة وخدمات سحابية',
  'تطوير',
  'تصميم',
  'تشغيل',
  'إيجار',
  'خدمات قانونية',
  'سفر',
  'شحن وتوصيل',
  'أخرى',
] as const;

const defaultSelectedCategories = ['رواتب', 'تسويق', 'استضافة وخدمات سحابية', 'إيجار'];

function getSelectionCounterText(count: number) {
  if (count === 0) {
    return 'لم يتم اختيار أي تصنيف';
  }

  if (count === 1) {
    return 'تم اختيار تصنيف واحد';
  }

  if (count === 2) {
    return 'تم اختيار تصنيفين';
  }

  if (count >= 11) {
    return `تم اختيار ${count} تصنيفًا`;
  }

  return `تم اختيار ${count} تصنيفات`;
}

export function FinancialSetupExpenseCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultSelectedCategories);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  function toggleCategory(category: string) {
    setSelectionError(null);
    setSelectedCategories((currentCategories) => {
      if (currentCategories.includes(category)) {
        return currentCategories.filter((item) => item !== category);
      }

      return [...currentCategories, category];
    });
  }

  function handleContinue() {
    if (selectedCategories.length === 0) {
      setSelectionError(invalidSelectionMessage);
      return;
    }

    router.push(routes.financialSetupRecurringCommitments);
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
          currentStep={6}
          onBack={() => router.push(routes.financialSetupIncomeSources)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText variant="screenTitle">ما أبرز مصروفات نشاطك؟</AppText>
          <AppText tone="secondary" variant="body">
            {getSelectionCounterText(selectedCategories.length)}
          </AppText>
        </View>

        <View style={styles.chipSection}>
          <View style={styles.chipGrid}>
            {expenseCategories.map((category) => {
              const selected = selectedCategories.includes(category);

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={category}
                  onPress={() => toggleCategory(category)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                    {category}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {selectionError ? (
            <AppText tone="danger" variant="caption">
              {selectionError}
            </AppText>
          ) : null}
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
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  chipSection: {
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  chipGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexBasis: '46%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
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
