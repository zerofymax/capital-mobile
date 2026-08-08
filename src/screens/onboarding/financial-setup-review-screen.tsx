import { router, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPrototypeNotice } from '@/components/auth';
import { FinancialSetupProgressHeader } from '@/components/onboarding/financial-setup-progress-header';
import { AppButton, AppText, Divider } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type ReviewRow = {
  label?: string;
  value: string;
};

type ReviewSection = {
  title: string;
  editRoute: Href;
  rows: ReviewRow[];
};

const reviewSections: ReviewSection[] = [
  {
    title: 'معلومات النشاط',
    editRoute: routes.financialSetupBusinessInfo,
    rows: [
      { label: 'اسم النشاط', value: 'استوديو كابيتال' },
      { label: 'القطاع', value: 'التقنية' },
      { label: 'الدولة', value: 'المملكة العربية السعودية' },
      { label: 'العملة', value: 'الريال السعودي — ر.س' },
    ],
  },
  {
    title: 'وصف النشاط',
    editRoute: routes.financialSetupBusinessProfile,
    rows: [{ value: 'مؤسس شركة ناشئة' }],
  },
  {
    title: 'مرحلة النشاط',
    editRoute: routes.financialSetupBusinessStage,
    rows: [{ value: 'بدأت تحقيق دخل' }],
  },
  {
    title: 'الوضع المالي',
    editRoute: routes.financialSetupFinancialSnapshot,
    rows: [
      { label: 'النقد المتاح', value: '45,000 ر.س' },
      { label: 'متوسط الإيراد الشهري', value: '28,500 ر.س' },
      { label: 'متوسط المصروف الشهري', value: '19,200 ر.س' },
      { label: 'ديون أو التزامات حالية', value: 'نعم' },
    ],
  },
  {
    title: 'مصادر الدخل',
    editRoute: routes.financialSetupIncomeSources,
    rows: [{ value: 'دفعات العملاء' }, { value: 'بيع خدمات' }],
  },
  {
    title: 'المصروفات الرئيسية',
    editRoute: routes.financialSetupExpenseCategories,
    rows: [{ value: 'رواتب' }, { value: 'تسويق' }, { value: 'استضافة وخدمات سحابية' }, { value: 'إيجار' }],
  },
  {
    title: 'الالتزامات المتكررة',
    editRoute: routes.financialSetupRecurringCommitments,
    rows: [
      { value: 'اشتراكات برامج' },
      { value: 'إيجار' },
      { label: 'الإجمالي الشهري', value: '6,200 ر.س' },
      { label: 'أقرب استحقاق', value: 'أغسطس 2026' },
    ],
  },
  {
    title: 'الهدف المالي',
    editRoute: routes.financialSetupFinancialGoal,
    rows: [{ value: 'تحسين التدفق النقدي' }],
  },
  {
    title: 'طريقة إضافة البيانات',
    editRoute: routes.financialSetupDataMethod,
    rows: [{ value: 'الإدخال اليدوي' }],
  },
];

export function FinancialSetupReviewScreen() {
  const insets = useSafeAreaInsets();
  const [notice] = useState<string | null>(null);

  function handleCreateInsight() {
    router.replace(routes.financialSetupAnalyzing);
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
          currentStep={10}
          onBack={() => router.push(routes.financialSetupDataMethod)}
          totalSteps={10}
        />

        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">راجع معلومات نشاطك</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            تأكد من البيانات قبل إنشاء نظرتك المالية الأولى
          </AppText>
        </View>

        <View style={styles.reviewList}>
          {reviewSections.map((section) => (
            <ReviewCard key={section.title} section={section} />
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
          {notice ? <AuthPrototypeNotice message={notice} /> : null}
          <AppButton onPress={handleCreateInsight}>إنشاء النظرة المالية</AppButton>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.push(routes.financialSetupBusinessInfo)}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <AppText align="center" tone="secondary" variant="buttonLabel">
              تعديل البيانات
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type ReviewCardProps = {
  section: ReviewSection;
};

function ReviewCard({ section }: ReviewCardProps) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <Pressable
          accessibilityLabel={`تعديل ${section.title}`}
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.push(section.editRoute)}
          style={({ pressed }) => [styles.editAction, pressed && styles.pressed]}
        >
          <AppText tone="link" variant="supporting">
            تعديل
          </AppText>
        </Pressable>
        <AppText style={styles.cardTitle} variant="cardTitle">
          {section.title}
        </AppText>
      </View>

      <Divider />

      <View style={styles.rows}>
        {section.rows.map((row, index) => (
          <View key={`${row.label ?? row.value}-${index}`} style={styles.reviewRow}>
            {row.label ? (
              <AppText style={styles.rtlText} tone="secondary" variant="supporting">
                {row.label}
              </AppText>
            ) : null}
            <AppText style={styles.rowValue} variant="body">
              {directionSafeText(row.value)}
            </AppText>
          </View>
        ))}
      </View>
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
  reviewList: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  editAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 54,
  },
  rows: {
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  reviewRow: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.xs,
    width: '100%',
  },
  rowValue: {
    alignSelf: 'stretch',
    flexShrink: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
