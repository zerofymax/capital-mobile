import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme/colors';
import { useOptionalCapitalFonts } from '@/theme/fonts';
import { configureRtl } from '@/utils/rtl';
import { hydrateAppearancePreference, useResolvedAppearance } from '@/state/appearance-state';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const fontsReady = useOptionalCapitalFonts();
  const appearance = useResolvedAppearance();

  useEffect(() => {
    configureRtl();
    hydrateAppearancePreference();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(appearance.colors.background.base).catch(() => null);
  }, [appearance.colors.background.base]);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => null);
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: appearance.colors.background.base }]}>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: [styles.content, { backgroundColor: appearance.colors.background.base }],
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="intelligence" options={{ headerShown: false }} />
            <Stack.Screen name="session-expired" />
            <Stack.Screen name="system/maintenance" />
            <Stack.Screen name="system/offline" />
            <Stack.Screen name="system/library/confirmations" />
            <Stack.Screen name="system/library/success" />
            <Stack.Screen name="system/library/empty-states" />
            <Stack.Screen name="system/library/error-states" />
            <Stack.Screen name="system/library/loading-states" />
            <Stack.Screen name="modals/edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/business-information" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/financial-accounts" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/financial-account-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/account-form" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/opening-balances" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/categories" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/budgets" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-budget" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/budget-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-budget" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/recurring-expenses" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-recurring-expense" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/recurring-expense-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-recurring-expense" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/goals" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-goal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/goal-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-contribution" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-goal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/invoices" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-invoice" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/invoice-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/record-payment" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-invoice" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/home-customization" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/notification-settings" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/language-appearance" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/security" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/quick-access-code" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/change-password" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/change-pin" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/biometric-login" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/trusted-devices" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/active-sessions" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/sign-out-all-devices" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/security-log" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/current-subscription" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/billing-history" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/cancel-subscription" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/compare-plans" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/confirm-upgrade" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/payment-method" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/ask-capital" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/transaction-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-transaction" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-income" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-expense" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-commitment" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-subscription" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/transfers" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/transfer-review" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/transfer-success" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/bills" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/bill-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/bill-payment-review" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/bill-payment-success" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/cards" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/card-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/card-limits" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/request-card" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/card-request-success" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/monthly-report" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/financial-reports" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/financial-report-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/financial-report-preview" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/growth-metrics" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/metric-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/startup-goals" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/add-startup-goal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/startup-goal-details" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-startup-goal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/company-update" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/notifications" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/notification-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/help-center" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/faq" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/faq-detail" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/live-support" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/support-requests" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/help-topic" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/contact-support" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/privacy-legal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/data-consents" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/request-data-copy" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/delete-account" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/send-feedback" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/about-capital" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/open-source-licenses" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/legal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    backgroundColor: colors.background.base,
  },
});
