import { router } from 'expo-router';
import { useState } from 'react';

import { AuthPrototypeNotice } from '@/components/auth';
import { GlassSurface } from '@/components/ui';
import { OnboardingInput, OnboardingShell, OnboardingStepActions } from '@/components/onboarding';
import { routes } from '@/constants/routes';
import {
  businessInfoFields,
  onboardingCopy,
  type BusinessInfoFieldId,
} from '@/screens/onboarding/onboarding-data';

type BusinessInfoState = Record<BusinessInfoFieldId, string>;

const initialValues = businessInfoFields.reduce((values, field) => {
  values[field.id] = field.defaultValue;
  return values;
}, {} as BusinessInfoState);

export function BusinessInfoScreen() {
  const [values, setValues] = useState<BusinessInfoState>(initialValues);
  const [notice, setNotice] = useState<string | null>(null);

  function updateField(fieldId: BusinessInfoFieldId, value: string) {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setNotice(null);
  }

  function handleContinue() {
    if (!values.businessName.trim()) {
      setNotice(onboardingCopy.businessNameRequired);
      return;
    }

    router.push(routes.financialGoals);
  }

  return (
    <OnboardingShell
      actions={
        <OnboardingStepActions
          onPrimaryPress={handleContinue}
          onSecondaryPress={() => router.push(routes.businessType)}
          primaryLabel="متابعة"
          secondaryLabel="رجوع"
        />
      }
      currentStep={2}
      keyboardAware
      notice={notice ? <AuthPrototypeNotice message={notice} tone="danger" /> : null}
      subtitle="أضف بيانات بسيطة تساعد Capital على قراءة أرقامك بشكل أوضح"
      title="معلومات النشاط"
      totalSteps={5}
    >
      <GlassSurface>
        {businessInfoFields.map((field) => (
          <OnboardingInput
            error={notice && field.id === 'businessName' && !values.businessName.trim() ? notice : undefined}
            key={field.id}
            keyboardType={field.keyboardType}
            label={field.label}
            ltr={field.ltr}
            onChangeText={(value) => updateField(field.id, value)}
            placeholder={field.placeholder}
            value={values[field.id]}
          />
        ))}
      </GlassSurface>
    </OnboardingShell>
  );
}
