import { router } from 'expo-router';
import { useState } from 'react';

import { AuthPrototypeNotice } from '@/components/auth';
import { OnboardingOptionCard, OnboardingShell, OnboardingStepActions } from '@/components/onboarding';
import { routes } from '@/constants/routes';
import {
  businessTypeOptions,
  onboardingCopy,
  type BusinessTypeId,
} from '@/screens/onboarding/onboarding-data';

export function BusinessTypeScreen() {
  const [selected, setSelected] = useState<BusinessTypeId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleContinue() {
    if (!selected) {
      setNotice(onboardingCopy.businessTypeRequired);
      return;
    }

    router.push(routes.businessInfo);
  }

  return (
    <OnboardingShell
      actions={<OnboardingStepActions onPrimaryPress={handleContinue} primaryLabel="متابعة" />}
      currentStep={1}
      notice={notice ? <AuthPrototypeNotice message={notice} tone="danger" /> : null}
      subtitle="اختر الوصف الأقرب لطبيعة عملك حتى يخصص Capital التحليلات لك"
      title="ما نوع نشاطك؟"
      totalSteps={5}
    >
      {businessTypeOptions.map((option) => (
        <OnboardingOptionCard
          description={option.description}
          iconName={option.icon}
          key={option.id}
          onPress={() => {
            setSelected(option.id);
            setNotice(null);
          }}
          selected={selected === option.id}
          title={option.title}
        />
      ))}
    </OnboardingShell>
  );
}
