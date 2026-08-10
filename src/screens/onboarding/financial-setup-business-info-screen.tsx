import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput, RegisterSelectField } from '@/components/auth';
import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { getFinancialSetupTopPadding } from '@/components/onboarding/financial-setup-layout';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { businessSectorOptions, countryOptions, currencyOptions } from '@/screens/onboarding/onboarding-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function FinancialSetupBusinessInfoScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [businessName, setBusinessName] = useState('');
  const [sector, setSector] = useState('التقنية');
  const [country, setCountry] = useState('المملكة العربية السعودية');
  const [currency, setCurrency] = useState('الريال السعودي — ر.س — SAR');
  const [businessNameError, setBusinessNameError] = useState<string | undefined>();
  const stackSelects = width < 430;

  function handleContinue() {
    if (!businessName.trim()) {
      setBusinessNameError('أدخل اسم النشاط للمتابعة');
      return;
    }

    setBusinessNameError(undefined);
    router.push(routes.financialSetupBusinessProfile);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.register);
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
            currentStep={1}
            onBack={handleBack}
            totalSteps={10}
          />

          <View style={styles.titleBlock}>
            <AppText style={styles.rtlText} variant="screenTitle">معلومات النشاط</AppText>
            <AppText style={styles.rtlText} tone="secondary" variant="body">
              أساسيات نحتاجها لبناء نظرتك المالية
            </AppText>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <AuthInput
                error={businessNameError}
                label="اسم النشاط"
                onChangeText={(value) => {
                  setBusinessName(value);
                  if (value.trim()) {
                    setBusinessNameError(undefined);
                  }
                }}
                placeholder="استوديو كابيتال"
                returnKeyType="done"
                rtlLayout
                value={businessName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <AppText style={styles.rtlText} tone="secondary" variant="supporting">
                القطاع
              </AppText>
              <View style={styles.chipGrid}>
                {businessSectorOptions.map((item) => {
                  const selected = item === sector;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={item}
                      onPress={() => setSector(item)}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && styles.chipSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <AppText align="center" tone={selected ? 'primary' : 'secondary'} variant="supporting">
                        {item}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={[styles.selectRow, stackSelects && styles.selectRowStacked]}>
              <RegisterSelectField label="الدولة" onSelect={setCountry} options={countryOptions} value={country} />
              <RegisterSelectField label="العملة" onSelect={setCurrency} options={currencyOptions} value={currency} />
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
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
    width: '100%',
  },
  form: {
    gap: spacing.xxl,
    paddingTop: spacing.xxxl,
    width: '100%',
  },
  fieldGroup: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
    width: '100%',
  },
  fieldWrapper: {
    alignItems: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  selectRow: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  selectRowStacked: {
    flexDirection: 'column',
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
