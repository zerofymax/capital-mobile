import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardTypeSelector } from '@/components/operations';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  cardMessages,
  cardRequestPurposes,
  cardRequestTypes,
  type BusinessCardType,
} from './operations-data';

export function RequestCardScreen() {
  const insets = useSafeAreaInsets();
  const [cardType, setCardType] = useState<BusinessCardType | ''>('');
  const [purpose, setPurpose] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const limitError =
    notice === cardMessages.requestLimitRequired || notice === cardMessages.requestLimitTooHigh ? notice : undefined;

  function handleContinue() {
    const numericLimit = Number(monthlyLimit.replace(/,/g, '').trim());

    if (!cardType) {
      setNotice(cardMessages.typeRequired);
      return;
    }
    if (!purpose) {
      setNotice(cardMessages.purposeRequired);
      return;
    }
    if (!monthlyLimit.trim() || !Number.isFinite(numericLimit) || numericLimit <= 0) {
      setNotice(cardMessages.requestLimitRequired);
      return;
    }
    if (numericLimit > 100000) {
      setNotice(cardMessages.requestLimitTooHigh);
      return;
    }

    const typeLabel = cardRequestTypes.find((type) => type.id === cardType)?.label ?? 'بطاقة افتراضية';
    router.push({
      pathname: routes.cardRequestSuccess,
      params: {
        cardType: typeLabel,
        monthlyLimit,
        purpose,
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
        <ModalHeader onClose={() => router.back()} title="طلب بطاقة جديدة" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            اختر نوع البطاقة المناسبة لنشاطك
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">نوع البطاقة</AppText>
          <CardTypeSelector
            onSelect={(value) => {
              setCardType(value);
              setNotice(null);
            }}
            options={cardRequestTypes}
            selectedValue={cardType}
          />
          {notice === cardMessages.typeRequired ? (
            <AppText tone="danger" variant="caption">
              {notice}
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">استخدام البطاقة</AppText>
          <View style={styles.purposeGrid}>
            {cardRequestPurposes.map((item) => {
              const selected = item === purpose;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => {
                    setPurpose(item);
                    setNotice(null);
                  }}
                  style={({ pressed }) => [
                    styles.purposeChip,
                    selected && styles.purposeSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
                    {item}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {notice === cardMessages.purposeRequired ? (
            <AppText tone="danger" variant="caption">
              {notice}
            </AppText>
          ) : null}
        </View>

        <SolidCard style={styles.limitCard}>
          <AppText variant="sectionTitle">الحد الشهري</AppText>
          <View style={styles.limitRow}>
            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => {
                setMonthlyLimit(value);
                setNotice(null);
              }}
              placeholder="10,000"
              placeholderTextColor={colors.text.tertiary}
              style={styles.limitInput}
              value={monthlyLimit}
            />
            <AppText style={styles.currency} variant="body">
              رس
            </AppText>
          </View>
          {limitError ? (
            <AppText tone="danger" variant="caption">
              {limitError}
            </AppText>
          ) : null}
        </SolidCard>

        {cardType === 'physical' ? (
          <SolidCard style={styles.deliveryCard}>
            <Ionicons color={colors.semantic.warning} name="location-outline" size={18} />
            <AppText style={styles.deliveryText} tone="warning" variant="supporting">
              سيتم طلب عنوان التوصيل لاحقًا
            </AppText>
          </SolidCard>
        ) : null}

        <AppButton iconName="checkmark-circle-outline" onPress={handleContinue}>
          مراجعة الطلب
        </AppButton>
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
  limitCard: {
    gap: spacing.md,
  },
  limitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  limitInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    fontVariant: ['tabular-nums'],
    lineHeight: 42,
    minHeight: 50,
    minWidth: 0,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  currency: {
    color: colors.brand.link,
  },
  deliveryCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  deliveryText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
