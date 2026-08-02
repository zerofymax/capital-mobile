import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

import {
  formatAccountAmount,
  getCurrencyCode,
  getFinancialAccount,
  getFinancialAccountStatusLabel,
  getFinancialAccountTypeIcon,
  getFinancialAccountTypeLabel,
  setDefaultFinancialAccount,
  toggleFinancialAccountStatus,
  useFinancialAccounts,
  type FinancialAccount,
} from './financial-accounts-data';

export function FinancialAccountDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ accountId?: string }>();
  useFinancialAccounts();

  const account = getFinancialAccount(params.accountId);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.financialAccounts);
  }

  if (!account) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <LinearGradient
          colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
          style={StyleSheet.absoluteFill}
        />
        <Header onBackPress={goBack} title="تفاصيل الحساب" />
        <View style={styles.emptyState}>
          <Ionicons color={colors.text.tertiary} name="wallet-outline" size={34} />
          <AppText align="center" variant="sectionTitle">
            لم يتم العثور على الحساب
          </AppText>
          <AppText align="center" tone="secondary" variant="body">
            قد يكون الحساب غير متاح داخل جلسة النموذج التجريبي الحالية.
          </AppText>
          <AppButton onPress={() => router.replace(routes.financialAccounts)}>العودة للحسابات</AppButton>
        </View>
      </SafeAreaView>
    );
  }

  const resolvedAccount = account;

  function editAccount() {
    router.push({ pathname: routes.accountForm, params: { accountId: resolvedAccount.id } });
  }

  function setAsDefault() {
    setDefaultFinancialAccount(resolvedAccount.id);
  }

  function toggleStatus() {
    toggleFinancialAccountStatus(resolvedAccount.id);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Header onBackPress={goBack} title="تفاصيل الحساب" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl) },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <AccountHero account={resolvedAccount} />

        <SolidCard style={styles.noteCard}>
          <Ionicons color={colors.brand.calmGreen} name="link-outline" size={18} />
          <AppText style={styles.noteText} tone="success" variant="supporting">
            سيتم ربط الرصيد بالعمليات والتحويلات في مرحلة لاحقة.
          </AppText>
        </SolidCard>

        <SolidCard style={styles.detailsCard}>
          <DetailRow label="اسم الحساب" value={resolvedAccount.name} />
          <DetailRow label="النوع" value={getFinancialAccountTypeLabel(resolvedAccount.type)} />
          <DetailRow label="البنك أو الجهة" value={resolvedAccount.institution || 'غير محدد'} />
          <DetailRow label="آخر أربعة أرقام" ltr value={resolvedAccount.lastFour || 'غير مضاف'} />
          <DetailRow label="العملة" ltr value={getCurrencyCode(resolvedAccount.currency)} />
          <DetailRow label="الرصيد الحالي التجريبي" ltr value={formatAccountAmount(resolvedAccount.balance)} />
          <DetailRow label="الرصيد الافتتاحي" ltr value={formatAccountAmount(resolvedAccount.openingBalance)} />
          {resolvedAccount.type === 'credit-card' ? (
            <DetailRow
              label="الحد الائتماني"
              ltr
              value={resolvedAccount.creditLimit === null ? 'غير محدد' : formatAccountAmount(resolvedAccount.creditLimit)}
            />
          ) : null}
          <DetailRow label="الحالة" value={getFinancialAccountStatusLabel(resolvedAccount.status)} />
          <DetailRow label="الحساب الافتراضي" value={resolvedAccount.isDefault ? 'نعم' : 'لا'} />
        </SolidCard>

        <View style={styles.actions}>
          <AppButton iconName="create-outline" onPress={editAccount}>
            تعديل الحساب
          </AppButton>
          {!resolvedAccount.isDefault ? (
            <AppButton onPress={setAsDefault} variant="secondary">
              تعيين كحساب افتراضي
            </AppButton>
          ) : null}
          <AppButton
            iconName={resolvedAccount.status === 'active' ? 'ban-outline' : 'play-circle-outline'}
            onPress={toggleStatus}
            variant={resolvedAccount.status === 'active' ? 'danger' : 'secondary'}
          >
            {resolvedAccount.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
          </AppButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBackPress }: { title: string; onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الحسابات المالية"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

function AccountHero({ account }: { account: FinancialAccount }) {
  const currencyCode = getCurrencyCode(account.currency);

  return (
    <SolidCard style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={styles.accountIcon}>
          <Ionicons color={colors.brand.calmGreen} name={getFinancialAccountTypeIcon(account.type)} size={22} />
        </View>
        <View style={styles.heroCopy}>
          <AppText variant="screenTitle">{account.name}</AppText>
          <AppText tone="secondary" variant="supporting">
            {getFinancialAccountTypeLabel(account.type)}
            {account.institution ? ` · ${account.institution}` : ''}
          </AppText>
        </View>
      </View>
      <Divider />
      <View style={styles.heroBalance}>
        <AppText style={styles.amountText} variant="numericValue">
          {currencyCode} {formatAccountAmount(account.balance)}
        </AppText>
        <AppText tone="secondary" variant="caption">
          الرصيد الحالي التجريبي
        </AppText>
      </View>
      <View style={styles.badgeRow}>
        {account.isDefault ? <Badge label="افتراضي" /> : null}
        <Badge label={getFinancialAccountStatusLabel(account.status)} muted={account.status !== 'active'} />
      </View>
    </SolidCard>
  );
}

function DetailRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <AppText style={styles.detailLabel} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <AppText style={[styles.detailValue, ltr && styles.ltrText]} variant="body">
        {value}
      </AppText>
    </View>
  );
}

function Badge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <View style={[styles.badge, muted && styles.mutedBadge]}>
      <AppText tone={muted ? 'tertiary' : 'success'} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
  },
  backButton: {
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
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  emptyState: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.screenX,
  },
  heroCard: {
    gap: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  accountIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.14)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  heroBalance: {
    gap: spacing.xs,
  },
  amountText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  badgeRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  mutedBadge: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
  },
  noteCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    lineHeight: 21,
  },
  detailsCard: {
    gap: spacing.md,
  },
  detailRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.surface.border,
    borderBottomWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    width: '100%',
  },
  detailLabel: {
    flexShrink: 0,
    maxWidth: '44%',
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  actions: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
