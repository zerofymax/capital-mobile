import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { getFinancialSetupTopPadding } from '@/components/onboarding/financial-setup-layout';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BusinessProfileOption = {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

const businessProfileOptions: BusinessProfileOption[] = [
  {
    title: 'مؤسس شركة ناشئة',
    description: 'تبني منتجًا قابلًا للنمو',
    iconName: 'rocket-outline',
  },
  {
    title: 'مستقل',
    description: 'تعمل بمفردك مع عملاء',
    iconName: 'person-outline',
  },
  {
    title: 'وكالة',
    description: 'تخدم عملاء متعددين',
    iconName: 'briefcase-outline',
  },
  {
    title: 'متجر إلكتروني',
    description: 'تبيع منتجات عبر الإنترنت',
    iconName: 'bag-handle-outline',
  },
  {
    title: 'صانع محتوى',
    description: 'دخل من المحتوى والجمهور',
    iconName: 'play-circle-outline',
  },
  {
    title: 'شركة صغيرة',
    description: 'فريق ونشاط تشغيلي ثابت',
    iconName: 'business-outline',
  },
];

const defaultBusinessProfile = 'مؤسس شركة ناشئة';

export function FinancialSetupBusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedProfile, setSelectedProfile] = useState(defaultBusinessProfile);
  const useSingleColumn = width < 360;

  function handleContinue() {
    router.push(routes.financialSetupBusinessStage);
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
            paddingTop: getFinancialSetupTopPadding(insets.top),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <FinancialSetupProgressHeader
          currentStep={2}
          onBack={() => router.push(routes.financialSetupBusinessInfo)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">كيف تصف نشاطك؟</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            اختر الوصف الأقرب لطبيعة عملك
          </AppText>
        </View>

        <View style={styles.optionGrid}>
          {businessProfileOptions.map((option) => {
            const selected = option.title === selectedProfile;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.title}
                onPress={() => setSelectedProfile(option.title)}
                style={({ pressed }) => [
                  styles.optionCard,
                  useSingleColumn && styles.optionCardSingleColumn,
                  selected && styles.optionCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  <Ionicons
                    color={selected ? colors.brand.calmGreen : colors.text.tertiary}
                    name={option.iconName}
                    size={20}
                  />
                </View>
                <View style={styles.optionCopy}>
                  <AppText style={styles.rtlText} tone={selected ? 'primary' : 'secondary'} variant="cardTitle">
                    {option.title}
                  </AppText>
                  <AppText style={styles.rtlText} tone="tertiary" variant="supporting">
                    {option.description}
                  </AppText>
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
  optionGrid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  optionCard: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    flexBasis: '47.8%',
    flexGrow: 1,
    gap: spacing.md,
    minHeight: 146,
    minWidth: 0,
    padding: spacing.lg,
  },
  optionCardSingleColumn: {
    flexBasis: '100%',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(31,90,58,0.32)',
    borderColor: 'rgba(167,200,161,0.55)',
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(79,138,91,0.20)',
    borderColor: 'rgba(167,200,161,0.48)',
  },
  optionCopy: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    minWidth: 0,
    width: '100%',
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
