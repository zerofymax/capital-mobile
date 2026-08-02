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
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog, EmptyState, EmptyStateIcon } from '@/components/system';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  addPaymentMethodComingSoonMessage,
  currentPaymentRemoveWarning,
  updateSubscriptionPaymentMethod,
  useSubscriptionState,
  type SubscriptionPaymentMethod,
} from './subscription-data';

type PaymentCardBrand = 'visa' | 'mastercard' | 'mada' | 'generic';

type MaskedPaymentMethod = {
  id: string;
  brand: PaymentCardBrand;
  holderName: string;
  lastFour: string;
  expiry: string;
  isDefault: boolean;
};

type PaymentFormState = {
  holderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  setAsDefault: boolean;
};

type PaymentFormErrors = Partial<Record<keyof PaymentFormState, string>>;
type PaymentScreenMode = 'list' | 'add' | 'edit';

function createMaskedPaymentMethod(paymentMethod: SubscriptionPaymentMethod): MaskedPaymentMethod {
  return {
    id: paymentMethod.id,
    brand: paymentMethod.brand,
    holderName: paymentMethod.holderName,
    lastFour: paymentMethod.lastFour,
    expiry: paymentMethod.expiry,
    isDefault: true,
  };
}

const emptyForm: PaymentFormState = {
  holderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  setAsDefault: true,
};

function createEditForm(card: MaskedPaymentMethod): PaymentFormState {
  return {
    holderName: card.holderName,
    cardNumber: `•••• •••• •••• ${card.lastFour}`,
    expiry: card.expiry,
    cvv: '',
    setAsDefault: card.isDefault,
  };
}

function formatCardNumber(value: string) {
  if (value.includes('•')) {
    return value;
  }

  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(cardNumber: string): PaymentCardBrand {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.startsWith('4')) {
    return 'visa';
  }

  if (digits.startsWith('5')) {
    return 'mastercard';
  }

  if (digits.startsWith('588') || digits.startsWith('9682')) {
    return 'mada';
  }

  return 'generic';
}

function getBrandLabel(brand: PaymentCardBrand) {
  const labels: Record<PaymentCardBrand, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    mada: 'mada',
    generic: 'بطاقة',
  };

  return labels[brand];
}

