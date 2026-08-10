import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionSectionHeading } from '@/components/account';
import { ConfirmationDialog, SuccessState } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { directionSafeText } from '@/utils/rtl';
import {
  formatSubscriptionAmount,
  getPaymentMethodLabel,
  stopSubscriptionAutoRenewal,
  subscriptionPrototypeNotice,
  temporaryPauseMessage,
  useSubscriptionState,
  type SubscriptionState,
} from './subscription-data';

type CancellationReason =
  | 'price'
  | 'low-usage'
  | 'missing-features'
  | 'payment-problem'
  | 'temporary-stop'
  | 'privacy'
  | 'other';

type RetentionRoute = typeof routes.comparePlans | typeof routes.paymentMethod | typeof routes.contactSupport | typeof routes.billingHistory;

type CancellationReasonOption = {
  id: CancellationReason;
  label: string;
};

type RetentionOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: RetentionRoute;
};

const cancellationReference = 'CAP-CAN-2026-1049';

const cancellationReasons: CancellationReasonOption[] = [
  { id: 'price', label: 'السعر مرتفع' },
  { id: 'low-usage', label: 'لا أستخدم المزايا بشكل كافٍ' },
  { id: 'missing-features', label: 'التطبيق لا يلبي احتياجاتي' },
  { id: 'payment-problem', label: 'واجهت مشكلة في الدفع' },
  { id: 'temporary-stop', label: 'أحتاج إلى إيقاف الاشتراك مؤقتًا' },
  { id: 'privacy', label: 'مخاوف تتعلق بالخصوصية' },
  { id: 'other', label: 'أخرى' },
];

const retentionOptions: RetentionOption[] = [
  {
    id: 'annual-plan',
    title: 'الانتقال إلى الخطة السنوية',
    description: 'وفّر 118 ر.س سنويًا مقارنة بالدفع الشهري.',
    icon: 'calendar-outline',
    route: routes.comparePlans,
  },
  {
    id: 'payment-method',
    title: 'تحديث وسيلة الدفع',
    description: 'حل مشكلة الدفع أو استخدام بطاقة أخرى.',
    icon: 'card-outline',
    route: routes.paymentMethod,
  },
  {
    id: 'contact-support',
    title: 'التواصل مع الدعم',
    description: 'قد نساعدك في حل المشكلة قبل الإلغاء.',
    icon: 'chatbubble-ellipses-outline',
    route: routes.contactSupport,
  },
  {
    id: 'billing-history',
    title: 'مراجعة سجل الفواتير',
    description: 'راجع المدفوعات والفواتير السابقة.',
    icon: 'receipt-outline',
    route: routes.billingHistory,
  },
];

const consequenceItems = [
  'يتوقف التجديد التلقائي',
  'يستمر اشتراكك حتى 14 أغسطس 2026',
  'لن يتم حذف بياناتك المالية',
  'ستبقى تقاريرك ومعاملاتك محفوظة',
  'بعد نهاية الاشتراك ستنتقل إلى الخطة الأساسية',
  'قد تتوقف بعض مزايا Capital Pro المتقدمة',
] as const;

