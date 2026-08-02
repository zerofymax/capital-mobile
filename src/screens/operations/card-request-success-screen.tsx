import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillSummaryCard, CardRequestSummary } from '@/components/operations';
import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  defaultCardRequestSuccess,
  formatCardLimit,
  type CardRequestSuccessData,
} from './operations-data';

export function CardRequestSuccessScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    cardType?: string;
    monthlyLimit?: string;
    purpose?: string;
  }>();
  const data: CardRequestSuccessData = {
    ...defaultCardRequestSuccess,
    cardType: params.cardType ?? defaultCardRequestSuccess.cardType,
    monthlyLimit: formatCardLimit(params.monthlyLimit),
    purpose: params.purpose ?? defaultCardRequestSuccess.purpose,
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.replace(routes.cards)} title="تم إنشاء طلب البطاقة" />

        <CardRequestSummary data={data} />

        <View style={styles.section}>
          <AppText variant="sectionTitle">تفاصيل الطلب</AppText>
          <BillSummaryCard
            rows={[
              { label: 'الحالة', value: data.status },
              { label: 'الوقت المتوقع', value: data.expectedTime },
            ]}
          />
        </View>

        <View style={styles.actions}>
          <AppButton iconName="card-outline" onPress={() => router.replace(routes.cards)}>
            العودة إلى البطاقات
          </AppButton>
          <AppButton iconName="home-outline" onPress={() => router.replace(routes.home)} variant="secondary">
            العودة إلى الرئيسية
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="close-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
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
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  section: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
