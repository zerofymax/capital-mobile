import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionPriceLine, SubscriptionSectionHeading } from '@/components/account';
import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  annualBillingMessage,
  businessUpgradeMessage,
  subscriptionPlans,
  subscriptionPrototypeNotice,
  type SubscriptionPlan,
} from './subscription-data';

type BillingCycle = 'monthly' | 'annual';

type ComparisonRow = {
  id: string;
  label: string;
  basic: string;
  pro: string;
  business: string;
};

const comparisonRows: ComparisonRow[] = [
  { id: 'transactions', label: 'تسجيل المعاملات', basic: 'متاح', pro: 'متاح', business: 'متاح' },
  { id: 'advanced-reports', label: 'التقارير المتقدمة', basic: 'محدود', pro: 'متاح', business: 'متاح' },
  { id: 'capital-insights', label: 'رؤى Capital', basic: 'غير متاح', pro: 'متاح', business: 'متاح' },
  { id: 'exports', label: 'تصدير التقارير', basic: 'محدود', pro: '10 شهريًا', business: 'غير محدود' },
  { id: 'devices', label: 'عدد الأجهزة', basic: '1', pro: '3', business: '10' },
  { id: 'users', label: 'المستخدمون', basic: '1', pro: '1', business: 'حتى 5' },
  { id: 'support', label: 'الدعم', basic: 'عادي', pro: 'أولوية', business: 'مخصص' },
];

export function ComparePlansScreen() {
  const insets = useSafeAreaInsets();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [downgradeDialogVisible, setDowngradeDialogVisible] = useState(false);

  function goBackToSubscription() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.currentSubscription);
  }

  function handleCyclePress(cycle: BillingCycle) {
    Haptics.selectionAsync().catch(() => null);
    if (cycle === 'annual') {
      showFeedback(annualBillingMessage);
      return;
    }

    setBillingCycle(cycle);
  }

  function showFeedback(message: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setFeedback(message);
  }

  function handlePlanAction(plan: SubscriptionPlan) {
    if (plan.isCurrent) {
      return;
    }

    if (plan.id === 'basic') {
      Haptics.selectionAsync().catch(() => null);
      setFeedback(null);
      setDowngradeDialogVisible(true);
      return;
    }

    showFeedback(businessUpgradeMessage);
  }

  function handleDowngradeConfirm() {
    setDowngradeDialogVisible(false);
    showFeedback('سيتم توفير خفض الخطة لاحقًا');
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <ComparePlansHeader onBackPress={goBackToSubscription} />
        <PrototypeNotice message={subscriptionPrototypeNotice} />
        <BillingCycleSelector selectedCycle={billingCycle} onCyclePress={handleCyclePress} />

        <AnnualSavingsCard />

        <View style={styles.planStack}>
          {subscriptionPlans.map((plan) => (
            <PlanCard billingCycle={billingCycle} key={plan.id} onActionPress={() => handlePlanAction(plan)} plan={plan} />
          ))}
        </View>

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="warning" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <RecommendationCard />
        <ComparisonSection />
        <SupportCard />
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="متابعة"
        description="قد تفقد الوصول إلى بعض المزايا المتقدمة. لن يتم تغيير اشتراك حقيقي في هذا النموذج."
        onCancel={() => setDowngradeDialogVisible(false)}
        onConfirm={handleDowngradeConfirm}
        title="الانتقال إلى الخطة الأساسية؟"
        tone="warning"
        visible={downgradeDialogVisible}
      />
    </View>
  );
}

function ComparePlansHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الاشتراك الحالي"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" numberOfLines={1} style={styles.fullWidthRtlText} variant="screenTitle">
          مقارنة الخطط
        </AppText>
        <AppText align="right" style={styles.fullWidthRtlText} tone="secondary" variant="caption">
          اختر الخطة المناسبة لاحتياجات نشاطك
        </AppText>
      </View>
    </View>
  );
}

