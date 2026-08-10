import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

import {
  formatAccountAmount,
  getCurrencyCode,
  getFinancialAccountStatusLabel,
  getFinancialAccountTypeIcon,
  getFinancialAccountTypeLabel,
  summarizeAccountsByCurrency,
  useFinancialAccounts,
  type FinancialAccount,
} from './financial-accounts-data';

const androidPhysicalLtrRow: ViewStyle = { direction: 'ltr', flexDirection: 'row' };
const androidLtrDirection: ViewStyle = { direction: 'ltr' };
const androidHeaderSlot: ViewStyle = { width: 0 };

export function FinancialAccountsScreen() {
  const insets = useSafeAreaInsets();
  const { accounts } = useFinancialAccounts();
  const activeCount = accounts.filter((account) => account.status === 'active').length;
  const inactiveCount = accounts.length - activeCount;
  const defaultAccount = accounts.find((account) => account.isDefault);
  const balancesByCurrency = summarizeAccountsByCurrency(accounts);

  function openAccount(accountId: string) {
    router.push({ pathname: routes.financialAccountDetails, params: { accountId } });
  }

  function openAddAccount() {
    router.push(routes.accountForm);
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

      <Header />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom + spacing.xxl) },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <SolidCard style={styles.summaryCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconWrap}>
              <Ionicons color={colors.brand.calmGreen} name="wallet-outline" size={20} />
            </View>
            <View style={styles.headerText}>
              <AppText variant="cardTitle">ملخص الحسابات</AppText>
              <AppText tone="secondary" variant="caption">
                أرصدة حسب العملة دون تحويل تلقائي
              </AppText>
            </View>
          </View>

          <View style={styles.balanceList}>
            {balancesByCurrency.map((summary) => (
              <View key={summary.currency} style={styles.balanceRow}>
                <AppText style={styles.balanceLabel} tone="secondary" variant="caption">
                  إجمالي الأرصدة المتاحة
                </AppText>
                <AppText style={styles.ltrText} variant="numericValue">
                  {summary.code} {formatAccountAmount(summary.balance)}
                </AppText>
              </View>
            ))}
          </View>

          <Divider />

          <View style={styles.summaryStatsSection}>
            <View style={styles.statsGrid}>
              <SummaryStat label="الحسابات النشطة" value={String(activeCount)} />
              <SummaryStat label="غير النشطة" value={String(inactiveCount)} />
            </View>
            <SummaryStat fullWidth label="الحساب الافتراضي" value={defaultAccount?.name ?? 'غير محدد'} />
          </View>
        </SolidCard>

        <NoticeCard
          icon="information-circle-outline"
          text="الأرصدة المعروضة تجريبية ولا تتم مزامنتها مع البنوك."
        />
        <NoticeCard
          icon="link-outline"
          text="الأرصدة محلية وتجريبية حتى يتم ربط الحسابات بالعمليات."
          tone="green"
        />

        <View style={styles.section}>
          <View style={styles.sectionTitleWrapper}>
            <AppText style={styles.sectionTitle} variant="sectionTitle">الحسابات والمحافظ</AppText>
          </View>
          <View style={styles.accountList}>
            {accounts.map((account) => (
              <AccountCard account={account} key={account.id} onPress={() => openAccount(account.id)} />
            ))}
          </View>
        </View>

        <AppButton iconName="add-outline" onPress={openAddAccount}>
          إضافة حساب
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى المزيد"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.account))}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather color={colors.text.muted} name="chevron-left" size={22} />
      </Pressable>
      <View style={styles.titleWrap}>
        <AppText style={styles.titleText} variant="screenTitle">
          الحسابات المالية
        </AppText>
        <AppText style={styles.titleText} tone="secondary" variant="supporting">
          أدر النقد والحسابات والمحافظ التي تستخدمها شركتك.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function SummaryStat({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <View style={[styles.stat, fullWidth && styles.defaultStat]}>
      <AppText numberOfLines={fullWidth ? 2 : 1} style={[styles.statValue, fullWidth && styles.defaultStatValue]} variant="body">
        {value}
      </AppText>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function NoticeCard({
  icon,
  text,
  tone = 'amber',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  tone?: 'amber' | 'green';
}) {
  const isGreen = tone === 'green';

  return (
    <SolidCard style={[styles.noticeCard, isGreen && styles.greenNotice]}>
      <Ionicons color={isGreen ? colors.brand.calmGreen : colors.semantic.warning} name={icon} size={18} />
      <AppText style={styles.noticeText} tone={isGreen ? 'success' : 'warning'} variant="supporting">
        {text}
      </AppText>
    </SolidCard>
  );
}

function AccountCard({ account, onPress }: { account: FinancialAccount; onPress: () => void }) {
  const currencyCode = getCurrencyCode(account.currency);
  const isCredit = account.type === 'credit-card';
  const balanceTone = account.balance < 0 ? 'danger' : 'primary';

  return (
    <Pressable
      accessibilityLabel={`فتح تفاصيل ${account.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.accountCard, pressed && styles.pressed]}
    >
      <View style={styles.accountTop}>
        <View style={styles.accountIcon}>
          <Ionicons color={colors.brand.calmGreen} name={getFinancialAccountTypeIcon(account.type)} size={20} />
        </View>
        <View style={styles.accountCopy}>
          <View style={styles.accountTitleRow}>
            <AppText style={styles.accountName} variant="cardTitle">
              {account.name}
            </AppText>
            {account.isDefault ? <Badge label="افتراضي" /> : null}
          </View>
          <AppText style={styles.accountDescription} tone="secondary" variant="caption">
            {directionSafeText(
              `${getFinancialAccountTypeLabel(account.type)}${account.institution ? ` · ${account.institution}` : ''}${
                account.lastFour ? ` · ${account.lastFour}` : ''
              }`,
            )}
          </AppText>
        </View>
        <Ionicons color={colors.text.tertiary} name="chevron-back" size={18} />
      </View>

      <View style={styles.accountMeta}>
        <View style={styles.metaItem}>
          <AppText style={styles.ltrText} tone={balanceTone} variant="body">
            {formatAccountAmount(account.balance)}
          </AppText>
          <AppText tone="secondary" variant="caption">
            الرصيد التجريبي
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText style={styles.ltrText} variant="body">
            {currencyCode}
          </AppText>
          <AppText tone="secondary" variant="caption">
            العملة
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText tone={account.status === 'active' ? 'success' : 'tertiary'} variant="body">
            {getFinancialAccountStatusLabel(account.status)}
          </AppText>
          <AppText tone="secondary" variant="caption">
            الحالة
          </AppText>
        </View>
      </View>

      {isCredit && account.creditLimit !== null ? (
        <View style={styles.creditLine}>
          <AppText tone="secondary" variant="caption">
            الحد الائتماني
          </AppText>
          <AppText style={styles.ltrText} tone="secondary" variant="caption">
            {currencyCode} {formatAccountAmount(account.creditLimit)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText tone="success" variant="caption">
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
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    ...androidPhysicalLtrRow,
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
  titleWrap: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 40,
    width: 40,
    ...androidHeaderSlot,
  },
  titleText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.14)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  balanceList: {
    gap: spacing.sm,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryStatsSection: {
    gap: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 68,
    padding: spacing.sm,
  },
  statValue: {
    minWidth: 0,
  },
  defaultStat: {
    minHeight: 62,
  },
  defaultStatValue: {
    lineHeight: 22,
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    ...androidPhysicalLtrRow,
  },
  greenNotice: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  noticeText: {
    flex: 1,
    lineHeight: 21,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitleWrapper: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
    ...androidLtrDirection,
  },
  sectionTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  accountList: {
    gap: spacing.md,
  },
  accountCard: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  accountTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  accountIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.20)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  accountCopy: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  accountTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  accountName: {
    flexShrink: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  accountDescription: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  badge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  accountMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaItem: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xs,
  },
  creditLine: {
    alignItems: 'center',
    borderTopColor: colors.surface.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