export function PaymentMethodScreen() {
  const insets = useSafeAreaInsets();
  const subscription = useSubscriptionState();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [mode, setMode] = useState<PaymentScreenMode>('list');
  const [paymentMethod, setPaymentMethod] = useState<MaskedPaymentMethod | null>(() => createMaskedPaymentMethod(subscription.paymentMethod));
  const [form, setForm] = useState<PaymentFormState>(emptyForm);
  const [formBaseline, setFormBaseline] = useState<PaymentFormState>(emptyForm);
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [unsavedDialogVisible, setUnsavedDialogVisible] = useState(false);

  const dirty = mode !== 'list' && JSON.stringify(form) !== JSON.stringify(formBaseline);
  const formTitle = mode === 'edit' ? 'تعديل وسيلة الدفع' : 'إضافة وسيلة دفع جديدة';
  const formBrand = useMemo(() => {
    if (mode === 'edit' && form.cardNumber.includes('•') && paymentMethod) {
      return paymentMethod.brand;
    }

    return detectBrand(form.cardNumber);
  }, [form.cardNumber, mode, paymentMethod]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      clearSensitiveValues();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (removeDialogVisible) {
        setRemoveDialogVisible(false);
        return true;
      }

      if (unsavedDialogVisible) {
        setUnsavedDialogVisible(false);
        return true;
      }

      if (dirty && !saving) {
        setUnsavedDialogVisible(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, removeDialogVisible, saving, unsavedDialogVisible]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.currentSubscription);
  }

  function requestBack() {
    Keyboard.dismiss();

    if (dirty && !saving) {
      setUnsavedDialogVisible(true);
      return;
    }

    goBack();
  }

  function clearSensitiveValues() {
    setForm(emptyForm);
    setFormBaseline(emptyForm);
    setErrors({});
  }

  function openAddForm() {
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setFeedback(addPaymentMethodComingSoonMessage);
  }

  function openEditForm() {
    if (!paymentMethod) {
      return;
    }

    Keyboard.dismiss();
    const nextForm = createEditForm(paymentMethod);
    setMode('edit');
    setForm(nextForm);
    setFormBaseline(nextForm);
    setErrors({});
    setFeedback(null);
  }

  function closeFormWithoutPrompt() {
    clearSensitiveValues();
    setMode('list');
  }

  function requestCloseForm() {
    Keyboard.dismiss();

    if (dirty && !saving) {
      setUnsavedDialogVisible(true);
      return;
    }

    closeFormWithoutPrompt();
  }

  function discardChanges() {
    setUnsavedDialogVisible(false);
    closeFormWithoutPrompt();
  }

  function continueEditing() {
    setUnsavedDialogVisible(false);
  }

  function updateField(field: keyof PaymentFormState, value: string | boolean) {
    setForm((current) => {
      let nextValue = value;

      if (field === 'cardNumber' && typeof value === 'string') {
        nextValue = formatCardNumber(value);
      }

      if (field === 'expiry' && typeof value === 'string') {
        nextValue = formatExpiry(value);
      }

      return { ...current, [field]: nextValue };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }

  function validateForm() {
    const nextErrors: PaymentFormErrors = {};
    const holderName = form.holderName.trim();
    const digits = form.cardNumber.replace(/\D/g, '');
    const maskedEditNumber = mode === 'edit' && form.cardNumber.includes('•') && paymentMethod?.lastFour === digits;
    const [month = '', year = ''] = form.expiry.split('/');
    const monthNumber = Number(month);

    if (!holderName || !/^[A-Za-z\s]+$/.test(holderName)) {
      nextErrors.holderName = 'أدخل الاسم على البطاقة';
    }

    if (!maskedEditNumber && digits.length !== 16) {
      nextErrors.cardNumber = 'أدخل رقم بطاقة صحيحًا';
    }

    if (month.length !== 2 || year.length !== 2 || monthNumber < 1 || monthNumber > 12) {
      nextErrors.expiry = 'أدخل تاريخ انتهاء صحيحًا';
    }

    if (!/^\d{3}$/.test(form.cvv)) {
      nextErrors.cvv = 'أدخل رمز أمان صحيحًا';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    Keyboard.dismiss();

    if (saving) {
      return;
    }

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    setSaving(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      const digits = form.cardNumber.replace(/\D/g, '');
      const maskedEditNumber = mode === 'edit' && form.cardNumber.includes('•') && paymentMethod;
      const nextCard: MaskedPaymentMethod = {
        id: paymentMethod?.id ?? 'local-prototype-card',
        brand: maskedEditNumber ? paymentMethod.brand : detectBrand(form.cardNumber),
        holderName: form.holderName.trim().toUpperCase(),
        lastFour: maskedEditNumber ? paymentMethod.lastFour : digits.slice(-4),
        expiry: form.expiry,
        isDefault: form.setAsDefault,
      };

      updateSubscriptionPaymentMethod({
        id: nextCard.id,
        brand: nextCard.brand,
        holderName: nextCard.holderName,
        lastFour: nextCard.lastFour,
        expiry: nextCard.expiry,
        label: `${getBrandLabel(nextCard.brand)} •••• ${nextCard.lastFour}`,
      });
      setPaymentMethod(nextCard);
      setSaving(false);
      closeFormWithoutPrompt();
      setFeedback('تم حفظ وسيلة الدفع محليًا');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    }, 680);
  }

  function handleDefaultPress() {
    if (paymentMethod?.isDefault) {
      setFeedback('هذه هي وسيلة الدفع الافتراضية');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      return;
    }

    if (paymentMethod) {
      setPaymentMethod({ ...paymentMethod, isDefault: true });
      setFeedback('تم تعيين وسيلة الدفع كافتراضية محليًا');
    }
  }

  function confirmRemove() {
    setRemoveDialogVisible(false);
    closeFormWithoutPrompt();
    setFeedback(currentPaymentRemoveWarning);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
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
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PaymentHeader onBackPress={requestBack} />

        {mode === 'list' ? (
          <>
            <IntroCard />
            <CurrentPaymentSection
              card={paymentMethod}
              onAdd={openAddForm}
              onDefault={handleDefaultPress}
              onEdit={openEditForm}
              onRemove={() => setRemoveDialogVisible(true)}
            />
            <SecurityNotice />
            {feedback ? <FeedbackCard message={feedback} tone={feedback.includes('إزالة') ? 'warning' : 'success'} /> : null}
          </>
        ) : (
          <>
            <PaymentForm
              brand={formBrand}
              errors={errors}
              form={form}
              mode={mode}
              onCancel={requestCloseForm}
              onSave={handleSave}
              onUpdateField={updateField}
              saving={saving}
              title={formTitle}
            />
            <SecurityNotice />
          </>
        )}
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="فهمت"
        description={currentPaymentRemoveWarning}
        onCancel={() => setRemoveDialogVisible(false)}
        onConfirm={confirmRemove}
        title="إزالة وسيلة الدفع؟"
        tone="danger"
        visible={removeDialogVisible}
      />

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، سيتم حذف بيانات البطاقة التي أدخلتها."
        onCancel={discardChanges}
        onConfirm={continueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={unsavedDialogVisible}
      />
    </KeyboardAvoidingView>
  );
}

function PaymentHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        وسيلة الدفع
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

function IntroCard() {
  return (
    <SolidCard style={styles.introCard}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.brand.calmGreen} name="wallet-outline" size={21} />
      </View>
      <View style={styles.cardCopy}>
        <AppText variant="cardTitle">إدارة وسيلة الدفع</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          أضف أو حدّث وسيلة الدفع المستخدمة في الاشتراك. جميع البيانات في هذه الصفحة تجريبية ومحلية فقط.
        </AppText>
      </View>
    </SolidCard>
  );
}

function CurrentPaymentSection({
  card,
  onAdd,
  onDefault,
  onEdit,
  onRemove,
}: {
  card: MaskedPaymentMethod | null;
  onAdd: () => void;
  onDefault: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">وسيلة الدفع الحالية</AppText>
      {card ? (
        <>
          <MaskedCard card={card} />
          <SolidCard style={styles.rowsCard}>
            <ActionRow icon="create-outline" label="تعديل البيانات" onPress={onEdit} />
            <Divider />
            <ActionRow
              disabled={card.isDefault}
              icon="star-outline"
              label="تعيين كافتراضية"
              onPress={onDefault}
              supporting={card.isDefault ? 'هذه هي وسيلة الدفع الافتراضية' : undefined}
            />
            <Divider />
            <ActionRow danger icon="trash-outline" label="إزالة البطاقة" onPress={onRemove} />
          </SolidCard>
          <SolidCard style={styles.warningCard}>
            <Ionicons color={colors.semantic.warning} name="alert-circle-outline" size={19} />
            <View style={styles.cardCopy}>
              <AppText tone="warning" variant="body">
                وسيلة الدفع مرتبطة بالاشتراك
              </AppText>
              <AppText style={styles.description} tone="secondary" variant="caption">
                في النسخة الإنتاجية، قد تحتاج إلى إضافة وسيلة بديلة للحفاظ على التجديد التلقائي.
              </AppText>
            </View>
          </SolidCard>
          <AppButton onPress={onAdd} variant="secondary">
            إضافة وسيلة دفع جديدة
          </AppButton>
        </>
      ) : (
        <EmptyState
          actionLabel="إضافة وسيلة دفع"
          description="أضف بطاقة لاستخدامها عند الاشتراك أو الترقية. لن يتم خصم أي مبلغ في النموذج التجريبي."
          icon={<EmptyStateIcon name="card-outline" />}
          onAction={onAdd}
          title="لا توجد وسيلة دفع"
        />
      )}
    </View>
  );
}

function MaskedCard({ card }: { card: MaskedPaymentMethod }) {
  const brand = getBrandLabel(card.brand);

  return (
    <View accessibilityLabel={`${brand}. بطاقة منتهية بالأرقام ${card.lastFour}. تنتهي ${card.expiry}`} style={styles.maskedCard}>
      <LinearGradient
        colors={['rgba(31,90,58,0.54)', 'rgba(11,46,38,0.88)', 'rgba(7,9,12,0.92)']}
        end={{ x: 0.94, y: 1 }}
        locations={[0, 0.54, 1]}
        start={{ x: 0.08, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.maskedCardTop}>
        <AppText align="left" style={styles.ltrText} variant="cardTitle">
          {brand}
        </AppText>
        {card.isDefault ? (
          <View style={styles.defaultBadge}>
            <AppText align="center" tone="success" variant="caption">
              الافتراضية
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText align="left" style={styles.cardNumber} variant="screenTitle">
        •••• {card.lastFour}
      </AppText>
      <View style={styles.maskedCardBottom}>
        <View style={styles.cardMeta}>
          <AppText tone="tertiary" variant="caption">
            الاسم
          </AppText>
          <AppText align="left" numberOfLines={1} style={styles.ltrText} variant="supporting">
            {card.holderName}
          </AppText>
        </View>
        <View style={styles.cardMeta}>
          <AppText tone="tertiary" variant="caption">
            الانتهاء
          </AppText>
          <AppText align="left" style={styles.ltrText} variant="supporting">
            {card.expiry}
          </AppText>
        </View>
      </View>
      <AppText tone="secondary" variant="caption">
        مفعلة للاشتراك الحالي
      </AppText>
    </View>
  );
}

function ActionRow({
  label,
  icon,
  onPress,
  supporting,
  danger = false,
  disabled = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  supporting?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={supporting ? `${label}. ${supporting}` : label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <View style={[styles.actionIcon, danger && styles.dangerIcon]}>
        <Ionicons color={danger ? colors.semantic.danger : colors.brand.calmGreen} name={icon} size={18} />
      </View>
      <View style={styles.cardCopy}>
        <AppText tone={danger ? 'danger' : 'primary'} variant="body">
          {label}
        </AppText>
        {supporting ? (
          <AppText tone="secondary" variant="caption">
            {supporting}
          </AppText>
        ) : null}
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
    </Pressable>
  );
}

function PaymentForm({
  brand,
  errors,
  form,
  mode,
  onCancel,
  onSave,
  onUpdateField,
  saving,
  title,
}: {
  brand: PaymentCardBrand;
  errors: PaymentFormErrors;
  form: PaymentFormState;
  mode: PaymentScreenMode;
  onCancel: () => void;
  onSave: () => void;
  onUpdateField: (field: keyof PaymentFormState, value: string | boolean) => void;
  saving: boolean;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">{title}</AppText>
      <SolidCard style={styles.formCard}>
        <View style={styles.detectedBrandRow}>
          <View style={styles.infoIcon}>
            <Ionicons color={colors.brand.calmGreen} name="card-outline" size={20} />
          </View>
          <View style={styles.cardCopy}>
            <AppText variant="body">{getBrandLabel(brand)}</AppText>
            <AppText tone="secondary" variant="caption">
              كشف محلي تجريبي فقط، بدون تحقق بنكي.
            </AppText>
          </View>
        </View>
        <PaymentInput
          autoCapitalize="characters"
          error={errors.holderName}
          label="الاسم على البطاقة"
          onChangeText={(value) => onUpdateField('holderName', value)}
          placeholder="كما هو مكتوب على البطاقة"
          value={form.holderName}
        />
        <PaymentInput
          error={errors.cardNumber}
          keyboardType="number-pad"
          label="رقم البطاقة"
          maxLength={19}
          onChangeText={(value) => onUpdateField('cardNumber', value)}
          placeholder="0000 0000 0000 0000"
          value={form.cardNumber}
        />
        <View style={styles.formSplitRow}>
          <PaymentInput
            error={errors.expiry}
            keyboardType="number-pad"
            label="تاريخ الانتهاء"
            maxLength={5}
            onChangeText={(value) => onUpdateField('expiry', value)}
            placeholder="MM/YY"
            value={form.expiry}
          />
          <PaymentInput
            error={errors.cvv}
            keyboardType="number-pad"
            label="رمز الأمان CVV"
            maxLength={3}
            onChangeText={(value) => onUpdateField('cvv', value.replace(/\D/g, '').slice(0, 3))}
            placeholder="123"
            secureTextEntry
            textContentType="oneTimeCode"
            value={form.cvv}
          />
        </View>
        <Pressable
          accessibilityLabel="تعيين كوسيلة الدفع الافتراضية"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.setAsDefault }}
          onPress={() => onUpdateField('setAsDefault', !form.setAsDefault)}
          style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
        >
          <AppText style={styles.checkboxLabel} variant="supporting">
            تعيين كوسيلة الدفع الافتراضية
          </AppText>
          <View style={[styles.checkbox, form.setAsDefault && styles.checkboxChecked]}>
            {form.setAsDefault ? <Ionicons color={colors.text.primary} name="checkmark-outline" size={16} /> : null}
          </View>
        </Pressable>
        <View style={styles.formActions}>
          <AppButton disabled={saving} loading={saving} onPress={onSave}>
            {saving ? 'جاري الحفظ' : mode === 'edit' ? 'حفظ التعديلات' : 'إضافة البطاقة'}
          </AppButton>
          <AppButton disabled={saving} onPress={onCancel} variant="secondary">
            إلغاء
          </AppButton>
        </View>
      </SolidCard>
    </View>
  );
}

function PaymentInput({ error, label, style, ...props }: { label: string; error?: string } & TextInputProps) {
  return (
    <View style={styles.inputGroup}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, style]}
        textAlign="left"
      />
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function SecurityNotice() {
  return (
    <SolidCard style={styles.securityCard}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={21} />
      </View>
      <View style={styles.cardCopy}>
        <AppText variant="cardTitle">بيانات الدفع محمية</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          في النسخة الإنتاجية، تُرسل بيانات البطاقة مباشرة إلى مزود الدفع ولا يحتفظ Capital بالرقم الكامل أو رمز CVV.
        </AppText>
        <AppText tone="tertiary" variant="caption">
          هذه الصفحة نموذج محلي. لا يتم إرسال بيانات دفع أو تنفيذ عملية مالية.
        </AppText>
      </View>
    </SolidCard>
  );
}

function FeedbackCard({ message, tone }: { message: string; tone: 'success' | 'warning' }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={[styles.feedbackCard, tone === 'warning' && styles.feedbackWarning]}>
      <Ionicons
        color={tone === 'warning' ? colors.semantic.warning : colors.semantic.success}
        name={tone === 'warning' ? 'information-circle-outline' : 'checkmark-circle-outline'}
        size={18}
      />
      <AppText style={styles.feedbackText} tone={tone} variant="supporting">
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 48,
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
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  introCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11,46,38,0.70)',
    borderColor: 'rgba(167,200,161,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.30)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  description: {
    lineHeight: 23,
  },
  section: {
    gap: spacing.md,
  },
  maskedCard: {
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.lg,
    minHeight: 190,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  maskedCardTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  defaultBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cardNumber: {
    color: colors.text.primary,
    letterSpacing: 1,
    writingDirection: 'ltr',
  },
  maskedCardBottom: {
    flexDirection: 'row-reverse',
    gap: spacing.lg,
  },
  cardMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  ltrText: {
    writingDirection: 'ltr',
  },
  rowsCard: {
    padding: 0,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
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
  warningCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  securityCard: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackWarning: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  feedbackText: {
    flex: 1,
  },
  formCard: {
    gap: spacing.lg,
  },
  detectedBrandRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    writingDirection: 'ltr',
  },
  formSplitRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  checkboxRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 54,
    padding: spacing.lg,
  },
  checkboxLabel: {
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
  formActions: {
    gap: spacing.md,
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
