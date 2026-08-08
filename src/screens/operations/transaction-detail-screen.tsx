import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatFinancialAmount } from '@/components/financial/financial-amount';
import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import {
  deleteTransaction,
  getDateOptionLabel,
  useTransactionsStore,
  type TransactionRecord,
} from '@/screens/ledger/ledger-data';
import { getCategoryById } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText, NumericText } from '@/utils/rtl';

export function TransactionDetailScreen() {
  const insets = useSafeAreaInsets();
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const { transactions } = useTransactionsStore();
  const transaction = useMemo(
    () => transactions.find((item) => item.id === transactionId) ?? null,
    [transactionId, transactions],
  );
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDeleteConfirm() {
    if (!transaction || deleting) {
      return;
    }

    setDeleting(true);
    deleteTransaction(transaction.id);
    setDeleteSheetVisible(false);
    router.replace(routes.ledger);
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
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="تفاصيل العملية" />

        {transaction ? (
          <>
            <TransactionHero transaction={transaction} />
            <TransactionInfo transaction={transaction} />
            <TransactionActions
              onDelete={() => setDeleteSheetVisible(true)}
              onEdit={() => {
                router.push({
                  pathname: routes.addTransaction,
                  params: {
                    mode: 'edit',
                    transactionId: transaction.id,
                    type: transaction.type,
                  },
                });
              }}
            />
          </>
        ) : (
          <SolidCard style={styles.missingCard}>
            <Ionicons color={colors.text.tertiary} name="alert-circle-outline" size={34} />
            <AppText align="center" variant="sectionTitle">
              تعذر العثور على العملية
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              قد تكون العملية حُذفت أو أن الرابط غير صالح.
            </AppText>
            <AppButton onPress={() => router.replace(routes.ledger)}>العودة إلى العمليات</AppButton>
          </SolidCard>
        )}
      </ScrollView>
      {transaction ? (
        <DeleteTransactionSheet
          onCancel={() => setDeleteSheetVisible(false)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
          transaction={transaction}
          visible={deleteSheetVisible}
        />
      ) : null}
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Feather color={colors.text.muted} name="chevron-left" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
    </View>
  );
}

function TransactionHero({ transaction }: { transaction: TransactionRecord }) {
  const isIncome = transaction.type === 'income';
  const category = getDisplayCategory(transaction);

  return (
    <SolidCard style={styles.heroCard}>
      <View style={styles.heroHeader}>
        <View style={[styles.heroIcon, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
          <Ionicons
            color={isIncome ? colors.semantic.success : colors.semantic.danger}
            name={category.icon}
            size={20}
          />
        </View>
        <View style={styles.heroCopy}>
          <AppText style={styles.heroText} variant="cardTitle">{transaction.description}</AppText>
          <AppText style={styles.heroText} tone="secondary" variant="supporting">
            {isIncome ? 'دخل' : 'مصروف'} · {category.name}
          </AppText>
        </View>
      </View>
      <NumericText style={[styles.heroAmount, isIncome ? styles.incomeText : styles.expenseText]}>
        {formatDisplayedTransactionAmount(transaction)}
      </NumericText>
    </SolidCard>
  );
}

function TransactionInfo({ transaction }: { transaction: TransactionRecord }) {
  const category = getDisplayCategory(transaction);
  const createdAt = formatTimestamp(transaction.createdAt);
  const updatedAt = formatTimestamp(transaction.updatedAt);
  const rows = [
    ['نوع العملية', transaction.type === 'income' ? 'دخل' : 'مصروف'],
    ['المبلغ', formatDisplayedTransactionAmount(transaction), true],
    ['التصنيف', category.name],
    ['التاريخ', getDateOptionLabel(transaction.transactionDate)],
    ['الوصف', transaction.description],
    ...(transaction.note ? [['الملاحظة', transaction.note] as const] : []),
    ['تاريخ الإنشاء التجريبي', createdAt],
    ...(updatedAt !== createdAt ? [['آخر تعديل', updatedAt] as const] : []),
  ] as const;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleWrapper}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">معلومات العملية</AppText>
      </View>
      <SolidCard style={styles.infoCard}>
        {rows.map(([label, value, ltr], index) => (
          <View key={label}>
            <InfoRow isLtr={Boolean(ltr)} label={label} value={value} />
            {index < rows.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function InfoRow({ label, value, isLtr = false }: { label: string; value: string; isLtr?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText style={styles.infoLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      {isLtr ? (
        <NumericText style={styles.infoValue}>{value}</NumericText>
      ) : (
        <AppText align="left" style={[styles.infoValue, styles.infoValueRtl]} variant="body">
          {directionSafeText(value)}
        </AppText>
      )}
    </View>
  );
}

function TransactionActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleWrapper}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">إجراءات</AppText>
      </View>
      <View style={styles.actions}>
        <AppButton iconName="create-outline" onPress={onEdit}>
          تعديل العملية
        </AppButton>
        <AppButton iconName="trash-outline" onPress={onDelete} variant="danger">
          حذف العملية
        </AppButton>
      </View>
    </View>
  );
}

function DeleteTransactionSheet({
  visible,
  transaction,
  deleting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  transaction: TransactionRecord;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetRoot}>
        <Pressable accessibilityLabel="إلغاء حذف العملية" disabled={deleting} onPress={onCancel} style={styles.sheetBackdrop} />
        <View style={[styles.deleteSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.deleteIcon}>
            <Ionicons color={colors.semantic.danger} name="trash-outline" size={23} />
          </View>
          <View style={styles.deleteCopy}>
            <AppText align="center" variant="sectionTitle">
              حذف العملية؟
            </AppText>
            <AppText style={styles.deleteDescription} tone="secondary" variant="body">
              سيتم حذف هذه العملية من النموذج المحلي، ولا يمكن التراجع عن ذلك داخل الجلسة الحالية.
            </AppText>
          </View>
          <SolidCard style={styles.deleteSummary}>
            <AppText numberOfLines={1} style={styles.deleteSummaryTitle} variant="cardTitle">
              {transaction.description}
            </AppText>
            <NumericText style={[styles.deleteAmount, transaction.type === 'income' ? styles.incomeText : styles.expenseText]}>
              {formatDisplayedTransactionAmount(transaction)}
            </NumericText>
          </SolidCard>
          <View style={styles.actions}>
            <AppButton disabled={deleting} onPress={onCancel} variant="secondary">
              إلغاء
            </AppButton>
            <AppButton loading={deleting} onPress={onConfirm} variant="danger">
              حذف العملية
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getDisplayCategory(transaction: TransactionRecord) {
  return (
    getCategoryById(transaction.categoryId) ?? {
      name: 'تصنيف غير متاح',
      icon: 'help-circle-outline' as const,
    }
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'غير محدد';
  }

  const formattedDate = date.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} · ${formattedTime}`;
}

function formatDisplayedTransactionAmount(transaction: TransactionRecord) {
  const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;

  return formatFinancialAmount(amount, true);
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
    direction: 'ltr',
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
  heroCard: {
    gap: spacing.lg,
  },
  heroHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  incomeIcon: {
    backgroundColor: colors.semantic.successTint,
  },
  expenseIcon: {
    backgroundColor: colors.semantic.dangerTint,
  },
  heroCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  heroText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroAmount: {
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'left',
  },
  incomeText: {
    color: colors.semantic.success,
  },
  expenseText: {
    color: colors.semantic.danger,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  infoCard: {
    gap: spacing.md,
  },
  infoRow: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    width: '100%',
  },
  infoLabel: {
    flexShrink: 0,
    maxWidth: '42%',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  infoValueRtl: {
    writingDirection: 'rtl',
  },
  actions: {
    gap: spacing.sm,
  },
  missingCard: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  deleteSheet: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 44,
  },
  deleteIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.semantic.dangerTint,
    borderColor: 'rgba(229,103,90,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  deleteCopy: {
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  deleteDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  deleteSummary: {
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  deleteSummaryTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  deleteAmount: {
    alignSelf: 'stretch',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
