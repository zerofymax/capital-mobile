import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText, directionSafeText } from '@/utils/rtl';

export type TransactionSuccessType = 'income' | 'expense' | 'commitment' | 'subscription';

type TransactionSuccessScreenProps = {
  type: TransactionSuccessType;
};

const successContent: Record<
  TransactionSuccessType,
  {
    title: string;
    amount: string;
    amountColor: string;
    dueDate?: string;
  }
> = {
  income: {
    title: 'تم حفظ الدخل',
    amount: '18,500 ر.س',
    amountColor: colors.semantic.success,
  },
  expense: {
    title: 'تم حفظ المصروف',
    amount: '3,200 ر.س',
    amountColor: colors.semantic.danger,
  },
  commitment: {
    title: 'تم حفظ الالتزام',
    amount: '4,500 ر.س',
    amountColor: colors.text.primary,
    dueDate: 'تاريخ الاستحقاق: 1 أغسطس 2026',
  },
  subscription: {
    title: 'تم حفظ الاشتراك',
    amount: '149 ر.س',
    amountColor: colors.text.primary,
  },
};

export function TransactionSuccessScreen({ type }: TransactionSuccessScreenProps) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount?: string | string[];
    currency?: string | string[];
    dueDate?: string | string[];
    frequency?: string | string[];
    name?: string | string[];
  }>();
  const content = successContent[type];
  const amountParam = Array.isArray(params.amount) ? params.amount[0] : params.amount;
  const currencyParam = Array.isArray(params.currency) ? params.currency[0] : params.currency;
  const dueDateParam = Array.isArray(params.dueDate) ? params.dueDate[0] : params.dueDate;
  const frequencyParam = Array.isArray(params.frequency) ? params.frequency[0] : params.frequency;
  const nameParam = Array.isArray(params.name) ? params.name[0] : params.name;
  const amount = amountParam ? `${amountParam} ${currencyParam ?? 'ر.س'}` : content.amount;
  const dueDateLine =
    type === 'commitment' && dueDateParam ? `تاريخ الاستحقاق: ${dueDateParam}` : content.dueDate;
  const subscriptionSummary =
    type === 'subscription'
      ? `${nameParam?.trim() || 'Capital Pro'} · ${amountParam?.trim() || '149'} ${currencyParam ?? 'ر.س'} / ${
          frequencyParam ?? 'شهريًا'
        }`
      : null;

  function handleAddAnother() {
    if (type === 'commitment') {
      router.replace(routes.addCommitment);
      return;
    }

    if (type === 'subscription') {
      router.replace(routes.addSubscription);
      return;
    }

    if (type === 'expense') {
      router.replace(routes.addExpense);
      return;
    }

    if (type === 'income') {
      router.replace(routes.addIncome);
      return;
    }

    router.replace({
      pathname: routes.addTransaction,
      params: {
        type,
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
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxxl),
            paddingTop: Math.max(insets.top + spacing.xl, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerArea}>
          <View accessibilityLabel="تم حفظ العملية بنجاح" style={styles.successHalo}>
            <View style={styles.successCircle}>
              <Ionicons color={colors.brand.calmGreen} name="checkmark" size={46} />
            </View>
          </View>

          <View style={styles.copy}>
            <AppText align="center" variant="screenTitle">
              {content.title}
            </AppText>
            {subscriptionSummary ? (
              <AppText align="center" style={styles.summary} tone="secondary" variant="body">
                {directionSafeText(subscriptionSummary)}
              </AppText>
            ) : (
              <NumericText accessibilityLabel={amount} style={[styles.amount, { color: content.amountColor }]}>
                {amount}
              </NumericText>
            )}
            {dueDateLine ? (
              <AppText align="center" tone="secondary" variant="supporting">
                {directionSafeText(dueDateLine)}
              </AppText>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton onPress={() => router.replace(routes.ledger)}>العودة إلى السجل</AppButton>
          <AppButton onPress={handleAddAnother} variant="secondary">
            إضافة عملية أخرى
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenX,
  },
  centerArea: {
    alignItems: 'center',
    flexGrow: 1,
    gap: spacing.xxl,
    justifyContent: 'center',
    minHeight: 450,
  },
  successHalo: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.12)',
    borderColor: 'rgba(167,200,161,0.16)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 132,
    justifyContent: 'center',
    width: 132,
  },
  successCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.28)',
    borderColor: 'rgba(167,200,161,0.46)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 320,
  },
  amount: {
    fontSize: 38,
    lineHeight: 48,
    textAlign: 'center',
  },
  summary: {
    maxWidth: 300,
  },
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
});
