import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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

import { FormField } from '@/components/forms';
import { ConfirmationDialog, StateScreen } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type AccountDeletionReason =
  | 'not-using'
  | 'new-account'
  | 'privacy'
  | 'not-useful'
  | 'subscription'
  | 'other';

type DeleteAccountFormState = {
  reason: AccountDeletionReason | null;
  otherReason: string;
  confirmsDataLoss: boolean;
  confirmsPrechecks: boolean;
  confirmationPhrase: string;
};

type DeleteAccountErrors = {
  reason?: string;
  confirms?: string;
  confirmationPhrase?: string;
};

type ReminderAction = {
  id: 'data-copy' | 'subscriptions' | 'support';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const deletionReference = 'CAP-DEL-2026-1049';
const confirmationPhrase = 'حذف حسابي';

const defaultFormState: DeleteAccountFormState = {
  reason: null,
  otherReason: '',
  confirmsDataLoss: false,
  confirmsPrechecks: false,
  confirmationPhrase: '',
};

const deletedItems = [
  'معلومات الحساب والنشاط',
  'المعاملات المالية',
  'التقارير والرؤى',
  'الاشتراكات والالتزامات',
  'إعدادات الخصوصية والموافقات',
  'طلبات الدعم والمحادثات المحلية',
];

const reasonOptions: { id: AccountDeletionReason; label: string }[] = [
  { id: 'not-using', label: 'لم أعد أستخدم Capital' },
  { id: 'new-account', label: 'أريد إنشاء حساب جديد' },
  { id: 'privacy', label: 'لدي مخاوف تتعلق بالخصوصية' },
  { id: 'not-useful', label: 'التطبيق لا يلبي احتياجاتي' },
  { id: 'subscription', label: 'مشكلة في الاشتراك' },
  { id: 'other', label: 'أخرى' },
];

const reminderActions: ReminderAction[] = [
  {
    id: 'data-copy',
    icon: 'download-outline',
    title: 'طلب نسخة من بياناتي',
    description: 'احتفظ بنسخة من معلوماتك قبل الحذف',
  },
  {
    id: 'subscriptions',
    icon: 'repeat-outline',
    title: 'إلغاء الاشتراكات النشطة',
    description: 'تأكد من مراجعة أي اشتراك أو تجديد قادم',
  },
  {
    id: 'support',
    icon: 'chatbubble-ellipses-outline',
    title: 'التواصل مع الدعم',
    description: 'اطلب المساعدة قبل اتخاذ القرار النهائي',
  },
];

export function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formState, setFormState] = useState<DeleteAccountFormState>(defaultFormState);
  const [errors, setErrors] = useState<DeleteAccountErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dirty = useMemo(() => !areFormStatesEqual(formState, defaultFormState), [formState]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showFinalDialog) {
        setShowFinalDialog(false);
        return true;
      }

      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty && !submitted) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, showFinalDialog, showUnsavedDialog, submitted]);

  function goBackToPrivacyLegal() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.privacyLegal);
  }

  function handleBackPress() {
    if (dirty && !submitted) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToPrivacyLegal();
  }

  function updateFormState(nextState: Partial<DeleteAccountFormState>) {
    setNotice(null);
    setErrors((current) => ({ ...current, reason: undefined, confirms: undefined, confirmationPhrase: undefined }));
    setFormState((current) => ({ ...current, ...nextState }));
  }

  function selectReason(reason: AccountDeletionReason) {
    Haptics.selectionAsync().catch(() => null);
    updateFormState({ reason, otherReason: reason === 'other' ? formState.otherReason : '' });
  }

  function handleReminderPress(action: ReminderAction) {
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);

    if (action.id === 'data-copy') {
      router.push(routes.requestDataCopy);
      return;
    }

    if (action.id === 'support') {
      router.push(routes.contactSupport);
      return;
    }

    setNotice('إدارة الاشتراكات ستتوفر لاحقًا في هذا النموذج المحلي.');
  }

  function validateForm() {
    const nextErrors: DeleteAccountErrors = {};

    if (!formState.reason) {
      nextErrors.reason = 'اختر سبب حذف الحساب';
    }

    if (!formState.confirmsDataLoss || !formState.confirmsPrechecks) {
      nextErrors.confirms = 'أكد فهمك لنتائج حذف الحساب';
    }

    if (formState.confirmationPhrase.trim() !== confirmationPhrase) {
      nextErrors.confirmationPhrase = 'اكتب عبارة «حذف حسابي» للمتابعة';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleDeletePress() {
    Keyboard.dismiss();

    if (submitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setShowFinalDialog(true);
  }

  function handleFinalConfirm() {
    if (submitting) {
      return;
    }

    setShowFinalDialog(false);
    setSubmitting(true);
    submitTimerRef.current = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToPrivacyLegal();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  if (submitted) {
    return (
      <StateScreen
        description={`رقم الطلب: ‎${deletionReference}‎`}
        iconName="time-outline"
        onPrimaryAction={() => router.replace(routes.account)}
        onSecondaryAction={() => router.push(routes.contactSupport)}
        primaryActionLabel="العودة إلى الحساب"
        secondaryActionLabel="التواصل مع الدعم"
        title="تم إرسال طلب حذف الحساب"
        tone="warning"
      >
        <SolidCard style={styles.successInfoCard}>
          <AppText align="center" style={styles.successText} tone="secondary" variant="supporting">
            يمكنك التراجع خلال 7 أيام من خلال التواصل مع الدعم.
          </AppText>
        </SolidCard>
      </StateScreen>
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
        locations={[0, 0.48, 1]}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DeleteAccountHeader onBackPress={handleBackPress} />
        <PrimaryWarningCard />
        <DeletedItemsSection />
        <BeforeDeleteSection actions={reminderActions} onActionPress={handleReminderPress} />

        {notice ? (
          <SolidCard accessibilityLiveRegion="polite" style={styles.noticeCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="warning" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <ReasonSection
          error={errors.reason}
          formState={formState}
          onOtherReasonChange={(otherReason) => updateFormState({ otherReason })}
          onReasonPress={selectReason}
        />
        <ConfirmationsSection
          confirmsDataLoss={formState.confirmsDataLoss}
          confirmsPrechecks={formState.confirmsPrechecks}
          error={errors.confirms}
          onToggleDataLoss={() => updateFormState({ confirmsDataLoss: !formState.confirmsDataLoss })}
          onTogglePrechecks={() => updateFormState({ confirmsPrechecks: !formState.confirmsPrechecks })}
        />
        <PhraseSection
          error={errors.confirmationPhrase}
          value={formState.confirmationPhrase}
          onChangeText={(confirmationPhrase) => updateFormState({ confirmationPhrase })}
        />
        <IdentityInfoCard />
        <TimelineCard />

        <View style={styles.actions}>
          <AppButton disabled={submitting} loading={submitting} onPress={handleDeletePress} variant="danger">
            {submitting ? 'جاري إرسال الطلب' : 'طلب حذف الحساب'}
          </AppButton>
          <AppButton onPress={handleBackPress} variant="ghost">
            إلغاء
          </AppButton>
        </View>
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="العودة"
        confirmLabel="إرسال الطلب"
        description="سيبدأ طلب الحذف مع مهلة تراجع مدتها 7 أيام. لن يتم حذف أي بيانات حقيقية في هذا النموذج المحلي."
        onCancel={() => setShowFinalDialog(false)}
        onConfirm={handleFinalConfirm}
        title="إرسال طلب حذف الحساب؟"
        tone="danger"
        visible={showFinalDialog}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم تجاهل إعدادات طلب حذف الحساب."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </KeyboardAvoidingView>
  );
}

function DeleteAccountHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الخصوصية والقانونية"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        حذف الحساب
      </AppText>
    </View>
  );
}

function PrimaryWarningCard() {
  return (
    <SolidCard style={styles.warningCard}>
      <View style={styles.warningIcon}>
        <Ionicons color={colors.semantic.danger} name="shield-outline" size={24} />
      </View>
      <View style={styles.cardCopy}>
        <AppText tone="danger" variant="cardTitle">
          حذف الحساب إجراء نهائي
        </AppText>
        <AppText style={styles.cardDescription} tone="secondary" variant="supporting">
          سيؤدي حذف حسابك إلى إزالة بياناتك المالية وإعداداتك وتقاريرك وطلبات الدعم بشكل دائم بعد انتهاء مهلة التراجع.
        </AppText>
      </View>
    </SolidCard>
  );
}

function DeletedItemsSection() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">ما الذي سيتم حذفه؟</AppText>
      <SolidCard style={styles.rowsCard}>
        {deletedItems.map((item, index) => (
          <View key={item}>
            <View style={styles.deletedRow}>
              <View style={styles.dangerBullet}>
                <Ionicons color={colors.semantic.danger} name="remove-outline" size={15} />
              </View>
              <AppText style={styles.rowText} variant="body">
                {item}
              </AppText>
            </View>
            {index < deletedItems.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <View style={styles.prototypeNote}>
          <AppText style={styles.noteText} tone="tertiary" variant="caption">
            هذا التدفق نموذج محلي فقط، ولن يتم حذف بيانات حقيقية.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function BeforeDeleteSection({
  actions,
  onActionPress,
}: {
  actions: ReminderAction[];
  onActionPress: (action: ReminderAction) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">قبل حذف الحساب</AppText>
      <SolidCard style={styles.rowsCard}>
        {actions.map((action, index) => (
          <View key={action.id}>
            <ReminderActionRow action={action} onPress={() => onActionPress(action)} />
            {index < actions.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function ReminderActionRow({ action, onPress }: { action: ReminderAction; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${action.title}. ${action.description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.reminderRow, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
      <View style={styles.reminderIcon}>
        <Ionicons color={colors.brand.calmGreen} name={action.icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <AppText variant="body">{action.title}</AppText>
        <AppText style={styles.rowDescription} tone="secondary" variant="caption">
          {action.description}
        </AppText>
      </View>
    </Pressable>
  );
}

function ReasonSection({
  formState,
  error,
  onReasonPress,
  onOtherReasonChange,
}: {
  formState: DeleteAccountFormState;
  error?: string;
  onReasonPress: (reason: AccountDeletionReason) => void;
  onOtherReasonChange: (value: string) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">سبب حذف الحساب</AppText>
      <View style={styles.reasonList}>
        {reasonOptions.map((option) => (
          <ReasonOption
            key={option.id}
            label={option.label}
            selected={formState.reason === option.id}
            onPress={() => onReasonPress(option.id)}
          />
        ))}
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
      {formState.reason === 'other' ? (
        <View style={styles.otherReasonField}>
          <AppText tone="secondary" variant="supporting">
            أخبرنا بالمزيد (اختياري)
          </AppText>
          <TextInput
            multiline
            onChangeText={onOtherReasonChange}
            placeholder="اكتب ملاحظتك..."
            placeholderTextColor={colors.text.tertiary}
          style={styles.textArea}
          textAlign="right"
            textAlignVertical="top"
            value={formState.otherReason}
          />
        </View>
      ) : null}
    </View>
  );
}

function ReasonOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.reasonOption, selected && styles.reasonSelected, pressed && styles.pressed]}
    >
      <AppText style={styles.reasonLabel} tone={selected ? 'danger' : 'primary'} variant="body">
        {label}
      </AppText>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function ConfirmationsSection({
  confirmsDataLoss,
  confirmsPrechecks,
  error,
  onToggleDataLoss,
  onTogglePrechecks,
}: {
  confirmsDataLoss: boolean;
  confirmsPrechecks: boolean;
  error?: string;
  onToggleDataLoss: () => void;
  onTogglePrechecks: () => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">تأكيدات مطلوبة</AppText>
      <SolidCard style={styles.rowsCard}>
        <CheckboxRow
          checked={confirmsDataLoss}
          label="أفهم أن حذف الحساب سيؤدي إلى فقدان بياناتي بعد انتهاء مهلة التراجع."
          onPress={onToggleDataLoss}
        />
        <Divider />
        <CheckboxRow
          checked={confirmsPrechecks}
          label="أؤكد أنني راجعت الاشتراكات وطلبات نسخة البيانات قبل المتابعة."
          onPress={onTogglePrechecks}
        />
      </SolidCard>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

function CheckboxRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.checkboxRow, checked && styles.checkboxRowSelected, pressed && styles.pressed]}
    >
      <AppText style={styles.checkboxLabel} variant="body">
        {label}
      </AppText>
      <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
        {checked ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={17} /> : null}
      </View>
    </Pressable>
  );
}

function PhraseSection({
  value,
  error,
  onChangeText,
}: {
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">اكتب عبارة التأكيد</AppText>
      <FormField
        accessibilityLabel="عبارة تأكيد حذف الحساب"
        error={error}
        errorStyle={styles.formLabel}
        label="عبارة التأكيد"
        labelStyle={styles.formLabel}
        onChangeText={onChangeText}
        placeholder="اكتب: حذف حسابي"
        returnKeyType="done"
        value={value}
      />
    </View>
  );
}

function IdentityInfoCard() {
  return (
    <SolidCard style={styles.identityCard}>
      <Ionicons color={colors.semantic.warning} name="lock-closed-outline" size={18} />
      <View style={styles.cardCopy}>
        <AppText tone="warning" variant="cardTitle">
          التحقق من الهوية
        </AppText>
        <AppText style={styles.cardDescription} tone="secondary" variant="supporting">
          في النسخة الإنتاجية، سنطلب كلمة المرور أو رمز <AppText style={styles.ltrInline} tone="secondary" variant="supporting">PIN</AppText> قبل إرسال طلب الحذف.
        </AppText>
      </View>
    </SolidCard>
  );
}

function TimelineCard() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">مهلة التراجع</AppText>
      <SolidCard style={styles.timelineCard}>
        <View style={styles.timelineValueWrap}>
          <AppText align="center" style={styles.timelineValue} tone="warning" variant="numericValue">
            7 أيام
          </AppText>
        </View>
        <View style={styles.cardCopy}>
          <AppText variant="cardTitle">يمكنك التراجع عن الطلب</AppText>
          <AppText style={styles.cardDescription} tone="secondary" variant="supporting">
            يمكنك التراجع عن طلب الحذف خلال هذه المدة قبل الحذف النهائي.
          </AppText>
          <AppText style={styles.noteText} tone="tertiary" variant="caption">
            هذه المهلة جزء من النموذج التجريبي وقد تتغير في النسخة الإنتاجية.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function ErrorText({ children }: { children: string }) {
  return (
    <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
      {children}
    </AppText>
  );
}

function areFormStatesEqual(left: DeleteAccountFormState, right: DeleteAccountFormState) {
  return (
    left.reason === right.reason &&
    left.otherReason === right.otherReason &&
    left.confirmsDataLoss === right.confirmsDataLoss &&
    left.confirmsPrechecks === right.confirmsPrechecks &&
    left.confirmationPhrase === right.confirmationPhrase
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
    gap: spacing.md,
    minHeight: 42,
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
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  warningCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.30)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  warningIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(229,103,90,0.13)',
    borderColor: 'rgba(229,103,90,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cardCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  cardDescription: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  deletedRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dangerBullet: {
    alignItems: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderRadius: radii.pill,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  rowText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  prototypeNote: {
    backgroundColor: colors.surface.muted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    writingDirection: 'rtl',
  },
  noteText: {
    alignSelf: 'stretch',
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  reminderRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reminderIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  rowCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowDescription: {
    alignSelf: 'stretch',
    lineHeight: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  reasonList: {
    gap: spacing.sm,
  },
  reasonOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  reasonSelected: {
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.36)',
  },
  reasonLabel: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  radio: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    borderColor: colors.semantic.danger,
  },
  radioDot: {
    backgroundColor: colors.semantic.danger,
    borderRadius: radii.pill,
    height: 12,
    width: 12,
  },
  otherReasonField: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 104,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  formLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  checkboxRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 74,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkboxRowSelected: {
    backgroundColor: 'rgba(229,103,90,0.055)',
  },
  checkboxLabel: {
    alignSelf: 'stretch',
    flex: 1,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.small,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  checkboxSelected: {
    backgroundColor: colors.semantic.danger,
    borderColor: 'rgba(229,103,90,0.70)',
  },
  identityCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  ltrInline: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  timelineCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  timelineValueWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timelineValue: {
    fontSize: 24,
    lineHeight: 30,
  },
  actions: {
    gap: spacing.md,
  },
  successInfoCard: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
  },
  successText: {
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
