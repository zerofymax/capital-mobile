import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/forms';
import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

import {
  businessInformationOptions,
  getBusinessInformationSnapshot,
  saveBusinessInformation,
  type BusinessActivityType,
  type CompanySize,
  type BusinessInformationState,
  type CountryOption,
  type CurrencyOption,
  type FiscalYearStart,
  type RevenueModel,
} from './business-information-data';

type BusinessInformationErrors = Partial<Record<keyof BusinessInformationState, string>>;

const descriptionMaxLength = 160;
const saveMessage = 'تم حفظ معلومات النشاط في النسخة التجريبية.';

export function BusinessInformationScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialState = getBusinessInformationSnapshot();
  const [baseline, setBaseline] = useState<BusinessInformationState>(initialState);
  const [formState, setFormState] = useState<BusinessInformationState>(initialState);
  const [errors, setErrors] = useState<BusinessInformationErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const stackPairs = width < 430;
  const dirty = useMemo(() => !areBusinessStatesEqual(formState, baseline), [baseline, formState]);
  const currencyChanged = formState.currency !== baseline.currency;

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirty) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [dirty, showUnsavedDialog]);

  function updateFormState(nextState: Partial<BusinessInformationState>) {
    setNotice(null);
    setErrors((current) => {
      const nextErrors = { ...current };
      (Object.keys(nextState) as (keyof BusinessInformationState)[]).forEach((key) => {
        nextErrors[key] = undefined;
      });
      return nextErrors;
    });
    setFormState((current) => ({ ...current, ...nextState }));
  }

  function goBackToAccount() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function handleBackPress() {
    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToAccount();
  }

  function validateForm() {
    const nextErrors: BusinessInformationErrors = {};

    if (!formState.businessName.trim()) {
      nextErrors.businessName = 'أدخل الاسم التجاري';
    }

    if (!formState.businessType) {
      nextErrors.businessType = 'اختر نوع النشاط';
    }

    if (!formState.country) {
      nextErrors.country = 'اختر الدولة';
    }

    if (!formState.currency) {
      nextErrors.currency = 'اختر العملة';
    }

    if (formState.taxNumber.trim() && !/^[0-9\s\-./]+$/.test(formState.taxNumber.trim())) {
      nextErrors.taxNumber = 'استخدم أرقامًا أو فواصل بسيطة فقط';
    }

    if (formState.website.trim() && !looksLikeUrl(formState.website.trim())) {
      nextErrors.website = 'أدخل رابطًا صحيحًا مثل https://capital.app';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSavePress() {
    Keyboard.dismiss();

    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    saveTimerRef.current = setTimeout(() => {
      const savedState: BusinessInformationState = {
        ...formState,
        businessName: formState.businessName.trim(),
        legalName: formState.legalName.trim(),
        description: formState.description.trim(),
        taxNumber: formState.taxNumber.trim(),
        website: formState.website.trim(),
      };

      saveBusinessInformation(savedState);
      setBaseline(savedState);
      setFormState(savedState);
      setSaving(false);
      setNotice(saveMessage);
    }, 350);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToAccount();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        style={styles.keyboardRoot}
      >
        <BusinessInformationHeader onBackPress={handleBackPress} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {notice ? <NoticeCard message={notice} /> : null}

          <FormSection title="هوية النشاط">
            <FormField
              accessibilityLabel="الاسم التجاري"
              containerStyle={styles.rtlField}
              error={errors.businessName}
              errorStyle={styles.fieldError}
              label="الاسم التجاري"
              labelStyle={styles.fieldLabel}
              onChangeText={(businessName) => updateFormState({ businessName })}
              placeholder="استوديو رقمي"
              returnKeyType="next"
              value={formState.businessName}
            />
            <FormField
              accessibilityLabel="الاسم القانوني"
              containerStyle={styles.rtlField}
              error={errors.legalName}
              errorStyle={styles.fieldError}
              label="الاسم القانوني (اختياري)"
              labelStyle={styles.fieldLabel}
              onChangeText={(legalName) => updateFormState({ legalName })}
              placeholder="شركة الاستوديو الرقمي المحدودة"
              returnKeyType="next"
              value={formState.legalName}
            />
            <View style={styles.textAreaWrap}>
              <FormField
                accessibilityLabel="وصف مختصر للنشاط"
                containerStyle={styles.rtlField}
                error={errors.description}
                errorStyle={styles.fieldError}
                label="وصف مختصر للنشاط (اختياري)"
                labelStyle={styles.fieldLabel}
                maxLength={descriptionMaxLength}
                multiline
                onChangeText={(description) => updateFormState({ description })}
                placeholder="اكتب وصفًا مختصرًا يساعد Capital على فهم نشاطك."
                returnKeyType="done"
                style={styles.textAreaInput}
                textAlignVertical="top"
                value={formState.description}
              />
              <AppText align="left" tone="tertiary" variant="caption">
                {formState.description.length}/{descriptionMaxLength}
              </AppText>
            </View>
          </FormSection>

          <FormSection title="تصنيف النشاط">
            <View style={[styles.selectPair, stackPairs && styles.selectPairStacked]}>
              <BusinessSelectField
                error={errors.businessType}
                label="نوع النشاط"
                onSelect={(businessType) => updateFormState({ businessType: businessType as BusinessActivityType })}
                options={businessInformationOptions.businessTypes}
                value={formState.businessType}
              />
              <BusinessSelectField
                label="نموذج الإيرادات"
                onSelect={(revenueModel) => updateFormState({ revenueModel: revenueModel as RevenueModel })}
                options={businessInformationOptions.revenueModels}
                value={formState.revenueModel}
              />
            </View>
          </FormSection>

          <FormSection title="الموقع والعملة">
            <View style={[styles.selectPair, stackPairs && styles.selectPairStacked]}>
              <BusinessSelectField
                error={errors.country}
                label="الدولة"
                onSelect={(country) => updateFormState({ country: country as CountryOption })}
                options={businessInformationOptions.countries}
                value={formState.country}
              />
              <BusinessSelectField
                error={errors.currency}
                label="العملة الأساسية"
                onSelect={(currency) => updateFormState({ currency: currency as CurrencyOption })}
                options={businessInformationOptions.currencies}
                value={formState.currency}
              />
            </View>
            {currencyChanged ? <CurrencyWarningCard /> : null}
          </FormSection>

          <FormSection title="السنة المالية">
            <BusinessSelectField
              fullWidth
              label="بداية السنة المالية"
              onSelect={(fiscalYearStart) => updateFormState({ fiscalYearStart: fiscalYearStart as FiscalYearStart })}
              options={businessInformationOptions.fiscalYearStarts}
              value={formState.fiscalYearStart}
            />
          </FormSection>

          <FormSection title="معلومات اختيارية">
            <FormField
              accessibilityLabel="الرقم الضريبي"
              containerStyle={styles.rtlField}
              error={errors.taxNumber}
              errorStyle={styles.fieldError}
              keyboardType="numbers-and-punctuation"
              label="الرقم الضريبي (اختياري)"
              labelStyle={styles.fieldLabel}
              onChangeText={(taxNumber) => updateFormState({ taxNumber })}
              placeholder="غير مضاف بعد"
              returnKeyType="next"
              style={styles.ltrInput}
              value={formState.taxNumber}
            />
            <FormField
              accessibilityLabel="الموقع الإلكتروني"
              autoCapitalize="none"
              containerStyle={styles.rtlField}
              error={errors.website}
              errorStyle={styles.fieldError}
              keyboardType="url"
              label="الموقع الإلكتروني (اختياري)"
              labelStyle={styles.fieldLabel}
              onChangeText={(website) => updateFormState({ website })}
              placeholder="https://capital.app"
              returnKeyType="done"
              style={styles.ltrInput}
              value={formState.website}
            />
            <BusinessSelectField
              fullWidth
              label="حجم الفريق"
              onSelect={(teamSize) => updateFormState({ teamSize: teamSize as CompanySize })}
              options={businessInformationOptions.companySizes}
              value={formState.teamSize}
            />
          </FormSection>

          <View style={styles.actions}>
            <AppButton disabled={saving} loading={saving} onPress={handleSavePress}>
              {saving ? 'جاري الحفظ' : 'حفظ معلومات النشاط'}
            </AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationDialog
        cancelLabel="تجاهل التغييرات"
        confirmLabel="متابعة التعديل"
        description="إذا غادرت الآن، لن يتم حفظ تعديلات معلومات النشاط."
        onCancel={handleDiscardChanges}
        onConfirm={handleContinueEditing}
        title="لديك تغييرات غير محفوظة"
        tone="warning"
        visible={showUnsavedDialog}
      />
    </SafeAreaView>
  );
}

function BusinessInformationHeader({ onBackPress }: { onBackPress: () => void }) {
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
      <View style={styles.headerCopy}>
        <AppText style={styles.headerText} variant="screenTitle">
          معلومات النشاط
        </AppText>
        <AppText style={styles.headerText} tone="secondary" variant="supporting">
          حدّث البيانات الأساسية التي يستخدمها Capital في التقارير والتحليلات.
        </AppText>
      </View>
    </View>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleWrap}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">{title}</AppText>
      </View>
      <SolidCard style={styles.formCard}>{children}</SolidCard>
    </View>
  );
}

