import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthCard, AuthHeader, AuthPrototypeNotice, PinKeypad } from '@/components/auth';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { authMessages } from './auth-data';

export function PinScreen() {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  function handleDigitPress(digit: string) {
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);
    setPin((current) => (current.length >= 4 ? current : `${current}${digit}`));
  }

  function handleBackspacePress() {
    Haptics.selectionAsync().catch(() => null);
    setPin((current) => current.slice(0, -1));
  }

  function handleConfirmPress() {
    if (pin.length < 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
      setNotice(authMessages.pinIncomplete);
      return;
    }

    router.replace(routes.businessType);
  }

  return (
    <View style={styles.root}>
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
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          align="center"
          subtitle="اختر رمزًا سريعًا وآمنًا للوصول إلى حسابك"
          title="رمز الدخول"
        />
        <AuthCard>
          <PinKeypad
            onBackspacePress={handleBackspacePress}
            onConfirmPress={handleConfirmPress}
            onDigitPress={handleDigitPress}
            valueLength={pin.length}
          />
        </AuthCard>
        {notice ? <AuthPrototypeNotice message={notice} tone="danger" /> : null}
      </ScrollView>
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
    justifyContent: 'center',
    minHeight: '100%',
    paddingHorizontal: 16,
  },
});
