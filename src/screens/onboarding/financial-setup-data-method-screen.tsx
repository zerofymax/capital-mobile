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

type DataMethodOption = {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  statusLabel?: string;
};

const defaultDataMethod = 'الإدخال اليدوي';
const invalidMethodMessage = 'اختر طريقة إضافة البيانات للمتابعة';

const dataMethodOptions: DataMethodOption[] = [
  {
    title: defaultDataMethod,
    description: 'أضف الإيرادات والمصروفات بنفسك',
    iconName: 'create-outline',
  },
  {
    title: 'رفع ملف CSV',
    description: 'استورد بياناتك من ملف جاهز',
    iconName: 'cloud-upload-outline',
    statusLabel: 'قريبًا',
  },
  {
    title: 'ربط الحساب البنكي',
    description: 'اربط حسابك لعرض العمليات تلقائيًا',
    iconName: 'link-outline',
    statusLabel: 'قريبًا',
  },
  {
    title: 'التخطي والبدء ببيانات تقديرية',
    description: 'ابدأ الآن ويمكنك إضافة البيانات لاحقًا',
    iconName: 'time-outline',
  },
];

export function FinancialSetupDataMethodScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState(defaultDataMethod);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  function selectMethod(method: string) {
    setSelectionError(null);
    setSelectedMethod(method);
  }

  function handleContinue() {
    if (!selectedMethod) {
      setSelectionError(invalidMethodMessage);
      return;
    }

    setSelectionError(null);
    router.push(routes.financialSetupReview);
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
          currentStep={9}
          onBack={() => router.push(routes.financialSetupFinancialGoal)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">كيف تريد إضافة بياناتك؟</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            اختر الطريقة الأنسب لك الآن
          </AppText>
        </View>

        <View accessibilityRole="radiogroup" style={styles.optionList}>
          {dataMethodOptions.map((option) => {
            const selected = option.title === selectedMethod;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.title}
                onPress={() => selectMethod(option.title)}
                style={({ pressed }) => [
                  styles.methodCard,
                  selected && styles.methodCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.methodIcon, selected && styles.methodIconSelected]}>
                  <Ionicons
                    color={selected ? colors.brand.calmGreen : colors.text.tertiary}
                    name={option.iconName}
                    size={20}
                  />
                </View>

                <View style={styles.methodCopy}>
                  <View style={styles.methodTitleRow}>
                    <AppText style={styles.methodTitle} tone="primary" variant="cardTitle">
                      {option.title}
                    </AppText>
                    {option.statusLabel ? (
                      <View style={styles.statusBadge}>
                        <AppText align="center" tone="tertiary" variant="caption">
                          {option.statusLabel}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
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
          {selectionError ? (
            <AppText style={styles.rtlText} tone="danger" variant="caption">
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
  methodCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 92,
    padding: spacing.lg,
  },
  methodCardSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  methodIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  methodIconSelected: {
    backgroundColor: 'rgba(79,138,91,0.20)',
    borderColor: 'rgba(167,200,161,0.48)',
  },
  methodCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  methodTitleRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  methodTitle: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
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