function BusinessSelectField({
  error,
  ...props
}: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
  fullWidth?: boolean;
  error?: string;
}) {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  function openPicker() {
    Keyboard.dismiss();
    setPickerVisible(true);
  }

  function closePicker() {
    setPickerVisible(false);
  }

  function selectOption(option: string) {
    props.onSelect(option);
    setPickerVisible(false);
  }

  return (
    <View style={styles.selectFieldWrap}>
      <View style={[styles.selectRoot, props.fullWidth && styles.fullWidth]}>
        <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
          {props.label}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={openPicker}
          style={({ pressed }) => [styles.selectField, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.tertiary} name="chevron-down" size={16} />
          <AppText align="right" style={styles.selectValue} variant="body">
            {directionSafeText(props.value)}
          </AppText>
        </Pressable>
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" style={styles.selectError} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
      <Modal animationType="fade" onRequestClose={closePicker} statusBarTranslucent transparent visible={pickerVisible}>
        <View style={styles.pickerModalRoot}>
          <Pressable accessibilityLabel="إغلاق القائمة" onPress={closePicker} style={styles.pickerBackdrop} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={closePicker}>
                <AppText tone="link" variant="supporting">
                  إلغاء
                </AppText>
              </Pressable>
              <AppText style={styles.pickerTitle} variant="cardTitle">{props.label}</AppText>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.pickerOptionsContent,
                { paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxl) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {props.options.map((option) => {
                const selected = option === props.value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => selectOption(option)}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      selected && styles.pickerOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                    <AppText align="right" style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                      {directionSafeText(option)}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CurrencyWarningCard() {
  return (
    <SolidCard style={styles.warningCard}>
      <Ionicons color={colors.semantic.warning} name="cash-outline" size={18} />
      <AppText style={styles.warningText} tone="warning" variant="supporting">
        تغيير العملة سيؤثر على طريقة عرض المبالغ الجديدة، ولا يحوّل البيانات السابقة تلقائيًا.
      </AppText>
    </SolidCard>
  );
}

function NoticeCard({ message }: { message: string }) {
  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.noticeCard}>
      <Ionicons color={colors.semantic.success} name="checkmark-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="success" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

function looksLikeUrl(value: string) {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(value);
}

function areBusinessStatesEqual(left: BusinessInformationState, right: BusinessInformationState) {
  return JSON.stringify(left) === JSON.stringify(right);
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
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
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
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  section: {
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  sectionTitleWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  formCard: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.lg,
  },
  selectPair: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  selectPairStacked: {
    flexDirection: 'column',
  },
  selectFieldWrap: {
    alignItems: 'stretch',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  selectRoot: {
    alignItems: 'stretch',
    direction: 'ltr',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  fieldError: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  rtlField: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  fullWidth: {
    flexBasis: '100%',
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  selectValue: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  selectError: {
    paddingTop: spacing.xs,
  },
  textAreaWrap: {
    gap: spacing.xs,
  },
  textAreaInput: {
    minHeight: 98,
    paddingTop: spacing.md,
  },
  warningCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  warningText: {
    flex: 1,
    lineHeight: 21,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
    lineHeight: 23,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  actions: {
    gap: spacing.md,
  },
  pickerModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pickerSheet: {
    backgroundColor: 'rgba(17,20,25,0.98)',
    borderColor: colors.glass.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '72%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  pickerHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 42,
  },
  pickerHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  pickerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pickerOptionsContent: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.56)',
  },
  pickerOptionText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
