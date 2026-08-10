import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { getFinancialSetupTopPadding } from '@/components/onboarding/financial-setup-layout';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type FinancialFieldKey = 'cash' | 'revenue' | 'expense';

type FinancialValues = Record<FinancialFieldKey, string>;
type FinancialErrors = Partial<Record<FinancialFieldKey, string>>;

const invalidValueMessage = 'أدخل قيمة صحيحة';

const financialFields: {
  key: FinancialFieldKey;
  label: string;
  accent?: 'success';
}[] = [
  {
    key: 'cash',
    label: 'النقد المتاح حاليًا',
  },
  {
    key: 'revenue',
    label: 'متوسط الإيراد الشهري',
    accent: 'success',
  },
  {
    key: 'expense',
    label: 'متوسط المصروف الشهري',
  },
];

const initialValues: FinancialValues = {
  cash: '45,000',
  revenue: '28,500',
  expense: '19,200',
};

function normalizeNumericInput(value: string) {
  return value.replace(/[^\d,]/g, '');
}

function isValidFinancialValue(value: string) {
  const normalized = value.replace(/,/g, '');

  return normalized.length > 0 && /^\d+$/.test(normalized) && Number(normalized) >= 0;
}

export function FinancialSetupFinancialSnapshotScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<FinancialValues>(initialValues);
  const [errors, setErrors] = useState<FinancialErrors>({});
  const [hasDebt, setHasDebt] = useState(true);

  function updateValue(key: FinancialFieldKey, value: string) {
    const nextValue = normalizeNumericInput(value);
    setValues((currentValues) => ({ ...currentValues, [key]: nextValue }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  function handleContinue() {
    const nextErrors: FinancialErrors = {};

    financialFields.forEach((field) => {
      if (!isValidFinancialValue(values[field.key])) {
        nextErrors[field.key] = invalidValueMessage;
      }
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.push(routes.financialSetupIncomeSources);
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.screenBottom),
              paddingTop: getFinancialSetupTopPadding(insets.top),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FinancialSetupProgressHeader
            currentStep={4}
            onBack={() => router.push(routes.financialSetupBusinessStage)}
            totalSteps={10}
          />

          <View style={styles.titleBlock}>
            <AppText style={styles.rtlText} variant="screenTitle">أعطنا نظرة سريعة على وضعك المالي</AppText>
            <AppText style={styles.rtlText} tone="secondary" variant="body">
              يمكنك إدخال أرقام تقريبية
            </AppText>
          </View>

          <View style={styles.fieldList}>
            {financialFields.map((field) => (
              <FinancialValueCard
                accent={field.accent}
                error={errors[field.key]}
                key={field.key}
                label={field.label}
                onChangeText={(value) => updateValue(field.key, value)}
                value={values[field.key]}
              />
            ))}
          </View>

          <View style={styles.debtSection}>
            <AppText style={styles.rtlText} variant="cardTitle">هل لديك ديون أو التزامات حالية؟</AppText>
            <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
              <DebtOption label="نعم" onPress={() => setHasDebt(true)} selected={hasDebt} />
              <DebtOption label="لا" onPress={() => setHasDebt(false)} selected={!hasDebt} />
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.actionArea}>
            <AppButton onPress={handleContinue}>متابعة</AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type FinancialValueCardProps = {
  label: string;
  value: string;
  error?: string;
  accent?: 'success';
  onChangeText: (value: string) => void;
};

function FinancialValueCard({ label, value, error, accent, onChangeText }: FinancialValueCardProps) {
  return (
    <View style={[styles.valueCard, error && styles.valueCardError]}>
      <AppText style={styles.rtlText} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <TextInput
          keyboardType="numeric"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.valueInput, accent === 'success' && styles.successValueInput]}
          value={value}
        />
        <AppText style={styles.currencySuffix} tone={accent === 'success' ? 'success' : 'primary'} variant="cardTitle">
          ر.س
        </AppText>
      </View>
      {error ? (
        <AppText style={styles.rtlText} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type DebtOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function DebtOption({ label, selected, onPress }: DebtOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentOption,
        selected && styles.segmentOptionSelected,
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
  keyboardRoot: {
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
  fieldList: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  valueCard: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  valueCardError: {
    borderColor: colors.semantic.danger,
  },
  valueRow: {
    alignItems: 'baseline',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  currencySuffix: {
    writingDirection: 'rtl',
  },
  valueInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 30,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 38,
    minHeight: 46,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  successValueInput: {
    color: colors.semantic.success,
  },
  debtSection: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    width: '100%',
  },
  segmentedControl: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  segmentOption: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentOptionSelected: {
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
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
