import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Fragment, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoutAction, ProfileCard, SettingsSection, SubscriptionCard } from '@/components/account';
import {
  getTabScreenContentBottomPadding,
  tabScreenContentInsetAdjustmentBehavior,
} from '@/components/navigation';
import { AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  accountProfile,
  accountSections,
  type AccountSettingsRow,
} from './account-data';
import { formatBusinessLine, useBusinessInformation } from './business-information-data';
import { getProfileAvatarColor, useUserProfile } from './profile-data';
import { getAccountSubscriptionViewModel, useSubscriptionState } from './subscription-data';

const genericFeatureMessage = 'هذه الميزة قادمة في تحديث لاحق.';
const logoutMessage = 'تم إنهاء الجلسة الحالية التجريبية فقط.';
const accountTabBarExtraClearance = spacing.xxl;

const rowRoutes: Partial<Record<AccountSettingsRow['id'], Href>> = {
  about: routes.aboutCapital,
  'budget-limits': routes.budgets,
  'business-info': routes.businessInformation,
  categories: routes.categories,
  feedback: routes.sendFeedback,
  'financial-accounts': routes.financialAccounts,
  'financial-reports': routes.financialReports,
  'financial-terms': routes.financialTerms,
  'help-center': routes.helpCenter,
  'import-data': routes.dataImport,
  'language-appearance': routes.languageAppearance,
  notifications: routes.notificationSettings,
  'opening-balances': routes.openingBalances,
  'recurring-expenses': routes.recurringExpenses,
  security: routes.security,
  'export-data': routes.dataExport,
};

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const businessInformation = useBusinessInformation();
  const userProfile = useUserProfile();
  const subscriptionState = useSubscriptionState();
  const accountSubscription = getAccountSubscriptionViewModel(subscriptionState);
  const avatarColor = getProfileAvatarColor(userProfile.avatarColor);
  const scrollRef = useRef<ScrollView>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  function showNotice(message: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setNotice(message);
  }

  function handleProfileEdit() {
    setConfirmingLogout(false);
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);
    router.push(routes.editProfile);
  }

  function handleSettingsRowPress(row: AccountSettingsRow) {
    setConfirmingLogout(false);

    if (row.soon) {
      showNotice(genericFeatureMessage);
      return;
    }

    const href = rowRoutes[row.id];

    if (href) {
      Haptics.selectionAsync().catch(() => null);
      setNotice(null);
      router.push(href);
      return;
    }

    showNotice(genericFeatureMessage);
  }

  function handleSubscriptionPress() {
    setConfirmingLogout(false);
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);
    router.push(routes.currentSubscription);
  }

  function handleLogoutRequest() {
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);
    setConfirmingLogout(true);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  function handleLogoutCancel() {
    Haptics.selectionAsync().catch(() => null);
    setConfirmingLogout(false);
  }

  function handleLogoutConfirm() {
    setConfirmingLogout(false);
    showNotice(logoutMessage);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: themeColors.background.base }]}>
      <LinearGradient
        colors={[themeColors.background.heroStart, themeColors.background.base, themeColors.background.base]}
        end={{ x: 0.7, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: getTabScreenContentBottomPadding(insets.bottom) + accountTabBarExtraClearance,
          },
        ]}
        contentInsetAdjustmentBehavior={tabScreenContentInsetAdjustmentBehavior}
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <AccountHeader />
        <ProfileCard
          onEditPress={handleProfileEdit}
          profile={{
            ...accountProfile,
            avatarBorderColor: avatarColor.border,
            avatarColor: avatarColor.value,
            avatarType: userProfile.avatarType,
            businessName: `${businessInformation.businessName} — ${formatBusinessLine(businessInformation)}`,
            email: userProfile.email,
            initials: userProfile.avatarType === 'initial' ? userProfile.avatarInitial : '',
            name: userProfile.displayName,
            role: userProfile.jobTitle,
          }}
        />

        {accountSections.map((section) => (
          <Fragment key={section.id}>
            <SettingsSection onRowPress={handleSettingsRowPress} section={section} />
            {section.id === 'financial-planning' ? (
              <SubscriptionCard onPress={handleSubscriptionPress} subscription={accountSubscription} />
            ) : null}
          </Fragment>
        ))}

        {notice ? <PrototypeNotice message={notice} /> : null}

        <LogoutAction
          confirming={confirmingLogout}
          onCancel={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          onRequest={handleLogoutRequest}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountHeader() {
  return (
    <View accessibilityRole="header" style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText accessibilityRole="text" variant="screenTitle">
          المزيد
        </AppText>
        <AppText tone="secondary" variant="supporting">
          إدارة شركتك، بياناتك، إعداداتك، وأدوات Capital.
        </AppText>
      </View>
    </View>
  );
}

function PrototypeNotice({ message }: { message: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.notice}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={17} />
      <AppText style={styles.noticeText} variant="supporting">
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
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
  },
  headerCopy: {
    gap: spacing.xs,
    minWidth: 0,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    color: colors.semantic.warning,
    flex: 1,
  },
});
