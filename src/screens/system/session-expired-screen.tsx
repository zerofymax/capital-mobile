import { router } from 'expo-router';
import { useState } from 'react';

import { StateInfoCard, StateScreen } from '@/components/system';
import { AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';

export function SessionExpiredScreen() {
  const [biometricMessageVisible, setBiometricMessageVisible] = useState(false);

  return (
    <StateScreen
      description="لحماية حسابك، سجّل الدخول مرة أخرى للمتابعة."
      iconName="lock-closed-outline"
      onPrimaryAction={() => router.replace(routes.login)}
      onSecondaryAction={() => setBiometricMessageVisible(true)}
      primaryActionLabel="تسجيل الدخول"
      secondaryActionLabel="استخدام البصمة"
      title="انتهت جلستك"
      tone="warning"
    >
      <StateInfoCard
        description="تم حفظ تغييراتك غير المكتملة، وستجدها عند عودتك."
        title="ملاحظة أمان"
        tone="success"
      />
      {biometricMessageVisible ? (
        <SolidCard style={{ gap: spacing.xs }}>
          <AppText tone="warning" variant="supporting">
            البصمة متاحة كنموذج أولي فقط. لا يوجد تحقق حيوي حقيقي في هذه المرحلة.
          </AppText>
        </SolidCard>
      ) : null}
    </StateScreen>
  );
}
