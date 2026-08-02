import { router } from 'expo-router';
import { useState } from 'react';

import { StateScreen } from '@/components/system';
import { AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';

export function MaintenanceScreen() {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <StateScreen
      description="نعمل حاليًا على تحسين أداء Capital. نتوقع العودة خلال 20 دقيقة تقريبًا."
      iconName="construct-outline"
      onPrimaryAction={() => setRetryCount((value) => value + 1)}
      onSecondaryAction={() => router.push(routes.helpCenter)}
      primaryActionLabel="إعادة المحاولة"
      secondaryActionLabel="حالة الخدمة والدعم"
      title="نجري بعض التحسينات"
      tone="success"
    >
      {retryCount > 0 ? (
        <SolidCard style={{ gap: spacing.xs }}>
          <AppText tone="success" variant="supporting">
            تم تنفيذ محاولة تحقق محلية رقم {retryCount}.
          </AppText>
        </SolidCard>
      ) : null}
    </StateScreen>
  );
}
