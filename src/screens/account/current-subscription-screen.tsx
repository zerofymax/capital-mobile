import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionPriceLine, SubscriptionSectionHeading } from '@/components/account';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  formatSubscriptionAmount,
  getPaymentMethodLabel,
  reactivateSubscriptionAutoRenewal,
  subscriptionPrototypeNotice,
  useSubscriptionState,
  type SubscriptionState,
} from './subscription-data';

type SubscriptionUsage = {
  id: string;
  label: string;
  used: number;
  limit: number | null;
};

type ManagementAction = {
  id: 'compare-plans' | 'payment-method' | 'billing-history' | 'cancel-subscription' | 'reactivate-subscription';
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status?: string;
  tone?: 'default' | 'danger';
  feedback: string;
};

const planBenefits = [
  'تقارير مالية متقدمة',
  'رؤى Capital الذكية',
  'متابعة الاشتراكات والالتزامات',
  'تصدير التقارير',
  'دعم أولوية',
  'مزامنة متعددة الأجهزة',
] as const;

const usageItems: SubscriptionUsage[] = [
  { id: 'advanced-reports', label: 'التقارير المتقدمة', used: 8, limit: 20 },
  { id: 'capital-consultations', label: 'استشارات Capital', used: 12, limit: 30 },
  { id: 'file-exports', label: 'تصدير الملفات', used: 4, limit: 10 },
];

function getManagementActions(subscription: SubscriptionState): ManagementAction[] {
  const baseActions: ManagementAction[] = [
  {
    id: 'compare-plans',
    title: 'مقارنة الخطط',
    description: 'استعرض الخطط والمزايا المتاحة',
    icon: 'layers-outline',
    feedback: 'مقارنة الخطط ستكون متاحة في الخطوة التالية',
  },
  {
    id: 'payment-method',
    title: 'وسيلة الدفع',
    description: 'عرض أو تحديث وسيلة الدفع',
    icon: 'card-outline',
    status: getPaymentMethodLabel(subscription),
    feedback: 'إدارة وسيلة الدفع ستكون متاحة لاحقًا',
  },
  {
    id: 'billing-history',
    title: 'سجل الفواتير',
    description: 'عرض الفواتير والمدفوعات السابقة',
    icon: 'receipt-outline',
    feedback: 'سجل الفواتير سيكون متاحًا لاحقًا',
  },
  ];

  if (subscription.autoRenewEnabled) {
    return [
      ...baseActions,
      {
        id: 'cancel-subscription',
        title: 'إلغاء الاشتراك',
        description: 'إيقاف التجديد التلقائي للخطة',
        icon: 'close-circle-outline',
        tone: 'danger',
        feedback: 'إلغاء الاشتراك سيكون متاحًا لاحقًا',
      },
    ];
  }

  return [
    ...baseActions,
    {
      id: 'reactivate-subscription',
      title: 'إعادة تفعيل التجديد',
      description: `استمرار تجديد ${subscription.planName} تلقائيًا`,
      icon: 'refresh-circle-outline',
      feedback: 'تمت إعادة تفعيل التجديد التلقائي محليًا',
    },
  ];
}

export function CurrentSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const currentSubscription = useSubscriptionState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const managementActions = getManagementActions(currentSubscription);

  function goBackToAccount() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function showFeedback(message: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setFeedback(message);
  }

  function handleManagementPress(action: ManagementAction) {
    if (action.id === 'compare-plans') {
      Haptics.selectionAsync().catch(() => null);
      setFeedback(null);
      router.push(routes.comparePlans);
      return;
    }

    if (action.id === 'payment-method') {
      Haptics.selectionAsync().catch(() => null);
      setFeedback(null);
      router.push(routes.paymentMethod);
      return;
    }

    if (action.id === 'billing-history') {
      Haptics.selectionAsync().catch(() => null);
      setFeedback(null);
      router.push(routes.billingHistory);
      return;
    }

    if (action.id === 'cancel-subscription') {
      Haptics.selectionAsync().catch(() => null);
      setFeedback(null);
      router.push(routes.cancelSubscription);
      return;
    }

    if (action.id === 'reactivate-subscription') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      reactivateSubscriptionAutoRenewal();
      setFeedback('تمت إعادة تفعيل التجديد التلقائي محليًا');
      return;
    }

    showFeedback(action.feedback);
  }

  function handleSupportPress() {
    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    router.push(routes.contactSupport);
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
        <SubscriptionHeader onBackPress={goBackToAccount} />
        <PrototypeNotice message={subscriptionPrototypeNotice} />
        <PlanHeroCard subscription={currentSubscription} />
        <BillingSummaryCard subscription={currentSubscription} />
        <BenefitsCard />
        <UsageSummaryCard usageItems={usageItems} />
        <ManagementSection actions={managementActions} onActionPress={handleManagementPress} />

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.feedbackText} tone="warning" variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <AutoRenewalCard subscription={currentSubscription} />
        <SupportCard onPress={handleSupportPress} />
      </ScrollView>
    </View>
  );
}

function SubscriptionHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحساب"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الاشتراك الحالي
      </AppText>
    </View>
  );
}

function PlanHeroCard({ subscription }: { subscription: SubscriptionState }) {
  const footerLabel = subscription.autoRenewEnabled
    ? `التجديد القادم في ${subscription.nextRenewalDate}`
    : `تم إيقاف التجديد. تبقى المزايا سارية حتى ${subscription.accessUntilDate}`;

  return (
    <View style={styles.planHero}>
      <LinearGradient
        colors={['rgba(38,46,62,0.66)', 'rgba(11,46,38,0.72)', 'rgba(5,6,8,0.86)']}
        end={{ x: 0.92, y: 1 }}
        locations={[0, 0.58, 1]}
        start={{ x: 0.08, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroContent}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}>
            <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={24} />
          </View>
          <StatusBadge label={subscription.autoRenewEnabled ? 'نشط' : 'تم إيقاف التجديد'} tone="success" />
          <View style={styles.heroCopy}>
            <AppText style={styles.fullWidthRtlText} tone="secondary" variant="caption">
              الخطة الحالية
            </AppText>
            <AppText align="right" style={styles.planName} variant="screenTitle">
              {subscription.planName}
            </AppText>
          </View>
        </View>

        <SubscriptionPriceLine
          amount={formatSubscriptionAmount(subscription.monthlyPrice, subscription.currency)}
          period="شهريًا"
          style={styles.priceText}
        />

        <View style={styles.heroFooter}>
          <Ionicons color={colors.brand.calmGreen} name="calendar-outline" size={16} />
          <AppText style={[styles.description, styles.flexRtlText]} tone="secondary" variant="supporting">
            {footerLabel}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function BillingSummaryCard({ subscription }: { subscription: SubscriptionState }) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>تفاصيل الفاتورة</SubscriptionSectionHeading>
      <SolidCard style={styles.rowsCard}>
        <InfoRow label="دورة الفوترة" value="شهري" />
        <Divider />
        <InfoRow label="قيمة الاشتراك" ltr value={formatSubscriptionAmount(subscription.monthlyPrice, subscription.currency)} />
        <Divider />
        {subscription.autoRenewEnabled ? (
          <InfoRow label="تاريخ التجديد القادم" value={subscription.nextRenewalDate} />
        ) : (
          <InfoRow label="الوصول إلى المزايا حتى" value={subscription.accessUntilDate} />
        )}
        <Divider />
        <InfoRow label="طريقة الدفع" ltr value={getPaymentMethodLabel(subscription)} />
        <Divider />
        <InfoRow label="حالة التجديد التلقائي" value={subscription.autoRenewEnabled ? 'مفعّل' : 'غير مفعّل'} />
      </SolidCard>
    </View>
  );
}

