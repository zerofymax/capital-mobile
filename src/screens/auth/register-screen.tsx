import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  AuthInput,
  AuthPrototypeNotice,
  RegisterAgreementText,
} from '@/components/auth';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type RegisterLoginState = {
  fullName: string;
  phone: string;
  password: string;
};

const initialRegisterLoginState: RegisterLoginState = {
  fullName: '',
  phone: '',
  password: '',
};

const missingLoginDataMessage = 'أكمل بيانات الدخول للمتابعة';

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<RegisterLoginState>(initialRegisterLoginState);
  const [notice, setNotice] = useState<string | null>(null);
  const hasMissingFields = useMemo(
    () => Object.values(values).some((value) => value.trim().length === 0),
    [values],
  );

  function updateField(field: keyof RegisterLoginState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  }

  function handleContinue() {
    if (hasMissingFields) {
      setNotice(missingLoginDataMessage);
      return;
    }

    router.push(routes.financialSetupBusinessInfo);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.7, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, 52),
            paddingTop: Math.max(insets.top + spacing.xl, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RegisterHeader onBack={() => router.push(routes.authWelcome)} />
        <View style={styles.titleBlock}>
          <AppText style={styles.rtlText} variant="screenTitle">إنشاء حساب</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            بيانات الدخول
          </AppText>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldWrapper}>
            <AuthInput
              autoCapitalize="words"
              error={notice && !values.fullName.trim() ? missingLoginDataMessage : undefined}
              label="الاسم الكامل"
              onChangeText={(value) => updateField('fullName', value)}
              placeholder="مثال: عبدالله الشهري"
              rtlLayout
              textContentType="name"
              value={values.fullName}
            />
          </View>
          <View style={styles.fieldWrapper}>
            <AuthInput
              error={notice && !values.phone.trim() ? missingLoginDataMessage : undefined}
              keyboardType="phone-pad"
              label="رقم الجوال"
              ltr
              onChangeText={(value) => updateField('phone', value)}
              placeholder="05XX XXX XXX"
              rtlLayout
              textContentType="telephoneNumber"
              value={values.phone}
            />
          </View>
          <View style={styles.fieldWrapper}>
            <AuthInput
              autoCapitalize="none"
              autoComplete="new-password"
              error={notice && !values.password.trim() ? missingLoginDataMessage : undefined}
              label="كلمة المرور"
              onChangeText={(value) => updateField('password', value)}
              placeholder="8 أحرف على الأقل"
              rtlLayout
              secureTextEntry
              textContentType="newPassword"
              value={values.password}
            />
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottomActions}>
          <AppButton onPress={handleContinue}>متابعة</AppButton>
          <RegisterAgreementText align="right" />
        </View>

        {notice ? <AuthPrototypeNotice message={notice} tone="danger" /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RegisterHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityLabel="العودة"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.primary} name="chevron-back-outline" size={20} />
      </Pressable>
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
    gap: spacing.lg,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    direction: 'ltr',
    minHeight: 42,
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  titleBlock: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.xs,
    width: '100%',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  form: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  fieldWrapper: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxl,
  },
  bottomActions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
