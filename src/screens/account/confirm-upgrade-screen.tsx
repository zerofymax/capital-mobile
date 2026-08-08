import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, SuccessState } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type UpgradeBillingCycle = 'monthly' | 'annual';
type UpgradePlanId = 'business';

type UpgradePlan = {
  id: UpgradePlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyEquivalent: number;
  annualSavings: number;
  currency: string;
};

type CostRow = {
  label: string;
  value: string;
  ltr?: boolean;
  tone?: 'primary' | 'success' | 'secondary';
};

const businessPlan: UpgradePlan = {
  id: 'business',
  name: 'Capital Business',
  monthlyPrice: 99,
  annualPrice: 950,
  annualMonthlyEquivalent: 79,
  annualSavings: 238,
  currency: 'ر.س',
};

const currentPlan = {
  name: 'Capital Pro',
  monthlyPrice: 49,
  currency: 'ر.س',
};

const upgradeReference = 'CAP-UPG-2026-1049';

const businessFeatures = [
  'جميع مزايا Capital Pro',
  'مستخدمون متعددون',
  'صلاحيات الفريق',
  'تقارير مخصصة',
  'تصدير غير محدود',
  'مزامنة حتى 10 أجهزة',
  'دعم مخصص',
] as const;

export function ConfirmUpgradeScreen() {
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const params = useLocalSearchParams<{ planId?: string | string[]; billingCycle?: string | string[] }>();
  const initialBillingCycle = useMemo(() => validateBillingCycle(params.billingCycle), [params.billingCycle]);
  const selectedPlan = useMemo(() => getUpgradePlan(validatePlanId(params.planId)), [params.planId]);
  const [billingCycle, setBillingCycle] = useState<UpgradeBillingCycle>(initialBillingCycle);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedPrice = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  const cycleLabel = billingCycle === 'monthly' ? 'شهري' : 'سنوي';
  const dirty = !isSuccess && (billingCycle !== initialBillingCycle || termsAccepted);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (confirmDialogVisible) {
        setConfirmDialogVisible(false);
        return true;
      }

      if (unsavedDialogVisible) {
        setUnsavedDialogVisible(false);
        return true;
      }

      if (dirty && !isSubmitting) {
        setUnsavedDialogVisible(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [confirmDialogVisible, dirty, isSubmitting, unsavedDialogVisible]);

  function goBackToComparePlans() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.comparePlans);
  }

  function requestLeave() {
    if (dirty && !isSubmitting) {
      setUnsavedDialogVisible(true);
      return;
    }

    goBackToComparePlans();
  }

  function handleBillingCyclePress(nextCycle: UpgradeBillingCycle) {
    Haptics.selectionAsync().catch(() => null);
    setBillingCycle(nextCycle);
    setFeedback(null);
  }

  function toggleTerms() {
    Haptics.selectionAsync().catch(() => null);
    setTermsAccepted((current) => !current);
    setFeedback(null);
  }

  function handlePaymentMethodPress() {
    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    router.push(routes.paymentMethod);
  }

  function handlePrimaryPress() {
    if (isSubmitting || !termsAccepted) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    setConfirmDialogVisible(true);
  }

  function handleConfirmUpgrade() {
    if (isSubmitting) {
      return;
    }

    setConfirmDialogVisible(false);
    setIsSubmitting(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      setTermsAccepted(false);
      setIsSubmitting(false);
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    }, 820);
  }

  function handleContinueEditing() {
    setUnsavedDialogVisible(false);
  }

  function handleDiscardChanges() {
    setUnsavedDialogVisible(false);
    goBackToComparePlans();
  }

  function handleSuccessPrimary() {
    router.replace(routes.currentSubscription);
  }

  function handleSuccessSecondary() {
    router.replace(routes.account);
  }

  if (isSuccess) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
          end={{ x: 0.72, y: 1 }}
          locations={[0, 0.52, 1]}
          start={{ x: 0.28, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.successContent,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.screenBottom),
              paddingTop: Math.max(insets.top, spacing.safeTop),
            },
          ]}
        >
          <SuccessState
            description={`رقم الطلب: ${upgradeReference}\nتم تنفيذ الطلب محليًا في النموذج التجريبي، ولم يتم خصم أي مبلغ أو تغيير اشتراك حقيقي.`}
            onPrimaryAction={handleSuccessPrimary}
            onSecondaryAction={handleSuccessSecondary}
            primaryActionLabel="العودة إلى الاشتراك الحالي"
            secondaryActionLabel="العودة إلى الحساب"
            title="تم تأكيد طلب الترقية"
          />
          <SolidCard style={styles.successDetailsCard}>
            <InfoRow label="الخطة" ltr value={selectedPlan.name} />
            <Divider />
            <InfoRow label="دورة الفوترة" value={cycleLabel} />
            <Divider />
            <InfoRow label="المرجع" ltr value={upgradeReference} />
          </SolidCard>
        </View>
      </View>
    );
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
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ConfirmUpgradeHeader onBackPress={requestLeave} />
        <UpgradeSummaryCard />
        <BillingCycleSection billingCycle={billingCycle} onCyclePress={handleBillingCyclePress} />
        <CostBreakdownCard billingCycle={billingCycle} />
        <ProrationNotice />
        <PaymentMethodCard onPress={handlePaymentMethodPress} />
        <FeaturePreviewCard />
        <CurrentPlanImpactCard />
        <TermsCard checked={termsAccepted} onPress={toggleTerms} />
        <AutoRenewalCard />

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="warning" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.actions}>
          {!termsAccepted ? (
            <AppText align="center" tone="warning" variant="caption">
              وافق على شروط الاشتراك للمتابعة
            </AppText>
          ) : null}
          <AppButton disabled={!termsAccepted || isSubmitting} loading={isSubmitting} onPress={handlePrimaryPress}>
            {isSubmitting ? 'جاري تأكيد الترقية' : `تأكيد الترقية مقابل ${selectedPrice} ${selectedPlan.currency}`}
          </AppButton>
          <AppButton disabled={isSubmitting} onPress={requestLeave} variant="secondary">
            العودة إلى مقارنة الخطط
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="تأكيد"
        description={`سيظهر مبلغ ${selectedPrice} ${selectedPlan.currency} كإجمالي تجريبي. لن يتم تنفيذ أي عملية دفع حقيقية.`}
        onCancel={() => setConfirmDialogVisible(false)}
        onConfirm={handleConfirmUpgrade}
        title="تأكيد الترقية إلى Capital Business؟"
        tone="success"
        visible={confirmDialogVisible}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم تجاهل إعدادات الترقية."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={unsavedDialogVisible}
      />
    </View>
  );
}

