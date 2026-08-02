import { router } from 'expo-router';
import { useState } from 'react';

import { AuthPrototypeNotice } from '@/components/auth';
import { OnboardingOptionCard, OnboardingShell, OnboardingStepActions } from '@/components/onboarding';
import { routes } from '@/constants/routes';
import {
  financialGoalOptions,
  onboardingCopy,
  type FinancialGoalId,
} from '@/screens/onboarding/onboarding-data';

export function FinancialGoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<FinancialGoalId[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  function toggleGoal(goalId: FinancialGoalId) {
    setSelectedGoals((current) =>
      current.includes(goalId) ? current.filter((id) => id !== goalId) : [...current, goalId],
    );
    setNotice(null);
  }

  function handleContinue() {
    if (selectedGoals.length === 0) {
      setNotice(onboardingCopy.goalsRequired);
      return;
    }

    router.push(routes.connectAccounts);
  }

  return (
    <OnboardingShell
      actions={
        <OnboardingStepActions
          onPrimaryPress={handleContinue}
          onSecondaryPress={() => router.push(routes.businessInfo)}
          primaryLabel="متابعة"
          secondaryLabel="رجوع"
        />
      }
      currentStep={3}
      notice={notice ? <AuthPrototypeNotice message={notice} tone="danger" /> : null}
      subtitle="اختر الأهداف التي تريد أن يساعدك Capital في متابعتها"
      title="ما هدفك المالي الآن؟"
      totalSteps={5}
    >
      {financialGoalOptions.map((goal) => (
        <OnboardingOptionCard
          compact
          iconName="flag-outline"
          key={goal.id}
          onPress={() => toggleGoal(goal.id)}
          selected={selectedGoals.includes(goal.id)}
          title={goal.label}
        />
      ))}
    </OnboardingShell>
  );
}
