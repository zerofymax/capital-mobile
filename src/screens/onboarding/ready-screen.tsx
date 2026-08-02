import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Divider, GlassSurface } from '@/components/ui';
import { OnboardingShell, OnboardingStepActions, SummaryItem } from '@/components/onboarding';
import { routes } from '@/constants/routes';
import { readySummaryItems } from '@/screens/onboarding/onboarding-data';
import { spacing } from '@/theme/spacing';

export function ReadyScreen() {
  return (
    <OnboardingShell
      actions={
        <OnboardingStepActions
          onPrimaryPress={() => router.replace(routes.home)}
          onSecondaryPress={() => router.push(routes.businessType)}
          primaryIconName="speedometer-outline"
          primaryLabel="الدخول إلى لوحة التحكم"
          secondaryLabel="الرجوع للتعديل"
        />
      }
      currentStep={5}
      subtitle="تم تجهيز تجربة أولية تساعدك تتابع أرقام نشاطك بوضوح"
      title="Capital جاهز"
      totalSteps={5}
    >
      <GlassSurface>
        <View style={styles.summary}>
          {readySummaryItems.map((item, index) => (
            <View key={item} style={styles.itemBlock}>
              <SummaryItem label={item} />
              {index < readySummaryItems.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </View>
      </GlassSurface>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.md,
  },
  itemBlock: {
    gap: spacing.md,
  },
});
