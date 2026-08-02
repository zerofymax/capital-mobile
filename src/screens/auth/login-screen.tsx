import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthCard, AuthHeader, AuthInput, AuthPrototypeNotice, BiometricButton } from '@/components/auth';
import { AppButton, AppText, Divider } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { authMessages } from './auth-data';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [notice, setNotice] = useState<string>(authMessages.loginPrototype);
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    if (!identifier.trim() || !secret.trim()) {
      setError(authMessages.loginMissingFields);
      setNotice(authMessages.loginMissingFields);
      return;
    }

    router.replace(routes.home);
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
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxxl),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader subtitle="ادخل إلى لوحة Capital المالية" title="تسجيل الدخول" />
        <AuthCard>
          <AuthInput
            autoCapitalize="none"
            error={error && !identifier.trim() ? error : undefined}
            keyboardType="email-address"
            label="البريد الإلكتروني أو رقم الجوال"
            ltr
            onChangeText={setIdentifier}
            textContentType="username"
            value={identifier}
          />
          <AuthInput
            error={error && !secret.trim() ? error : undefined}
            label="كلمة المرور أو رمز الدخول"
            onChangeText={setSecret}
            secureTextEntry
            textContentType="password"
            value={secret}
          />
          <AppButton onPress={handleLogin}>
            تسجيل دخول
          </AppButton>
          <BiometricButton onPress={() => setNotice(authMessages.biometricUnavailable)} />
          <Divider />
          <Pressable
            accessibilityRole="button"
            onPress={() => setNotice(authMessages.recoveryUnavailable)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <AppText align="center" tone="link" variant="supporting">
              نسيت بيانات الدخول؟
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(routes.register)}
            style={({ pressed }) => [styles.secondaryLink, pressed && styles.pressed]}
          >
            <AppText align="center" variant="buttonLabel">
              إنشاء حساب جديد
            </AppText>
          </Pressable>
        </AuthCard>
        <AuthPrototypeNotice message={notice} tone={notice === authMessages.loginMissingFields ? 'danger' : 'warning'} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  link: {
    minHeight: 38,
    justifyContent: 'center',
  },
  secondaryLink: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
