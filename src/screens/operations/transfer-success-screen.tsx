import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransferSuccessCard } from '@/components/operations';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  defaultTransferSuccess,
  type TransferSuccessData,
} from './operations-data';

export function TransferSuccessScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount?: string;
    beneficiaryName?: string;
  }>();
  const success = createSuccessData(params);

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
        <ModalHeader onClose={() => router.replace(routes.home)} title="تم إنشاء تحويل تجريبي" />

        <TransferSuccessCard data={success} />

        <View style={styles.section}>
          <AppText variant="sectionTitle">تفاصيل التحويل</AppText>
          <SolidCard style={styles.detailsCard}>
            <DetailRow label="الحالة" value={success.status} />
            <DetailRow label="الحساب" value={success.account} />
            <DetailRow label="التاريخ" value={success.date} />
          </SolidCard>
        </View>

        <View style={styles.actions}>
          <AppButton iconName="home-outline" onPress={() => router.replace(routes.home)}>
            العودة إلى الرئيسية
          </AppButton>
          <AppButton iconName="list-outline" onPress={() => router.replace(routes.ledger)} variant="secondary">
            عرض السجل
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailBlock}>
      <View style={styles.detailRow}>
        <AppText tone="secondary" variant="supporting">
          {label}
        </AppText>
        <AppText style={styles.detailValue} variant="body">
          {value}
        </AppText>
      </View>
      {label !== 'التاريخ' ? <Divider /> : null}
    </View>
  );
}

function createSuccessData(params: {
  amount?: string | string[];
  beneficiaryName?: string | string[];
}): TransferSuccessData {
  const amount = Array.isArray(params.amount) ? params.amount[0] : params.amount;
  const beneficiaryName = Array.isArray(params.beneficiaryName)
    ? params.beneficiaryName[0]
    : params.beneficiaryName;

  return {
    ...defaultTransferSuccess,
    amount: amount || defaultTransferSuccess.amount,
    beneficiaryName: beneficiaryName || defaultTransferSuccess.beneficiaryName,
  };
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
  detailsCard: {
    gap: spacing.md,
  },
  detailBlock: {
    gap: spacing.md,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  detailValue: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