function PrototypeNotice({ message }: { message: string }) {
  return (
    <SolidCard style={styles.prototypeNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.feedbackText} tone="secondary" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function BillingCycleSelector({
  selectedCycle,
  onCyclePress,
}: {
  selectedCycle: BillingCycle;
  onCyclePress: (cycle: BillingCycle) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      <CycleOption cycle="monthly" label="شهري" selected={selectedCycle === 'monthly'} onPress={onCyclePress} />
      <CycleOption cycle="annual" label="سنوي" selected={selectedCycle === 'annual'} onPress={onCyclePress} showSavingsBadge />
    </View>
  );
}

function CycleOption({
  cycle,
  label,
  selected,
  showSavingsBadge = false,
  onPress,
}: {
  cycle: BillingCycle;
  label: string;
  selected: boolean;
  showSavingsBadge?: boolean;
  onPress: (cycle: BillingCycle) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(cycle)}
      style={({ pressed }) => [styles.segmentOption, selected && styles.segmentOptionSelected, pressed && styles.pressed]}
    >
      <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {label}
      </AppText>
      {showSavingsBadge ? (
        <View style={styles.savingsBadge}>
          <AppText align="center" tone="success" variant="caption">
            وفّر 20%
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

function AnnualSavingsCard() {
  return (
    <SolidCard style={styles.savingsCard}>
      <Ionicons color={colors.brand.calmGreen} name="trending-up-outline" size={20} />
      <View style={styles.savingsCopy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">وفّر عند الدفع السنوي</AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          {directionSafeText('470 ر.س سنويًا بدلًا من 588 ر.س. توفير 118 ر.س سنويًا.')}
        </AppText>
        <AppText style={styles.fullWidthRtlText} tone="tertiary" variant="caption">
          الفوترة السنوية قادمة لاحقًا ولا تغيّر الاشتراك الحالي.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PlanCard({
  plan,
  billingCycle,
  onActionPress,
}: {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  onActionPress: () => void;
}) {
  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const period = billingCycle === 'monthly' ? 'شهريًا' : 'سنويًا';
  const actionLabel =
    plan.id === 'basic'
      ? 'الانتقال إلى الأساسية'
      : plan.id === 'pro'
        ? 'الخطة الحالية'
        : 'الترقية إلى Capital Business';

  return (
    <SolidCard
      accessibilityLabel={`${plan.name}. ${plan.arabicLabel}. ${price} ${plan.currency} ${period}. ${
        plan.isCurrent ? 'خطتك الحالية.' : ''
      } ${plan.isPopular ? 'الأكثر استخدامًا.' : ''}`}
      style={[styles.planCard, plan.isCurrent && styles.currentPlanCard, plan.id === 'business' && styles.businessPlanCard]}
    >
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Ionicons
            color={plan.id === 'business' ? colors.brand.calmGreen : colors.brand.green}
            name={plan.id === 'basic' ? 'leaf-outline' : plan.id === 'pro' ? 'sparkles-outline' : 'briefcase-outline'}
            size={22}
          />
        </View>
        <View style={styles.badgeStack}>
          {plan.isCurrent ? <PlanBadge label="خطتك الحالية" tone="success" /> : null}
          {plan.isPopular ? <PlanBadge label="الأكثر استخدامًا" tone="success" /> : null}
        </View>
        <View style={styles.planCopy}>
          <AppText align="right" style={styles.planName} variant="cardTitle">
            {plan.name}
          </AppText>
          <AppText style={styles.fullWidthRtlText} tone="secondary" variant="caption">
            {plan.arabicLabel}
          </AppText>
        </View>
      </View>

      <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
        {plan.description}
      </AppText>

      <View style={styles.priceBlock}>
        <SubscriptionPriceLine amount={`${price} ${plan.currency}`} period={period} style={styles.priceText} />
        {billingCycle === 'annual' && plan.annualMonthlyEquivalent ? (
          <AppText style={styles.fullWidthRtlText} tone="tertiary" variant="caption">
            يعادل نحو {plan.annualMonthlyEquivalent} ر.س شهريًا
          </AppText>
        ) : null}
      </View>

      <View style={styles.featureList}>
        {plan.features.map((feature) => (
          <View key={feature.id} style={styles.featureRow}>
            <View style={[styles.featureIcon, !feature.included && styles.unavailableIcon]}>
              <Ionicons
                color={feature.included ? colors.brand.calmGreen : colors.text.tertiary}
                name={feature.included ? 'checkmark-outline' : 'close-outline'}
                size={15}
              />
            </View>
            <AppText style={[styles.featureText, styles.rtlText]} tone={feature.included ? 'primary' : 'tertiary'} variant="caption">
              {feature.label}
            </AppText>
          </View>
        ))}
      </View>

      <AppButton disabled={plan.isCurrent} onPress={onActionPress} variant={plan.id === 'basic' ? 'secondary' : 'primary'}>
        {actionLabel}
      </AppButton>
    </SolidCard>
  );
}

function RecommendationCard() {
  return (
    <SolidCard style={styles.recommendationCard}>
      <Ionicons color={colors.brand.calmGreen} name="bulb-outline" size={20} />
      <View style={styles.recommendationCopy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">الخطة الأنسب لك حاليًا</AppText>
        <AppText align="right" style={styles.planName} tone="success" variant="body">
          Capital Pro
        </AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          تناسب مستوى استخدامك الحالي وتمنحك التقارير والرؤى التي تحتاجها.
        </AppText>
      </View>
    </SolidCard>
  );
}

function ComparisonSection() {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>مقارنة المزايا</SubscriptionSectionHeading>
      <SolidCard style={styles.comparisonCard}>
        <View style={styles.comparisonHeader}>
          <AppText style={styles.comparisonFeatureHeader} tone="secondary" variant="caption">
            الميزة
          </AppText>
          <AppText align="center" style={styles.planColumn} variant="caption">
            Basic
          </AppText>
          <AppText align="center" style={styles.planColumn} tone="success" variant="caption">
            Pro
          </AppText>
          <AppText align="center" style={styles.planColumn} variant="caption">
            Business
          </AppText>
        </View>
        <Divider />
        {comparisonRows.map((row, index) => (
          <View key={row.id}>
            <ComparisonRowView row={row} />
            {index < comparisonRows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ComparisonRowView({ row }: { row: ComparisonRow }) {
  return (
    <View accessibilityLabel={`${row.label}. Basic ${row.basic}. Pro ${row.pro}. Business ${row.business}.`} style={styles.comparisonRow}>
      <AppText style={styles.comparisonFeature} variant="caption">
        {row.label}
      </AppText>
      <AppText align="center" style={styles.planColumn} tone="secondary" variant="caption">
        {row.basic}
      </AppText>
      <AppText align="center" style={styles.planColumn} tone="success" variant="caption">
        {row.pro}
      </AppText>
      <AppText align="center" style={styles.planColumn} tone="secondary" variant="caption">
        {row.business}
      </AppText>
    </View>
  );
}

function SupportCard() {
  return (
    <SolidCard style={styles.supportCard}>
      <View style={styles.supportIcon}>
        <Ionicons color={colors.brand.calmGreen} name="chatbubble-ellipses-outline" size={20} />
      </View>
      <View style={styles.supportCopy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">تحتاج مساعدة في اختيار الخطة؟</AppText>
        <AppButton onPress={() => router.push(routes.contactSupport)} style={styles.supportButton} variant="secondary">
          التواصل مع الدعم
        </AppButton>
      </View>
    </SolidCard>
  );
}

function PlanBadge({ label, tone }: { label: string; tone: 'success' }) {
  return (
    <View style={styles.planBadge}>
      <AppText align="center" tone={tone} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  segmentedControl: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.button,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  segmentOption: {
    alignItems: 'center',
    borderRadius: radii.control,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
  },
  segmentOptionSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderWidth: 1,
  },
  savingsBadge: {
    backgroundColor: 'rgba(167,200,161,0.12)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  savingsCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  savingsCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  description: {
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  planStack: {
    gap: spacing.lg,
    width: '100%',
  },
  planCard: {
    gap: spacing.lg,
    width: '100%',
  },
  currentPlanCard: {
    backgroundColor: 'rgba(17,26,23,0.96)',
    borderColor: 'rgba(167,200,161,0.34)',
  },
  businessPlanCard: {
    borderColor: 'rgba(167,200,161,0.22)',
  },
  planHeader: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  planIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.26)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  planCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  planName: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  badgeStack: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  planBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    width: '100%',
  },
  priceText: {
    color: colors.text.primary,
  },
  featureList: {
    gap: spacing.sm,
    width: '100%',
  },
  featureRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  unavailableIcon: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  featureText: {
    flex: 1,
    minWidth: 0,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  prototypeNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.58)',
    borderColor: 'rgba(167,200,161,0.22)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  recommendationCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  recommendationCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  section: {
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  comparisonCard: {
    padding: 0,
  },
  comparisonHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  comparisonRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  comparisonFeatureHeader: {
    flex: 1.28,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  comparisonFeature: {
    flex: 1.28,
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  planColumn: {
    flex: 0.88,
    minWidth: 0,
    writingDirection: 'ltr',
  },
  supportCard: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  supportIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  supportCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  supportButton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  fullWidthRtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