function BenefitsCard() {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>مزايا خطتك</SubscriptionSectionHeading>
      <SolidCard style={styles.benefitsCard}>
        {planBenefits.map((benefit, index) => (
          <View key={benefit}>
            <View style={styles.benefitRow}>
              <View style={styles.checkIcon}>
                <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={15} />
              </View>
              <AppText style={[styles.benefitText, styles.rtlText]} variant="supporting">
                {benefit}
              </AppText>
            </View>
            {index < planBenefits.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function UsageSummaryCard({ usageItems }: { usageItems: SubscriptionUsage[] }) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>استخدامك هذا الشهر</SubscriptionSectionHeading>
      <SolidCard style={styles.usageCard}>
        {usageItems.map((item, index) => (
          <View key={item.id}>
            <UsageRow item={item} />
            {index < usageItems.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function UsageRow({ item }: { item: SubscriptionUsage }) {
  const percent = item.limit ? Math.min(item.used / item.limit, 1) : 1;
  const displayValue = item.limit ? `${item.used} من ${item.limit}` : 'غير محدودة';

  return (
    <View
      accessibilityLabel={`${item.label}. ${displayValue}`}
      accessibilityRole="progressbar"
      accessibilityValue={item.limit ? { min: 0, max: item.limit, now: item.used, text: displayValue } : { text: displayValue }}
      style={styles.usageRow}
    >
      <View style={styles.usageHeader}>
        <AppText style={[styles.usageLabel, styles.rtlText]} variant="supporting">
          {item.label}
        </AppText>
        {item.limit ? (
          <View style={styles.usageValue}>
            <AppText style={styles.ltrText} tone="secondary" variant="caption">{item.used}</AppText>
            <AppText style={styles.rtlText} tone="secondary" variant="caption">من</AppText>
            <AppText style={styles.ltrText} tone="secondary" variant="caption">{item.limit}</AppText>
          </View>
        ) : (
          <AppText align="left" style={styles.rtlText} tone="secondary" variant="caption">غير محدودة</AppText>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent * 100}%` }]} />
      </View>
    </View>
  );
}

function ManagementSection({
  actions,
  onActionPress,
}: {
  actions: ManagementAction[];
  onActionPress: (action: ManagementAction) => void;
}) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>إدارة الاشتراك</SubscriptionSectionHeading>
      <SolidCard style={styles.rowsCard}>
        {actions.map((action, index) => (
          <View key={action.id}>
            <ManagementRow action={action} onPress={() => onActionPress(action)} />
            {index < actions.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ManagementRow({ action, onPress }: { action: ManagementAction; onPress: () => void }) {
  const isDanger = action.tone === 'danger';

  return (
    <Pressable
      accessibilityLabel={`${action.title}. ${action.description}${action.status ? `. ${action.status}` : ''}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.managementRow, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      <View style={[styles.managementIcon, isDanger && styles.dangerIcon]}>
        <Ionicons color={isDanger ? colors.semantic.danger : colors.brand.green} name={action.icon} size={18} />
      </View>
      {action.status ? (
        <AppText align="left" numberOfLines={1} style={styles.paymentStatus} tone="secondary" variant="caption">
          {action.status}
        </AppText>
      ) : null}
      <View style={styles.managementCopy}>
        <AppText style={styles.fullWidthRtlText} tone={isDanger ? 'danger' : 'primary'} variant="body">
          {action.title}
        </AppText>
        <AppText style={[styles.rowDescription, styles.fullWidthRtlText]} tone="secondary" variant="caption">
          {action.description}
        </AppText>
      </View>
    </Pressable>
  );
}

function AutoRenewalCard({ subscription }: { subscription: SubscriptionState }) {
  const title = subscription.autoRenewEnabled ? 'التجديد التلقائي مفعّل' : 'التجديد التلقائي متوقف';
  const description = subscription.autoRenewEnabled
    ? `سيتم تجديد اشتراك ${subscription.planName} تلقائيًا في ${subscription.nextRenewalDate} باستخدام ${getPaymentMethodLabel(subscription)}.`
    : `لن يتم تجديد الاشتراك تلقائيًا. ستستمر مزايا ${subscription.planName} حتى ${subscription.accessUntilDate}.`;

  return (
    <SolidCard style={styles.autoRenewCard}>
      <View style={styles.autoRenewIcon}>
        <Ionicons color={colors.brand.calmGreen} name="refresh-outline" size={20} />
      </View>
      <View style={styles.autoRenewCopy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">{title}</AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          {directionSafeText(description)}
        </AppText>
      </View>
    </SolidCard>
  );
}

function PrototypeNotice({ message }: { message: string }) {
  return (
    <SolidCard style={styles.prototypeNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={[styles.feedbackText, styles.rtlText]} tone="secondary" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function SupportCard({ onPress }: { onPress: () => void }) {
  return (
    <SolidCard style={styles.supportCard}>
      <View style={styles.supportIcon}>
        <Ionicons color={colors.brand.calmGreen} name="chatbubble-ellipses-outline" size={20} />
      </View>
      <View style={styles.supportCopy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">هل تحتاج مساعدة في الاشتراك؟</AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          تواصل مع فريق الدعم بشأن الفوترة أو الخطط.
        </AppText>
        <AppButton onPress={onPress} style={styles.supportButton} variant="secondary">
          التواصل مع الدعم
        </AppButton>
      </View>
    </SolidCard>
  );
}

function InfoRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={[styles.infoValue, ltr && styles.ltrText]} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' }) {
  return (
    <View style={styles.statusBadge}>
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
    minHeight: 42,
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
  headerTitle: {
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  planHero: {
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroContent: {
    gap: spacing.xl,
    padding: spacing.xl,
  },
  heroHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.32)',
    borderRadius: radii.card,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  heroCopy: {
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
  ltrText: {
    writingDirection: 'ltr',
  },
  statusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceText: {
    color: colors.text.primary,
  },
  heroFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.control,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  description: {
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  rowsCard: {
    padding: 0,
  },
  infoRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  infoLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    flex: 1,
    textAlign: 'left',
  },
  benefitsCard: {
    padding: 0,
  },
  benefitRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
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
  benefitText: {
    flex: 1,
    minWidth: 0,
  },
  usageCard: {
    gap: spacing.lg,
  },
  usageRow: {
    gap: spacing.sm,
  },
  usageHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  usageLabel: {
    flex: 1,
  },
  usageValue: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.pill,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.brand.mediumGreen,
    borderRadius: radii.pill,
    height: '100%',
  },
  managementRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  managementIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dangerIcon: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.28)',
  },
  managementCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowDescription: {
    lineHeight: 18,
  },
  paymentStatus: {
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
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
  autoRenewCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  autoRenewIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  autoRenewCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
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
  flexRtlText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
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
