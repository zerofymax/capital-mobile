import { router } from 'expo-router';
import { useState } from 'react';

import { AuthPrototypeNotice } from '@/components/auth';
import { ConnectionCard, OnboardingShell, OnboardingStepActions } from '@/components/onboarding';
import { routes } from '@/constants/routes';
import { connectionOptions, onboardingCopy } from '@/screens/onboarding/onboarding-data';

export function ConnectAccountsScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <OnboardingShell
      actions={
        <OnboardingStepActions
          onPrimaryPress={() => router.push(routes.onboardingReady)}
          onSecondaryPress={() => setNotice(onboardingCopy.linkingUnavailable)}
          onTertiaryPress={() => router.push(routes.financialGoals)}
          primaryIconName="play-skip-forward-outline"
          primaryLabel="تخطي الآن"
          secondaryIconName="link-outline"
          secondaryLabel="تجربة الربط"
          tertiaryLabel="رجوع"
        />
      }
      currentStep={4}
      notice={notice ? <AuthPrototypeNotice message={notice} tone="warning" /> : null}
      subtitle="اربط مصادر بياناتك لاحقًا ليحلل Capital الإيرادات والمصروفات تلقائيًا"
      title="ربط الحسابات"
      totalSteps={5}
    >
      {connectionOptions.map((connection) => (
        <ConnectionCard
          description={connection.description}
          iconName={connection.icon}
          key={connection.title}
          status={connection.status}
          title={connection.title}
        />
      ))}
    </OnboardingShell>
  );
}
