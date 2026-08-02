import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  getProfileAvatarColor,
  getProfileInitial,
  profileAvatarColors,
  updateUserProfile,
  useUserProfile,
  type ProfileAvatarColorId,
  type ProfileAvatarType,
  type UserProfileState,
} from './profile-data';

type EditProfileFormState = {
  displayName: string;
  email: string;
  phone: string;
  jobTitle: string;
  avatarType: ProfileAvatarType;
  avatarInitial: string;
  avatarColor: ProfileAvatarColorId;
};

type EditProfileErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
};

const successMessage = 'تم تحديث الملف الشخصي في النموذج التجريبي.';
const imageComingSoonMessage = 'رفع الصور سيكون متاحًا لاحقًا.';

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useUserProfile();
  const initialFormState = useMemo(() => createProfileFormState(profile), [profile]);
  const [baseline, setBaseline] = useState<EditProfileFormState>(initialFormState);
  const [formState, setFormState] = useState<EditProfileFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const dirtyRef = useRef(false);

  const dirty = useMemo(() => !areProfileStatesEqual(formState, baseline), [baseline, formState]);
  const validation = useMemo(() => validateProfileForm(formState), [formState]);
  const saveDisabled = !dirty || !validation.valid;
  const displayedErrors = submitted ? validation.errors : {};

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showAvatarPicker) {
        setShowAvatarPicker(false);
        return true;
      }

      if (showUnsavedDialog) {
        setShowUnsavedDialog(false);
        return true;
      }

      if (dirtyRef.current) {
        setShowUnsavedDialog(true);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [showAvatarPicker, showUnsavedDialog]);

  function updateFormState(nextState: Partial<EditProfileFormState>) {
    setNotice(null);
    setSubmitted(false);
    setFormState((current) => {
      const next = { ...current, ...nextState };

      if (nextState.displayName !== undefined && current.avatarType === 'initial') {
        next.avatarInitial = getProfileInitial(nextState.displayName);
      }

      return next;
    });
  }

  function goBackToAccount() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.account);
  }

  function requestClose() {
    Keyboard.dismiss();

    if (dirty) {
      setShowUnsavedDialog(true);
      return;
    }

    goBackToAccount();
  }

  function handleSavePress() {
    Keyboard.dismiss();
    setSubmitted(true);

    if (!validation.valid) {
      return;
    }

    const sanitizedState = sanitizeProfileForm(formState);
    updateUserProfile(sanitizedState);
    setFormState(sanitizedState);
    setBaseline(sanitizedState);
    setSubmitted(false);
    setNotice(successMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }

  function handleUseInitial() {
    setShowAvatarPicker(false);
    updateFormState({
      avatarInitial: getProfileInitial(formState.displayName),
      avatarType: 'initial',
    });
  }

  function handleAvatarColorPress(avatarColor: ProfileAvatarColorId) {
    setShowAvatarPicker(false);
    updateFormState({
      avatarColor,
      avatarInitial: getProfileInitial(formState.displayName),
      avatarType: 'initial',
    });
  }

  function handleImageUploadPress() {
    setShowAvatarPicker(false);
    setNotice(imageComingSoonMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    goBackToAccount();
  }

  function handleContinueEditing() {
    setShowUnsavedDialog(false);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
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
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <EditProfileHeader onBackPress={requestClose} />

          <AvatarSection
            formState={formState}
            onChangePhotoPress={() => {
              Keyboard.dismiss();
              setShowAvatarPicker(true);
            }}
          />

          <InfoNotice />

          {notice ? <InlineNotice message={notice} tone={notice === successMessage ? 'success' : 'warning'} /> : null}

          <View style={styles.formCard}>
            <ProfileInputField
              error={displayedErrors.displayName}
              label="الاسم"
              onChangeText={(displayName) => updateFormState({ displayName })}
              placeholder="اكتب اسمك"
              value={formState.displayName}
            />
            <ProfileInputField
              autoCapitalize="none"
              autoCorrect={false}
              error={displayedErrors.email}
              helperText="لن يتم تغيير بريد تسجيل الدخول الحقيقي في هذا النموذج."
              keyboardType="email-address"
              label="البريد الإلكتروني"
              onChangeText={(email) => updateFormState({ email })}
              placeholder="abdullah@example.com"
              textContentType="emailAddress"
              textStyle={styles.ltrInput}
              value={formState.email}
            />
            <ProfileInputField
              error={displayedErrors.phone}
              keyboardType="phone-pad"
              label="رقم الهاتف"
              onChangeText={(phone) => updateFormState({ phone })}
              placeholder="+966 5X XXX XXXX"
              textStyle={styles.ltrInput}
              value={formState.phone}
            />
            <ProfileInputField
              label="المسمى الوظيفي"
              maxLength={60}
              onChangeText={(jobTitle) => updateFormState({ jobTitle })}
              placeholder="مؤسس، مدير مالي، صاحب النشاط"
              value={formState.jobTitle}
            />
          </View>

          <ProfilePreview formState={formState} />

          <View style={styles.actions}>
            <AppButton disabled={saveDisabled} onPress={handleSavePress}>
              حفظ التغييرات
            </AppButton>
            <AppButton onPress={requestClose} variant="secondary">
              إلغاء
            </AppButton>
          </View>
        </ScrollView>

        <AvatarPickerModal
          currentColor={formState.avatarColor}
          insetsBottom={insets.bottom}
          onClose={() => setShowAvatarPicker(false)}
          onImageUploadPress={handleImageUploadPress}
          onUseInitial={handleUseInitial}
          onColorPress={handleAvatarColorPress}
          visible={showAvatarPicker}
        />

        <ConfirmationDialog
          cancelLabel="تجاهل التغييرات"
          confirmLabel="متابعة التعديل"
          description="هل تريد تجاهل التعديلات والعودة؟"
          onCancel={handleDiscardChanges}
          onConfirm={handleContinueEditing}
          title="لديك تغييرات غير محفوظة"
          tone="warning"
          visible={showUnsavedDialog}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EditProfileHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى المزيد"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          تعديل الملف الشخصي
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          حدّث بياناتك الشخصية الظاهرة داخل Capital.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function AvatarSection({
  formState,
  onChangePhotoPress,
}: {
  formState: EditProfileFormState;
  onChangePhotoPress: () => void;
}) {
  const avatarColor = getProfileAvatarColor(formState.avatarColor);

  return (
    <View style={styles.avatarSection}>
      <View style={[styles.avatar, { backgroundColor: avatarColor.value, borderColor: avatarColor.border }]}>
        {formState.avatarType === 'icon' ? (
          <Ionicons color={colors.brand.lightNeutral} name="person-outline" size={36} />
        ) : (
          <AppText align="center" style={styles.avatarInitials} variant="display">
            {formState.avatarInitial}
          </AppText>
        )}
      </View>
      <Pressable
        accessibilityLabel="تغيير الصورة"
        accessibilityRole="button"
        onPress={onChangePhotoPress}
        style={({ pressed }) => [styles.changeAvatarButton, pressed && styles.pressed]}
      >
        <AppText align="center" tone="link" variant="buttonLabel">
          تغيير الصورة
        </AppText>
      </Pressable>
    </View>
  );
}

function InfoNotice() {
  return (
    <SolidCard style={styles.infoNotice}>
      <Ionicons color={colors.brand.calmGreen} name="information-circle-outline" size={18} />
      <AppText style={styles.infoNoticeText} tone="secondary" variant="supporting">
        هذه البيانات محلية وتجريبية، ولا يتم تحديث حساب حقيقي أو إرسال معلومات إلى خادم.
      </AppText>
    </SolidCard>
  );
}

function InlineNotice({ message, tone }: { message: string; tone: 'success' | 'warning' }) {
  const isSuccess = tone === 'success';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.inlineNotice,
        {
          backgroundColor: isSuccess ? colors.semantic.successTint : colors.semantic.warningTint,
          borderColor: isSuccess ? 'rgba(79,138,91,0.28)' : 'rgba(232,163,61,0.28)',
        },
      ]}
    >
      <Ionicons
        color={isSuccess ? colors.semantic.success : colors.semantic.warning}
        name={isSuccess ? 'checkmark-circle-outline' : 'image-outline'}
        size={18}
      />
      <AppText style={styles.inlineNoticeText} tone={isSuccess ? 'success' : 'warning'} variant="supporting">
        {message}
      </AppText>
    </View>
  );
}

