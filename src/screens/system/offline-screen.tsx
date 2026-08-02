import { useState } from 'react';

import { StateInfoCard, StateScreen } from '@/components/system';
import { AppText, SolidCard } from '@/components/ui';
import { spacing } from '@/theme/spacing';

export function OfflineScreen() {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <StateScreen
      description="آخر تحديث للبيانات: اليوم 9:20 ص. نعرض حاليًا نسخة محفوظة محليًا من حسابك."
      iconName="cloud-offline-outline"
      onPrimaryAction={() => setRetryCount((value) => value + 1)}
      primaryActionLabel="إعادة المحاولة"
      title="لا يوجد اتصال بالإنترنت"
      tone="danger"
    >
      <StateInfoCard
        description="عرض المعلومات المحفوظة ومراجعة آخر تقرير وتصفح الإعدادات."
        title="متاح بدون اتصال"
        tone="muted"
      />
      <StateInfoCard
        description="إضافة معاملات جديدة، المزامنة مع الدعم، التقارير الجديدة."
        title="يتطلب اتصالًا"
        tone="warning"
      />
      {retryCount > 0 ? (
        <SolidCard style={{ gap: spacing.xs }}>
          <AppText tone="warning" variant="supporting">
            تم تشغيل محاولة اتصال محلية رقم {retryCount}.
          </AppText>
        </SolidCard>
      ) : null}
    </StateScreen>
  );
}