export function CancelSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const subscription = useSubscriptionState();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [consequencesConfirmed, setConsequencesConfirmed] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dirty = !isSuccess && (reason !== null || otherReason.trim().length > 0 || consequencesConfirmed);
  const valid = Boolean(reason && consequencesConfirmed);

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

  function goBackToSubscription() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.currentSubscription);
  }

  function requestLeave() {
    Keyboard.dismiss();

    if (dirty && !isSubmitting) {
      setUnsavedDialogVisible(true);
      return;
    }

    goBackToSubscription();
  }

  function resetForm() {
    setReason(null);
    setOtherReason('');
    setConsequencesConfirmed(false);
    setReasonError(null);
    setConfirmError(null);
    setFeedback(null);
  }

  function handleDiscardChanges() {
    resetForm();
    setUnsavedDialogVisible(false);
    goBackToSubscription();
  }

  function handleReasonPress(nextReason: CancellationReason) {
    Haptics.selectionAsync().catch(() => null);
    setReason(nextReason);
    setReasonError(null);
    setFeedback(null);
    if (nextReason !== 'other') {
      setOtherReason('');
    }
  }

  function toggleConfirmation() {
    Haptics.selectionAsync().catch(() => null);
    setConsequencesConfirmed((current) => !current);
    setConfirmError(null);
    setFeedback(null);
  }

  function handleRetentionPress(option: RetentionOption) {
    Haptics.selectionAsync().catch(() => null);
    router.push(option.route);
  }

  function handlePausePress() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setFeedback(temporaryPauseMessage);
  }

  function validateCancellation() {
    let nextValid = true;

    if (!reason) {
      setReasonError('اختر سبب إلغاء الاشتراك');
      nextValid = false;
    }

    if (!consequencesConfirmed) {
      setConfirmError('أكد فهمك لنتائج إلغاء الاشتراك');
      nextValid = false;
    }

    return nextValid;
  }

  function handleCancelPress() {
    Keyboard.dismiss();
    setFeedback(null);

    if (isSubmitting) {
      return;
    }

    if (!validateCancellation()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setConfirmDialogVisible(true);
  }

  function handleConfirmCancellation() {
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

      stopSubscriptionAutoRenewal(reason ?? 'غير محدد');
      setIsSubmitting(false);
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    }, 820);
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
        <SuccessState
          description={`رقم الطلب: ${cancellationReference}\nتم إيقاف التجديد التلقائي. ستستمر مزايا ${subscription.planName} حتى ${subscription.accessUntilDate}.\nهذا تغيير محلي داخل النموذج التجريبي فقط.`}
          fullScreen
          icon={<Ionicons color={colors.semantic.warning} name="time-outline" size={32} />}
          onPrimaryAction={() => router.replace(routes.currentSubscription)}
          onSecondaryAction={() => router.push(routes.contactSupport)}
          primaryActionLabel="العودة إلى الاشتراك الحالي"
          secondaryActionLabel="التواصل مع الدعم"
          title="تم تسجيل طلب الإلغاء محليًا."
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      style={styles.root}
    >
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
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <CancelHeader onBackPress={requestLeave} />
        <PrototypeNotice />
        <WarningCard />
        <SubscriptionSummary subscription={subscription} />
        <ConsequencesCard accessUntilDate={subscription.accessUntilDate} />
        <RetentionSection onPausePress={handlePausePress} onRetentionPress={handleRetentionPress} />
        {feedback ? <FeedbackCard message={feedback} /> : null}
        <ReasonSection
          error={reasonError}
          onOtherReasonChange={(value) => setOtherReason(value)}
          onReasonPress={handleReasonPress}
          otherReason={otherReason}
          selectedReason={reason}
        />
        <NoRefundNotice />
        <CancellationDateCard subscription={subscription} />
        <ConfirmationCheckbox
          checked={consequencesConfirmed}
          error={confirmError}
          onPress={toggleConfirmation}
        />
        <View style={styles.actions}>
          <AppButton
            {...{ accessibilityState: { disabled: !valid || isSubmitting } }}
            disabled={!valid || isSubmitting}
            loading={isSubmitting}
            onPress={handleCancelPress}
            variant="danger"
          >
            {isSubmitting ? 'جاري إلغاء الاشتراك' : 'إلغاء الاشتراك'}
          </AppButton>
          {!valid ? (
            <AppText style={styles.validationHint} tone="warning" variant="caption">
              اختر سبب الإلغاء وأكد فهمك للمتابعة
            </AppText>
          ) : null}
          <AppButton disabled={isSubmitting} onPress={goBackToSubscription} variant="secondary">
            الاحتفاظ باشتراكي
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="تراجع"
        confirmLabel={isSubmitting ? 'جاري إلغاء الاشتراك' : 'تأكيد الإلغاء'}
        description={`سيتم إيقاف التجديد التلقائي مع استمرار المزايا حتى ${subscription.accessUntilDate}.`}
        forceRtlContent
        onCancel={() => {
          if (!isSubmitting) {
            setConfirmDialogVisible(false);
          }
        }}
        onConfirm={handleConfirmCancellation}
        title="تأكيد إلغاء الاشتراك"
        tone="danger"
        visible={confirmDialogVisible}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم تجاهل إعدادات إلغاء الاشتراك."
        forceRtlContent
        onCancel={handleDiscardChanges}
        onConfirm={() => setUnsavedDialogVisible(false)}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={unsavedDialogVisible}
      />
    </KeyboardAvoidingView>
  );
}