function ProfileInputField({
  label,
  error,
  helperText,
  textStyle,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <AppText style={styles.fieldLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, error ? styles.inputError : null, textStyle]}
      />
      {helperText ? (
        <AppText style={styles.helperText} tone="secondary" variant="caption">
          {helperText}
        </AppText>
      ) : null}
      {error ? (
        <AppText accessibilityLiveRegion="polite" tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function ProfilePreview({ formState }: { formState: EditProfileFormState }) {
  return (
    <View style={styles.previewCard}>
      <AppText style={styles.sectionHeading} variant="sectionTitle">
        معاينة الملف الشخصي
      </AppText>
      <View style={styles.previewBody}>
        <MiniAvatar formState={formState} />
        <View style={styles.previewCopy}>
          <AppText style={styles.previewName} variant="cardTitle">
            {formState.displayName.trim() || 'الاسم'}
          </AppText>
          <AppText style={styles.previewRole} tone="secondary" variant="supporting">
            {formState.jobTitle.trim() || 'المسمى الوظيفي'}
          </AppText>
          <AppText style={styles.previewEmail} tone="secondary" variant="caption">
            {formState.email.trim() || 'abdullah@example.com'}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function MiniAvatar({ formState }: { formState: EditProfileFormState }) {
  const avatarColor = getProfileAvatarColor(formState.avatarColor);

  return (
    <View style={[styles.previewAvatar, { backgroundColor: avatarColor.value, borderColor: avatarColor.border }]}>
      {formState.avatarType === 'icon' ? (
        <Ionicons color={colors.brand.lightNeutral} name="person-outline" size={23} />
      ) : (
        <AppText align="center" style={styles.previewAvatarText} variant="sectionTitle">
          {formState.avatarInitial}
        </AppText>
      )}
    </View>
  );
}

function AvatarPickerModal({
  currentColor,
  insetsBottom,
  onClose,
  onColorPress,
  onImageUploadPress,
  onUseInitial,
  visible,
}: {
  currentColor: ProfileAvatarColorId;
  insetsBottom: number;
  onClose: () => void;
  onColorPress: (colorId: ProfileAvatarColorId) => void;
  onImageUploadPress: () => void;
  onUseInitial: () => void;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إغلاق خيارات الصورة" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheet, { paddingBottom: insetsBottom + spacing.xl }]}>
          <View style={styles.sheetGrabber} />
          <AppText align="center" variant="sectionTitle">
            تغيير الصورة
          </AppText>
          <Pressable
            accessibilityLabel="استخدام الحرف الأول"
            accessibilityRole="button"
            onPress={onUseInitial}
            style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}
          >
            <Ionicons color={colors.brand.calmGreen} name="text-outline" size={20} />
            <AppText style={styles.sheetRowLabel} variant="body">
              استخدام الحرف الأول
            </AppText>
          </Pressable>
          <View style={styles.colorGrid}>
            {profileAvatarColors.map((avatarColor) => (
              <Pressable
                accessibilityLabel={`اختيار لون ${avatarColor.label}`}
                accessibilityRole="button"
                key={avatarColor.id}
                onPress={() => onColorPress(avatarColor.id)}
                style={({ pressed }) => [
                  styles.colorOption,
                  avatarColor.id === currentColor && styles.colorOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: avatarColor.value, borderColor: avatarColor.border },
                  ]}
                />
                <AppText align="center" variant="caption">
                  {avatarColor.label}
                </AppText>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityLabel="رفع صورة"
            accessibilityRole="button"
            onPress={onImageUploadPress}
            style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}
          >
            <Ionicons color={colors.text.tertiary} name="cloud-upload-outline" size={20} />
            <View style={styles.sheetRowCopy}>
              <AppText style={styles.sheetRowLabel} variant="body">
                رفع صورة
              </AppText>
              <AppText tone="secondary" variant="caption">
                قريبًا
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createProfileFormState(profile: UserProfileState): EditProfileFormState {
  return {
    avatarColor: profile.avatarColor,
    avatarInitial: profile.avatarInitial,
    avatarType: profile.avatarType,
    displayName: profile.displayName,
    email: profile.email,
    jobTitle: profile.jobTitle,
    phone: profile.phone,
  };
}

function sanitizeProfileForm(formState: EditProfileFormState): EditProfileFormState {
  const displayName = formState.displayName.trim().replace(/\s+/g, ' ');

  return {
    ...formState,
    avatarInitial: formState.avatarType === 'initial' ? getProfileInitial(displayName) : '',
    displayName,
    email: formState.email.trim(),
    jobTitle: formState.jobTitle.trim(),
    phone: formState.phone.trim(),
  };
}

function validateProfileForm(formState: EditProfileFormState) {
  const errors: EditProfileErrors = {};
  const displayName = formState.displayName.trim();
  const email = formState.email.trim();
  const phone = formState.phone.trim();

  if (!displayName) {
    errors.displayName = 'الاسم مطلوب.';
  } else if (displayName.length < 2) {
    errors.displayName = 'أدخل اسمًا من حرفين على الأقل.';
  } else if (displayName.length > 50) {
    errors.displayName = 'أدخل اسمًا لا يتجاوز 50 حرفًا.';
  } else if (/^\d+$/.test(displayName.replace(/\s+/g, ''))) {
    errors.displayName = 'الاسم لا يمكن أن يكون أرقامًا فقط.';
  } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(displayName)) {
    errors.displayName = 'استخدم العربية أو الإنجليزية والمسافات فقط.';
  }

  if (!isValidEmail(email)) {
    errors.email = 'أدخل بريدًا إلكترونيًا صحيحًا.';
  }

  if (phone && !isValidPhone(phone)) {
    errors.phone = 'أدخل رقم هاتف صحيحًا أو اترك الحقل فارغًا.';
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return /^[+\d\s]+$/.test(value) && digits.length >= 8 && digits.length <= 15;
}

function areProfileStatesEqual(left: EditProfileFormState, right: EditProfileFormState) {
  return (
    left.displayName === right.displayName &&
    left.email === right.email &&
    left.phone === right.phone &&
    left.jobTitle === right.jobTitle &&
    left.avatarType === right.avatarType &&
    left.avatarInitial === right.avatarInitial &&
    left.avatarColor === right.avatarColor
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 52,
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
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 98,
    justifyContent: 'center',
    width: 98,
  },
  avatarInitials: {
    color: colors.brand.lightNeutral,
  },
  changeAvatarButton: {
    backgroundColor: 'rgba(167,200,161,0.10)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.button,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  infoNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,94,153,0.12)',
    borderColor: 'rgba(44,139,214,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  infoNoticeText: {
    flex: 1,
    lineHeight: 22,
    textAlign: 'right',
  },
  inlineNotice: {
    alignItems: 'center',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inlineNoticeText: {
    flex: 1,
    textAlign: 'right',
  },
  formCard: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
  ltrInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  helperText: {
    lineHeight: 18,
    textAlign: 'right',
  },
  previewCard: {
    backgroundColor: colors.glass.fillDeep,
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: 26,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionHeading: {
    textAlign: 'right',
  },
  previewBody: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  previewAvatar: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  previewAvatarText: {
    color: colors.brand.lightNeutral,
  },
  previewCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  previewName: {
    textAlign: 'right',
  },
  previewRole: {
    textAlign: 'right',
  },
  previewEmail: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  actions: {
    gap: spacing.md,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sheetGrabber: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.pill,
    height: 4,
    width: 36,
  },
  sheetRow: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  sheetRowLabel: {
    flex: 1,
    textAlign: 'right',
  },
  sheetRowCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xxs,
  },
  colorGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 82,
    padding: spacing.sm,
  },
  colorOptionActive: {
    borderColor: colors.brand.calmGreen,
  },
  colorSwatch: {
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 30,
    width: 30,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