function validateBillingCycle(value: string | string[] | undefined): UpgradeBillingCycle {
  const nextValue = Array.isArray(value) ? value[0] : value;
  return nextValue === 'annual' || nextValue === 'monthly' ? nextValue : 'monthly';
}

function validatePlanId(value: string | string[] | undefined): UpgradePlanId {
  const nextValue = Array.isArray(value) ? value[0] : value;
  return nextValue === 'business' ? 'business' : 'business';
}

function getUpgradePlan(planId: UpgradePlanId): UpgradePlan {
  return planId === 'business' ? businessPlan : businessPlan;
}

function ConfirmUpgradeHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى مقارنة الخطط"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" numberOfLines={1} variant="screenTitle">
          تأكيد الترقية
        </AppText>
        <AppText align="right" tone="secondary" variant="caption">
          راجع تفاصيل الخطة قبل المتابعة
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function UpgradeSummaryCard() {
  return (
    <View style={styles.upgradeHero}>
      <LinearGradient
        colors={['rgba(38,46,62,0.62)', 'rgba(11,46,38,0.76)', 'rgba(5,6,8,0.88)']}
        end={{ x: 0.94, y: 1 }}
        locations={[0, 0.56, 1]}
        start={{ x: 0.08, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.upgradeContent}>
        <View style={styles.badgeRow}>
          <View style={styles.upgradeBadge}>
            <AppText align="center" tone="success" variant="caption">
              ترقية
            </AppText>
          </View>
        </View>
        <View style={styles.planProgression}>
          <PlanMiniCard muted label="من" name={currentPlan.name} />
          <View style={styles.arrowCircle}>
            <Ionicons color={colors.brand.calmGreen} name="arrow-back-outline" size={20} />
          </View>
          <PlanMiniCard label="إلى" name={businessPlan.name} />
        </View>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          ستحصل على مزايا الفرق والصلاحيات والتقارير الموسعة.
        </AppText>
      </View>
    </View>
  );
}

function PlanMiniCard({ label, name, muted = false }: { label: string; name: string; muted?: boolean }) {
  return (
    <View style={[styles.planMiniCard, muted && styles.planMiniCardMuted]}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={styles.ltrText} variant="body">
        {name}
      </AppText>
    </View>
  );
}

function BillingCycleSection({
  billingCycle,
  onCyclePress,
}: {
  billingCycle: UpgradeBillingCycle;
  onCyclePress: (cycle: UpgradeBillingCycle) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">دورة الفوترة</AppText>
      <SolidCard style={styles.selectableCard}>
        <BillingCycleRow
          badge={`وفّر ${businessPlan.annualSavings} ${businessPlan.currency}`}
          label="سنوي"
          onPress={() => onCyclePress('annual')}
          price={`${businessPlan.annualPrice} ${businessPlan.currency} / سنويًا`}
          selected={billingCycle === 'annual'}
          supporting={`يعادل نحو ${businessPlan.annualMonthlyEquivalent} ${businessPlan.currency} شهريًا`}
        />
        <Divider />
        <BillingCycleRow
          label="شهري"
          onPress={() => onCyclePress('monthly')}
          price={`${businessPlan.monthlyPrice} ${businessPlan.currency} / شهريًا`}
          selected={billingCycle === 'monthly'}
        />
      </SolidCard>
    </View>
  );
}

function BillingCycleRow({
  label,
  price,
  supporting,
  badge,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  supporting?: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}. ${price}${supporting ? `. ${supporting}` : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.billingRow, selected && styles.billingRowSelected, pressed && styles.pressed]}
    >
      <View style={styles.billingCopy}>
        <View style={styles.billingTitleRow}>
          <AppText variant="body">{label}</AppText>
          {badge ? (
            <View style={styles.savingsBadge}>
              <AppText align="center" tone="success" variant="caption">
                {badge}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText align="left" style={styles.ltrText} variant="supporting">
          {price}
        </AppText>
        {supporting ? (
          <AppText tone="tertiary" variant="caption">
            {supporting}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

function CostBreakdownCard({ billingCycle }: { billingCycle: UpgradeBillingCycle }) {
  const rows: CostRow[] =
    billingCycle === 'monthly'
      ? [
          { label: 'سعر الخطة', value: `${businessPlan.monthlyPrice} ${businessPlan.currency}`, ltr: true },
          { label: 'الضريبة', value: 'تُحسب عند الدفع' },
          { label: 'الإجمالي اليوم', value: `${businessPlan.monthlyPrice} ${businessPlan.currency}`, ltr: true },
          { label: 'التجديد القادم', value: 'بعد شهر' },
        ]
      : [
          { label: 'سعر الخطة السنوي', value: `${businessPlan.annualPrice} ${businessPlan.currency}`, ltr: true },
          { label: 'التوفير مقارنة بالدفع الشهري', value: `${businessPlan.annualSavings} ${businessPlan.currency}`, ltr: true, tone: 'success' },
          { label: 'الضريبة', value: 'تُحسب عند الدفع' },
          { label: 'الإجمالي اليوم', value: `${businessPlan.annualPrice} ${businessPlan.currency}`, ltr: true },
          { label: 'التجديد القادم', value: 'بعد سنة' },
        ];

  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ملخص التكلفة</AppText>
      <SolidCard style={styles.rowsCard}>
        {rows.map((row, index) => (
          <View key={row.label}>
            <InfoRow label={row.label} ltr={row.ltr} tone={row.tone} value={row.value} />
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <View style={styles.costHelper}>
          <AppText style={styles.description} tone="tertiary" variant="caption">
            الأسعار المعروضة تجريبية وقد تتغير في النسخة الإنتاجية.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function ProrationNotice() {
  return (
    <SolidCard style={styles.noticeCard}>
      <Ionicons color={colors.semantic.warning} name="calculator-outline" size={20} />
      <View style={styles.noticeCopy}>
        <AppText variant="cardTitle">احتساب فرق الخطة</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          في النسخة الإنتاجية، قد يُحتسب فرق السعر المتبقي من اشتراكك الحالي عند الترقية.
        </AppText>
        <AppText tone="tertiary" variant="caption">
          المبلغ النهائي يظهر بعد ربط خدمة الفوترة.
        </AppText>
      </View>
    </SolidCard>
  );
}

function PaymentMethodCard({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">وسيلة الدفع</AppText>
      <SolidCard style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIcon}>
            <Ionicons color={colors.brand.calmGreen} name="card-outline" size={20} />
          </View>
          <View style={styles.paymentCopy}>
            <AppText align="left" style={styles.ltrText} variant="body">
              Visa •••• 4242
            </AppText>
            <AppText tone="secondary" variant="caption">
              تنتهي 08/28
            </AppText>
          </View>
          <View style={styles.defaultBadge}>
            <AppText align="center" tone="success" variant="caption">
              الافتراضية
            </AppText>
          </View>
        </View>
        <Divider />
        <Pressable
          accessibilityLabel="تغيير وسيلة الدفع"
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.inlineAction, pressed && styles.pressed]}
        >
          <AppText align="center" tone="link" variant="supporting">
            تغيير وسيلة الدفع
          </AppText>
        </Pressable>
      </SolidCard>
    </View>
  );
}

function FeaturePreviewCard() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ما الذي ستحصل عليه؟</AppText>
      <SolidCard style={styles.featuresCard}>
        {businessFeatures.map((feature, index) => (
          <View key={feature}>
            <View style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={15} />
              </View>
              <AppText style={styles.featureText} variant="supporting">
                {feature}
              </AppText>
            </View>
            {index < businessFeatures.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function CurrentPlanImpactCard() {
  return (
    <SolidCard style={styles.impactCard}>
      <Ionicons color={colors.text.tertiary} name="information-circle-outline" size={20} />
      <View style={styles.noticeCopy}>
        <AppText variant="cardTitle">ماذا يحدث لخطة Capital Pro؟</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          بعد الترقية في النسخة الإنتاجية، سيتم استبدال خطتك الحالية بـ Capital Business دون حذف بياناتك أو تقاريرك.
        </AppText>
      </View>
    </SolidCard>
  );
}

function TermsCard({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="أوافق على شروط الاشتراك وسياسة الفوترة"
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.termsCard, checked && styles.termsCardChecked, pressed && styles.pressed]}
    >
      <AppText style={styles.termsText} variant="supporting">
        أوافق على شروط الاشتراك وسياسة الفوترة.
      </AppText>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={16} /> : null}
      </View>
    </Pressable>
  );
}

function AutoRenewalCard() {
  return (
    <SolidCard style={styles.autoRenewCard}>
      <Ionicons color={colors.brand.calmGreen} name="refresh-outline" size={20} />
      <View style={styles.noticeCopy}>
        <View style={styles.autoRenewTitleRow}>
          <AppText style={styles.autoRenewTitle} variant="cardTitle">
            التجديد التلقائي
          </AppText>
          <AppText tone="success" variant="caption">
            مفعّل
          </AppText>
        </View>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          سيتم تجديد الخطة تلقائيًا في نهاية كل دورة فوترة في النسخة الإنتاجية.
        </AppText>
      </View>
    </SolidCard>
  );
}

function InfoRow({
  label,
  value,
  ltr = false,
  tone = 'primary',
}: {
  label: string;
  value: string;
  ltr?: boolean;
  tone?: 'primary' | 'success' | 'secondary';
}) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={[styles.infoValue, ltr && styles.ltrText]} tone={tone} variant="supporting">
        {value}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
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
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  upgradeHero: {
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  upgradeContent: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  badgeRow: {
    alignItems: 'flex-start',
  },
  upgradeBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  planProgression: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  planMiniCard: {
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  planMiniCardMuted: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  arrowCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.12)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  description: {
    lineHeight: 22,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  section: {
    gap: spacing.md,
  },
  selectableCard: {
    padding: 0,
  },
  billingRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 88,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  billingRowSelected: {
    backgroundColor: colors.semantic.successTint,
  },
  billingCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  billingTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  savingsBadge: {
    backgroundColor: 'rgba(167,200,161,0.12)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioOuterSelected: {
    borderColor: colors.brand.mediumGreen,
  },
  radioInner: {
    backgroundColor: colors.brand.mediumGreen,
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  rowsCard: {
    padding: 0,
  },
  infoRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoValue: {
    flex: 1,
  },
  costHelper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noticeCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  paymentCard: {
    gap: spacing.md,
  },
  paymentHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  paymentIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  paymentCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  defaultBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inlineAction: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  featuresCard: {
    padding: 0,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  checkIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  featureText: {
    flex: 1,
    minWidth: 0,
  },
  impactCard: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  termsCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    padding: spacing.lg,
  },
  termsCardChecked: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  termsText: {
    flex: 1,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.small,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.mediumGreen,
  },
  autoRenewCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  autoRenewTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  autoRenewTitle: {
    flex: 1,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackText: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  successDetailsCard: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    padding: 0,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
