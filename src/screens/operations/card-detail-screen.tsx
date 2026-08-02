import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BusinessCardPreview,
  CardActionGrid,
  CardTransactionRow,
  type CardActionItem,
  BillSummaryCard,
} from '@/components/operations';
import { AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  cardCapitalNote,
  cardMessages,
  cardTransactions,
  getCardStatusLabel,
  getPrototypeBusinessCard,
  type BusinessCardStatus,
} from './operations-data';

export function CardDetailScreen() {
  const insets = useSafeAreaInsets();
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();
  const card = getPrototypeBusinessCard(cardId);
  const [status, setStatus] = useState<BusinessCardStatus>(card.status);
  const [notice, setNotice] = useState<string | null>(null);
  const statusLabel = getCardStatusLabel(status);
  const noticeIsSuccess = notice === cardMessages.activated;
  const actions: CardActionItem[] = [
    {
      id: 'freeze',
      label: status === 'active' ? 'تجميد البطاقة' : 'تفعيل البطاقة',
      icon: status === 'active' ? 'snow-outline' : 'play-circle-outline',
      tone: status === 'active' ? 'warning' : 'default',
    },
    { id: 'limits', label: 'تغيير الحدود', icon: 'speedometer-outline' },
    { id: 'number', label: 'عرض الرقم', icon: 'eye-outline' },
    { id: 'settings', label: 'إعدادات البطاقة', icon: 'settings-outline' },
  ];

  function handleFreeze() {
    if (status === 'frozen') {
      setStatus('active');
      setNotice(cardMessages.activated);
      return;
    }

    Alert.alert('تجميد البطاقة', 'هل تريد تجميد هذه البطاقة مؤقتًا؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تجميد',
        style: 'destructive',
        onPress: () => {
          setStatus('frozen');
          setNotice(cardMessages.frozen);
        },
      },
    ]);
  }

  function handleAction(action: CardActionItem) {
    if (action.id === 'freeze') {
      handleFreeze();
      return;
    }
    if (action.id === 'limits') {
      router.push({
        pathname: routes.cardLimits,
        params: { cardId: card.id },
      });
      return;
    }
    setNotice(action.id === 'number' ? cardMessages.numberUnavailable : cardMessages.settingsUnavailable);
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
        <ModalHeader onClose={() => router.back()} title="تفاصيل البطاقة" />
        <BusinessCardPreview card={card} compact status={status} statusLabel={statusLabel} />

        {notice ? (
          <SolidCard style={styles.notice}>
            <Ionicons
              color={noticeIsSuccess ? colors.semantic.success : colors.semantic.warning}
              name="information-circle-outline"
              size={18}
            />
            <AppText
              style={styles.noticeText}
              tone={noticeIsSuccess ? 'success' : 'warning'}
              variant="supporting"
            >
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.section}>
          <AppText variant="sectionTitle">ملخص البطاقة</AppText>
          <BillSummaryCard
            rows={[
              { label: 'نوع البطاقة', value: card.typeLabel },
              { label: 'الحالة', value: statusLabel },
              { label: 'الحد الشهري', value: card.limit, ltr: true },
              { label: 'المصروف هذا الشهر', value: card.spent, ltr: true },
              { label: 'المتبقي', value: card.remaining, ltr: true },
              { label: 'آخر استخدام', value: card.lastUsed, ltr: true },
            ]}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">إجراءات سريعة</AppText>
          <CardActionGrid actions={actions} onPress={handleAction} />
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">عمليات البطاقة الأخيرة</AppText>
          <SolidCard style={styles.transactionsCard}>
            {cardTransactions.map((transaction, index) => (
              <CardTransactionRow
                isLast={index === cardTransactions.length - 1}
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </SolidCard>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">ملاحظة Capital</AppText>
          <SolidCard style={styles.aiNote}>
            <View style={styles.aiIcon}>
              <Ionicons color={colors.brand.green} name="sparkles-outline" size={18} />
            </View>
            <AppText style={styles.aiText} tone="muted" variant="body">
              {cardCapitalNote}
            </AppText>
          </SolidCard>
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
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  transactionsCard: {
    gap: spacing.md,
  },
  aiNote: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  aiIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  aiText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
