import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransferSummaryCard } from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  defaultTransferReview,
  formatTransferAmount,
  getBeneficiary,
  getTransferPurpose,
  transferLimits,
  transferReviewNote,
  type TransferReviewData,
} from './operations-data';

export function TransferReviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount?: string;
    beneficiaryId?: string;
    purposeId?: string;
  }>();
  const review = createReviewData(params);

  function handleConfirm() {
    router.push({
      pathname: routes.transferSuccess,
      params: {
        amount: review.amount,
        beneficiaryName: review.beneficiaryName,
      },
    });
  }

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
        <ModalHeader onClose={() => router.back()} title="مراجعة التحويل" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            تأكد من تفاصيل التحويل قبل التأكيد
          </AppText>
        </View>

        <TransferSummaryCard data={review} />

        <SolidCard style={styles.note}>
          <View style={styles.noteIcon}>
            <Ionicons color={colors.brand.green} name="sparkles-outline" size={18} />
          </View>
          <AppText style={styles.noteText} tone="muted" variant="body">
            {transferReviewNote}
          </AppText>
        </SolidCard>

        <View style={styles.actions}>
          <AppButton iconName="checkmark-circle-outline" onPress={handleConfirm}>
            تأكيد التحويل
          </AppButton>
          <AppButton iconName="create-outline" onPress={() => router.replace(routes.transfers)} variant="secondary">
            تعديل
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

function createReviewData(params: {
  amount?: string | string[];
  beneficiaryId?: string | string[];
  purposeId?: string | string[];
}): TransferReviewData {
  const beneficiary = getBeneficiary(params.beneficiaryId);
  const purpose = getTransferPurpose(params.purposeId);
  const amount = formatTransferAmount(params.amount);

  return {
    ...defaultTransferReview,
    amount,
    beneficiaryName: beneficiary.name,
    ibanMask: `****${beneficiary.ibanEnding}`,
    purpose: purpose.label,
    total: amount,
    fromAccount: transferLimits.fromAccount,
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
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
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
    flexDirection: 'row',
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
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  intro: {
    marginTop: -spacing.sm,
  },
  note: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noteIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  noteText: {
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
