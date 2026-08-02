import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillStatusBadge, BillSummaryCard, TransactionActionRow } from '@/components/operations';
import { AppText, Divider, GlassSurface, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  billCapitalNote,
  billMessages,
  getPrototypeBill,
  type TransactionAction,
} from './operations-data';

const billActions: TransactionAction[] = [
  { id: 'pay', label: 'دفع الفاتورة', icon: 'card-outline' },
  { id: 'schedule', label: 'جدولة دفعة', icon: 'calendar-outline' },
  { id: 'download', label: 'تنزيل الفاتورة', icon: 'download-outline' },
  { id: 'note', label: 'إضافة ملاحظة', icon: 'chatbubble-ellipses-outline' },
];

export function BillDetailScreen() {
  const insets = useSafeAreaInsets();
  const { billId } = useLocalSearchParams<{ billId?: string }>();
  const [notice, setNotice] = useState<string | null>(null);
  const bill = getPrototypeBill(billId);

  function handleAction(action: TransactionAction) {
    if (action.id === 'pay') {
      router.push({
        pathname: routes.billPaymentReview,
        params: { billId: bill.id },
      });
      return;
    }

    const messageByAction = {
      schedule: billMessages.scheduleUnavailable,
      download: billMessages.downloadUnavailable,
      note: billMessages.noteUnavailable,
    } as const;

    setNotice(messageByAction[action.id as keyof typeof messageByAction] ?? billMessages.noteUnavailable);
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
        <ModalHeader onClose={() => router.back()} title="تفاصيل الفاتورة" />

        <GlassSurface>
          <View style={styles.billHero}>
            <View style={styles.heroTop}>
              <View style={styles.billIcon}>
                <Ionicons color={colors.brand.green} name="receipt-outline" size={22} />
              </View>
              <BillStatusBadge label={bill.statusLabel} status={bill.status} />
            </View>
            <View style={styles.heroCopy}>
              <AppText variant="sectionTitle">{bill.title}</AppText>
              <AppText align="left" style={styles.heroAmount} variant="numericValue">
                {bill.amount}
              </AppText>
              <AppText align="left" style={styles.heroMeta} tone="secondary" variant="caption">
                {bill.due} · {bill.category}
              </AppText>
            </View>
          </View>
        </GlassSurface>

        {notice ? (
          <SolidCard style={styles.notice}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="warning" variant="supporting">
              {notice}
            </AppText>
          </SolidCard>
        ) : null}

        <View style={styles.section}>
          <AppText variant="sectionTitle">معلومات الفاتورة</AppText>
          <BillSummaryCard
            rows={[
              { label: 'المورد', value: bill.vendor },
              { label: 'التصنيف', value: bill.category },
              { label: 'موعد الاستحقاق', value: bill.due, ltr: true },
              { label: 'رقم المرجع', value: bill.reference, ltr: true },
              { label: 'الحساب المستخدم للدفع', value: bill.paymentAccount },
            ]}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">تحليل Capital</AppText>
          <SolidCard style={styles.aiNote}>
            <View style={styles.aiIcon}>
              <Ionicons color={colors.brand.green} name="sparkles-outline" size={18} />
            </View>
            <AppText style={styles.aiText} tone="muted" variant="body">
              {billCapitalNote}
            </AppText>
          </SolidCard>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">الإجراءات</AppText>
          <SolidCard style={styles.actionsCard}>
            {billActions.map((action, index) => (
              <View key={action.id} style={styles.actionBlock}>
                <TransactionActionRow action={action} onPress={handleAction} />
                {index < billActions.length - 1 ? <Divider /> : null}
              </View>
            ))}
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
  billHero: {
    gap: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  billIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  heroAmount: {
    color: colors.brand.green,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  heroMeta: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
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
  actionsCard: {
    gap: spacing.md,
  },
  actionBlock: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