function CancelHeader({ onBackPress }: { onBackPress: () => void }) {
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
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        إلغاء الاشتراك
      </AppText>
    </View>
  );
}

function PrototypeNotice() {
  return (
    <SolidCard style={styles.prototypeNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.feedbackText} tone="secondary" variant="supporting">
        {subscriptionPrototypeNotice}
      </AppText>
    </SolidCard>
  );
}

function WarningCard() {
  return (
    <SolidCard style={styles.warningHero}>
      <View style={styles.dangerIconLarge}>
        <Ionicons color={colors.semantic.danger} name="warning-outline" size={24} />
      </View>
      <View style={styles.copy}>
        <View style={styles.warningTitleRow}>
          <AppText style={styles.warningTitle} variant="cardTitle">
            {directionSafeText('هل تريد إلغاء Capital Pro؟')}
          </AppText>
          <StatusBadge label="نشط" tone="success" />
        </View>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          سيؤدي الإلغاء إلى إيقاف التجديد التلقائي. ستستمر في استخدام مزايا الخطة حتى نهاية دورة الفوترة الحالية.
        </AppText>
        <AppText align="right" style={styles.planNameText} tone="tertiary" variant="caption">
          Capital Pro
        </AppText>
      </View>
    </SolidCard>
  );
}

function SubscriptionSummary({ subscription }: { subscription: SubscriptionState }) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>ملخص الاشتراك الحالي</SubscriptionSectionHeading>
      <SolidCard style={styles.rowsCard}>
        <InfoRow label="الخطة الحالية" ltr value={subscription.planName} />
        <Divider />
        <InfoRow label="دورة الفوترة" value="شهري" />
        <Divider />
        <InfoRow label="قيمة الاشتراك" ltr value={formatSubscriptionAmount(subscription.monthlyPrice, subscription.currency)} />
        <Divider />
        <InfoRow label="التجديد القادم" value={subscription.nextRenewalDate} />
        <Divider />
        <InfoRow label="الوصول إلى المزايا حتى" value={subscription.accessUntilDate} />
        <Divider />
        <InfoRow label="طريقة الدفع" ltr value={getPaymentMethodLabel(subscription)} />
      </SolidCard>
    </View>
  );
}

