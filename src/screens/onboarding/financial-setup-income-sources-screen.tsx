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

const clientPayments = 'دفعات العملاء';
const invalidSelectionMessage = 'اختر مصدر دخل واحدًا على الأقل';

const incomeSources = [
  clientPayments,
  'بيع خدمات',
  'بيع منتجات',
  'اشتراكات',
  'إعلانات أو رعايات',
  'استثمار',
  'استشارات',
  'عمولات',
  'أخرى',
] as const;

type Frequency = 'أسبوعي' | 'شهري';

export function FinancialSetupIncomeSourcesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSources, setSelectedSources] = useState<string[]>([clientPayments, 'بيع خدمات']);
  const [frequency, setFrequency] = useState<Frequency>('أسبوعي');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const showPrimaryIncomeCard = selectedSources.includes(clientPayments);

  function toggleSource(source: string) {
    setSelectionError(null);
    setSelectedSources((currentSources) => {
      if (currentSources.includes(source)) {
        return currentSources.filter((item) => item !== source);
      }

      return [...currentSources, source];
    });
  }

  function handleContinue() {
    if (selectedSources.length === 0) {
      setSelectionError(invalidSelectionMessage);
      return;
    }

    router.push(routes.financialSetupExpenseCategories);
  }

  function handleSkip() {
    setSelectionError(null);
    router.push(routes.financialSetupExpenseCategories);
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
          currentStep={5}
          onBack={() => router.push(routes.financialSetupFinancialSnapshot)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">من أين يأتي دخلك؟</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            يمكنك اختيار أكثر من مصدر
          </AppText>
        </View>

        <View style={styles.chipSection}>
          <View style={styles.chipGrid}>
            {incomeSources.map((source) => {
              const selected = selectedSources.includes(source);

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={source}
                  onPress={() => toggleSource(source)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                    {source}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {selectionError ? (
            <AppText style={styles.rtlText} tone="danger" variant="caption">
              {selectionError}
            </AppText>
          ) : null}
        </View>

        {showPrimaryIncomeCard ? (
          <View style={styles.primaryIncomeCard}>
            <AppText style={styles.rtlText} variant="cardTitle">{clientPayments}</AppText>
            <View accessibilityRole="radiogroup" style={styles.frequencyControl}>
              <FrequencyOption label="شهري" onPress={() => setFrequency('شهري')} selected={frequency === 'شهري'} />
              <FrequencyOption label="أسبوعي" onPress={() => setFrequency('أسبوعي')} selected={frequency === 'أسبوعي'} />
            </View>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
          <AppButton onPress={handleContinue}>متابعة</AppButton>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          >
            <AppText align="center" tone="secondary" variant="buttonLabel">
              تخطي الآن
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type FrequencyOptionProps = {
  label: Frequency;
  selected: boolean;
  onPress: () => void;
};

function FrequencyOption({ label, selected, onPress }: FrequencyOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.frequencyOption,
        selected && styles.frequencyOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="buttonLabel">
        {label}
      </AppText>
    </Pressable>
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
  chipSection: {
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
  },
  chipGrid: {
    direction: 'ltr',
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
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  primaryIncomeCard: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    gap: spacing.md,
    marginTop: spacing.xxxl,
    padding: spacing.lg,
  },
  frequencyControl: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  frequencyOption: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  frequencyOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.52)',
    borderColor: 'rgba(167,200,161,0.48)',
    borderWidth: 1,
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxxl,
  },
  actionArea: {
    gap: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
