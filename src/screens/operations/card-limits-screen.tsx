import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToggleRow } from '@/components/forms';
import { BillSummaryCard, CardLimitRow } from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  cardMessages,
  defaultCardLimits,
  getPrototypeBusinessCard,
  type CardLimitSettings,
} from './operations-data';

export function CardLimitsScreen() {
  const insets = useSafeAreaInsets();
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();
  const card = getPrototypeBusinessCard(cardId);
  const [limits, setLimits] = useState<CardLimitSettings>(defaultCardLimits);
  const [notice, setNotice] = useState<string | null>(null);
  const saved = notice === cardMessages.limitsUpdated;

  function updateLimit(key: 'daily' | 'weekly' | 'monthly', value: string) {
    setLimits((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function updateToggle(key: keyof Pick<CardLimitSettings, 'onlinePurchases' | 'subscriptions' | 'cashWithdrawal' | 'internationalPayments'>, value: boolean) {
    setLimits((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function parseLimit(value: string) {
    return Number(value.replace(/,/g, '').trim());
  }

  function handleSave() {
    const daily = parseLimit(limits.daily);
    const weekly = parseLimit(limits.weekly);
    const monthly = parseLimit(limits.monthly);

    if (![daily, weekly, monthly].every((value) => Number.isFinite(value) && value > 0)) {
      setNotice(cardMessages.invalidLimits);
      return;
    }

    if (daily > monthly) {
      setNotice(cardMessages.dailyOverMonthly);
      return;
    }

    setNotice(cardMessages.limitsUpdated);
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
        <ModalHeader onClose={() => router.back()} title="حدود البطاقة" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            اضبط حدود الصرف لهذه البطاقة
          </AppText>
        </View>

        <BillSummaryCard
          rows={[
            { label: 'البطاقة', value: card.title },
            { label: 'الرقم', value: card.numberMask, ltr: true },
            { label: 'الحد الحالي', value: card.limit, ltr: true },
          ]}
        />

        <View style={styles.section}>
          <AppText variant="sectionTitle">حدود الصرف</AppText>
          <CardLimitRow label="الحد اليومي" onChangeText={(value) => updateLimit('daily', value)} value={limits.daily} />
          <CardLimitRow label="الحد الأسبوعي" onChangeText={(value) => updateLimit('weekly', value)} value={limits.weekly} />
          <CardLimitRow label="الحد الشهري" onChangeText={(value) => updateLimit('monthly', value)} value={limits.monthly} />
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">ضوابط الاستخدام</AppText>
          <ToggleRow
            onValueChange={(value) => updateToggle('onlinePurchases', value)}
            title="السماح بالمشتريات الإلكترونية"
            value={limits.onlinePurchases}
          />
          <ToggleRow
            onValueChange={(value) => updateToggle('subscriptions', value)}
            title="السماح بالاشتراكات"
            value={limits.subscriptions}
          />
          <ToggleRow
            onValueChange={(value) => updateToggle('cashWithdrawal', value)}
            title="السماح بالسحب النقدي"
            value={limits.cashWithdrawal}
          />
          <ToggleRow
            onValueChange={(value) => updateToggle('internationalPayments', value)}
            title="السماح بالمدفوعات الدولية"
            value={limits.internationalPayments}
          />
        </View>

        {notice ? (
          <SolidCard style={[styles.notice, saved ? styles.successNotice : styles.warningNotice]}>
            <Ionicons
              color={saved ? colors.semantic.success : colors.semantic.warning}
              name={saved ? 'checkmark-circle-outline' : 'information-circle-outline'}
              size={18}
            />
            <AppText style={styles.noticeText} tone={saved ? 'success' : 'warning'} variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.actions}>
          <AppButton iconName="save-outline" onPress={handleSave}>
            حفظ الحدود
          </AppButton>
          {saved ? (
            <AppButton
              iconName="card-outline"
              onPress={() =>
                router.replace({
                  pathname: routes.cardDetail,
                  params: { cardId: card.id },
                })
              }
              variant="secondary"
            >
              العودة إلى تفاصيل البطاقة
            </AppButton>
          ) : null}
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
  intro: {
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  successNotice: {
    backgroundColor: colors.semantic.successTint,
  },
  warningNotice: {
    backgroundColor: colors.semantic.warningTint,
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
