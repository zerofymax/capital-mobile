import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BeneficiaryCard,
  TransferAmountCard,
  TransferTypeSelector,
} from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  transferBeneficiaries,
  transferLimits,
  transferMessages,
  transferPurposes,
  type Beneficiary,
  type TransferPurpose,
  type TransferType,
} from './operations-data';

export function TransfersScreen() {
  const insets = useSafeAreaInsets();
  const [transferType, setTransferType] = useState<TransferType>('local');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [purposeId, setPurposeId] = useState<TransferPurpose | ''>('');
  const [notice, setNotice] = useState<string | null>(null);

  const selectedBeneficiary = useMemo(
    () => transferBeneficiaries.find((beneficiary) => beneficiary.id === beneficiaryId),
    [beneficiaryId],
  );
  const amountError =
    notice === transferMessages.amountRequired ||
    notice === transferMessages.amountOverDailyLimit ||
    notice === transferMessages.insufficientBalance
      ? notice
      : undefined;

  function handleTypeChange(value: TransferType) {
    if (value === 'international') {
      setNotice(transferMessages.internationalUnavailable);
      return;
    }

    setTransferType(value);
    setNotice(null);
  }

  function handleBeneficiaryPress(beneficiary: Beneficiary) {
    setBeneficiaryId(beneficiary.id);
    setNotice(null);
  }

  function handleContinue() {
    const numericAmount = Number(amount.replace(/,/g, '.').trim());

    if (!selectedBeneficiary) {
      setNotice(transferMessages.beneficiaryRequired);
      return;
    }

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setNotice(transferMessages.amountRequired);
      return;
    }

    if (numericAmount > transferLimits.dailyLimit) {
      setNotice(transferMessages.amountOverDailyLimit);
      return;
    }

    if (numericAmount > transferLimits.availableBalance) {
      setNotice(transferMessages.insufficientBalance);
      return;
    }

    if (!purposeId) {
      setNotice(transferMessages.purposeRequired);
      return;
    }

    router.push({
      pathname: routes.transferReview,
      params: {
        amount,
        beneficiaryId: selectedBeneficiary.id,
        purposeId,
        transferType,
      },
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="تحويل الأموال" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            أرسل مبلغًا من حساب نشاطك بشكل آمن
          </AppText>
        </View>

        <View style={styles.section}>
          <TransferTypeSelector onChange={handleTypeChange} value={transferType} />
          <SolidCard style={styles.accountCard}>
            <View style={styles.accountIcon}>
              <Ionicons color={colors.brand.green} name="business-outline" size={19} />
            </View>
            <View style={styles.accountCopy}>
              <AppText variant="cardTitle">{transferLimits.fromAccount}</AppText>
              <AppText align="left" style={styles.ltrText} tone="secondary" variant="caption">
                الرصيد المتاح: {transferLimits.availableBalanceLabel}
              </AppText>
            </View>
          </SolidCard>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">المستفيد</AppText>
          {transferBeneficiaries.map((beneficiary) => (
            <BeneficiaryCard
              beneficiary={beneficiary}
              key={beneficiary.id}
              onPress={handleBeneficiaryPress}
              selected={beneficiary.id === beneficiaryId}
            />
          ))}
        </View>

        <TransferAmountCard
          error={amountError}
          helperText={`الحد اليومي المتاح: ${transferLimits.dailyLimitLabel}`}
          onChangeText={(value) => {
            setAmount(value);
            setNotice(null);
          }}
          value={amount}
        />

        <View style={styles.section}>
          <AppText variant="sectionTitle">سبب التحويل</AppText>
          <View style={styles.purposeGrid}>
            {transferPurposes.map((purpose) => {
              const selected = purpose.id === purposeId;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={purpose.id}
                  onPress={() => {
                    setPurposeId(purpose.id);
                    setNotice(null);
                  }}
                  style={({ pressed }) => [
                    styles.purposeChip,
                    selected && styles.purposeSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
                    {purpose.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {notice === transferMessages.purposeRequired ? (
            <AppText tone="danger" variant="caption">
              {notice}
            </AppText>
          ) : null}
        </View>

        {notice && notice !== transferMessages.purposeRequired && !amountError ? (
          <SolidCard style={styles.notice}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="warning" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.actions}>
          <AppButton iconName="shield-checkmark-outline" onPress={handleContinue}>
            مراجعة التحويل
          </AppButton>
          <AppButton iconName="close-outline" onPress={() => router.back()} variant="secondary">
            إلغاء
          </AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  section: {
    gap: spacing.md,
  },
  accountCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  accountIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  accountCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  ltrText: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  purposeGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  purposeChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  purposeSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.34)',
  },
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
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