function ConsequencesCard({ accessUntilDate }: { accessUntilDate: string }) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>ماذا يحدث بعد الإلغاء؟</SubscriptionSectionHeading>
      <SolidCard style={styles.consequencesCard}>
        {consequenceItems.map((item, index) => {
          const displayItem = item === 'يستمر اشتراكك حتى 14 أغسطس 2026' ? `يستمر اشتراكك حتى ${accessUntilDate}` : item;

          return (
          <View key={item}>
            <View style={styles.consequenceRow}>
              <View style={styles.checkIcon}>
                <Ionicons color={colors.brand.calmGreen} name="checkmark-outline" size={15} />
              </View>
              <AppText style={styles.consequenceText} variant="supporting">
                {directionSafeText(displayItem)}
              </AppText>
            </View>
            {index < consequenceItems.length - 1 ? <Divider /> : null}
          </View>
          );
        })}
        <View style={styles.localHelper}>
          <Ionicons color={colors.text.tertiary} name="information-circle-outline" size={16} />
          <AppText style={styles.helperText} tone="tertiary" variant="caption">
            هذه النتائج جزء من النموذج التجريبي ولن يتم تغيير اشتراك حقيقي.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function RetentionSection({
  onPausePress,
  onRetentionPress,
}: {
  onPausePress: () => void;
  onRetentionPress: (option: RetentionOption) => void;
}) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>ربما يناسبك خيار آخر</SubscriptionSectionHeading>
      <SolidCard style={styles.rowsCard}>
        {retentionOptions.map((option, index) => (
          <View key={option.id}>
            <RetentionRow option={option} onPress={() => onRetentionPress(option)} />
            {index < retentionOptions.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
      <SolidCard style={styles.pauseCard}>
        <View style={styles.pauseIcon}>
          <Ionicons color={colors.semantic.warning} name="pause-circle-outline" size={21} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.fullWidthRtlText} variant="cardTitle">إيقاف الاشتراك مؤقتًا</AppText>
          <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
            احتفظ بالخطة وارجع إليها لاحقًا دون إلغاء كامل.
          </AppText>
          <AppButton onPress={onPausePress} style={styles.inlineButton} variant="secondary">
            إيقاف مؤقت
          </AppButton>
        </View>
      </SolidCard>
    </View>
  );
}

function RetentionRow({ option, onPress }: { option: RetentionOption; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${option.title}. ${option.description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.retentionRow, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      <View style={styles.retentionIcon}>
        <Ionicons color={colors.brand.calmGreen} name={option.icon} size={18} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.fullWidthRtlText} variant="body">{option.title}</AppText>
        <AppText style={[styles.rowDescription, styles.fullWidthRtlText]} tone="secondary" variant="caption">
          {option.description}
        </AppText>
      </View>
    </Pressable>
  );
}

function ReasonSection({
  error,
  onOtherReasonChange,
  onReasonPress,
  otherReason,
  selectedReason,
}: {
  error: string | null;
  onOtherReasonChange: (value: string) => void;
  onReasonPress: (reason: CancellationReason) => void;
  otherReason: string;
  selectedReason: CancellationReason | null;
}) {
  return (
    <View style={styles.section}>
      <SubscriptionSectionHeading>سبب الإلغاء</SubscriptionSectionHeading>
      <SolidCard style={styles.reasonsCard}>
        {cancellationReasons.map((option, index) => (
          <View key={option.id}>
            <ReasonRow option={option} selected={selectedReason === option.id} onPress={() => onReasonPress(option.id)} />
            {index < cancellationReasons.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
      {error ? (
        <AppText accessibilityLiveRegion="polite" style={styles.errorText} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
      {selectedReason === 'other' ? (
        <View style={styles.otherInputWrap}>
          <AppText style={styles.fullWidthRtlText} tone="secondary" variant="supporting">
            أخبرنا بالمزيد
          </AppText>
          <TextInput
            accessibilityLabel="أخبرنا بالمزيد"
            maxLength={500}
            multiline
            onChangeText={onOtherReasonChange}
            placeholder="اكتب سبب الإلغاء..."
            placeholderTextColor={colors.text.tertiary}
            style={styles.textArea}
            textAlign="right"
            value={otherReason}
          />
          <AppText align="left" style={styles.ltrText} tone="tertiary" variant="caption">
            {otherReason.length}/500
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function ReasonRow({
  option,
  selected,
  onPress,
}: {
  option: CancellationReasonOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.reasonRow, selected && styles.reasonRowSelected, pressed && styles.pressed]}
    >
      <AppText style={styles.reasonLabel} variant="supporting">
        {option.label}
      </AppText>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

function NoRefundNotice() {
  return (
    <SolidCard style={styles.noticeCard}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={20} />
      <View style={styles.copy}>
        <AppText style={styles.fullWidthRtlText} tone="warning" variant="cardTitle">
          المدفوعات السابقة
        </AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          لن يتم تنفيذ أي استرداد تلقائي عند الإلغاء. سيبقى الاشتراك فعالًا حتى نهاية الدورة الحالية.
        </AppText>
        <AppText style={styles.fullWidthRtlText} tone="tertiary" variant="caption">
          سياسة الاسترداد النهائية تعتمد على مزود الدفع في النسخة الإنتاجية.
        </AppText>
      </View>
    </SolidCard>
  );
}

function CancellationDateCard({ subscription }: { subscription: SubscriptionState }) {
  return (
    <SolidCard style={styles.dateCard}>
      <View style={styles.dateIcon}>
        <Ionicons color={colors.brand.calmGreen} name="calendar-clear-outline" size={21} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.fullWidthRtlText} variant="cardTitle">موعد توقف التجديد</AppText>
        <AppText numberOfLines={1} style={styles.dateValue} variant="screenTitle">{subscription.nextRenewalDate}</AppText>
        <AppText style={[styles.description, styles.fullWidthRtlText]} tone="secondary" variant="supporting">
          آخر يوم للوصول إلى مزايا {subscription.planName} هو {subscription.accessUntilDate}.
        </AppText>
      </View>
    </SolidCard>
  );
}

function ConfirmationCheckbox({
  checked,
  error,
  onPress,
}: {
  checked: boolean;
  error: string | null;
  onPress: () => void;
}) {
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityLabel="أفهم أن مزايا Capital Pro ستتوقف بعد نهاية دورة الفوترة الحالية."
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={({ pressed }) => [styles.checkboxRow, checked && styles.checkboxRowChecked, pressed && styles.pressed]}
      >
        <AppText style={styles.checkboxLabel} variant="supporting">
          {directionSafeText('أفهم أن مزايا Capital Pro ستتوقف بعد نهاية دورة الفوترة الحالية.')}
        </AppText>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={16} /> : null}
        </View>
      </Pressable>
      {error ? (
        <AppText accessibilityLiveRegion="polite" style={styles.errorText} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel} tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText align="left" style={[styles.infoValue, ltr ? styles.ltrText : styles.rtlValue]} variant="supporting">
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

function FeedbackCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.feedbackCard}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
      <AppText style={styles.feedbackText} tone="warning" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
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
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
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
    minWidth: 0,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  warningHero: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dangerIconLarge: {
    alignItems: 'center',
    backgroundColor: 'rgba(229,103,90,0.13)',
    borderColor: 'rgba(229,103,90,0.32)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  warningTitleRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
  },
  warningTitle: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  description: {
    lineHeight: 23,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  planNameText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  section: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
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
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  infoLabel: {
    flexBasis: '42%',
    flexShrink: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  consequencesCard: {
    padding: 0,
  },
  consequenceRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
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
  consequenceText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  localHelper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  helperText: {
    flex: 1,
    lineHeight: 19,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  retentionRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retentionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  rowDescription: {
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pauseCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  pauseIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,163,61,0.12)',
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: spacing.lg,
  },
  reasonsCard: {
    padding: 0,
  },
  reasonRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reasonRowSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderWidth: 1,
  },
  reasonLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
    borderColor: colors.brand.calmGreen,
  },
  radioInner: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  otherInputWrap: {
    alignItems: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  textArea: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    minHeight: 112,
    padding: spacing.lg,
    textAlignVertical: 'top',
    writingDirection: 'rtl',
  },
  noticeCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dateValue: {
    alignSelf: 'stretch',
    flexShrink: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  checkboxRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 66,
    padding: spacing.lg,
  },
  checkboxRowChecked: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: 23,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
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
    backgroundColor: colors.semantic.danger,
    borderColor: colors.semantic.danger,
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
  actions: {
    gap: spacing.md,
    width: '100%',
  },
  validationHint: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  errorText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fullWidthRtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlValue: {
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
