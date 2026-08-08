import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthCard, AuthInput, BiometricButton } from '@/components/auth';
import { AppButton, AppText, Divider } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
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
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxxl),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <AppText style={styles.title} variant="screenTitle">
            تسجيل الدخول
          </AppText>
          <AppText style={styles.subtitle} tone="secondary" variant="supporting">
            ادخل إلى لوحة <Text style={styles.ltrInline}>Capital</Text> المالية
          </AppText>
        </View>
        <AuthCard>
          <View style={styles.fieldWrapper}>
            <AuthInput
              autoCapitalize="none"
              error={error && !identifier.trim() ? error : undefined}
              keyboardType="email-address"
              label="البريد الإلكتروني أو رقم الجوال"
              ltr
              onChangeText={setIdentifier}
              rtlLayout
              textContentType="username"
              value={identifier}
            />
          </View>
          <View style={styles.fieldWrapper}>
            <AuthInput
              error={error && !secret.trim() ? error : undefined}
              label="كلمة المرور أو رمز الدخول"
              onChangeText={setSecret}
              rtlLayout
              secureTextEntry
              textContentType="password"
              value={secret}
            />
          </View>
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
        <LoginNotice message={notice} tone={notice === authMessages.loginMissingFields ? 'danger' : 'warning'} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LoginNotice({ message, tone }: { message: string; tone: 'warning' | 'danger' }) {
  const color = tone === 'danger' ? colors.semantic.danger : colors.semantic.warning;
  const backgroundColor = tone === 'danger' ? colors.semantic.dangerTint : colors.semantic.warningTint;
  const borderColor = tone === 'danger' ? 'rgba(229,103,90,0.24)' : 'rgba(232,163,61,0.24)';

  return (
    <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor, borderColor }]}>
      <Ionicons color={color} name="information-circle-outline" size={17} />
      <AppText style={[styles.noticeText, { color }]} variant="supporting">
        {message}
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
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  titleBlock: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.xs,
    width: '100%',
  },
  title: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  subtitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  ltrInline: {
    writingDirection: 'ltr',
  },
  fieldWrapper: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
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
  notice: {
    alignItems: 'center',
    borderRadius: radii.button,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
