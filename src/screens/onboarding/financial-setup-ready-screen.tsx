import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, GlassSurface } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const prototypeSummary = {
  cash: 45000,
  revenue: 28500,
  expense: 19200,
};

const netCashFlow = prototypeSummary.revenue - prototypeSummary.expense;

const summaryMetrics = [
  { label: 'النقد المتاح', tone: 'primary', value: formatCurrency(prototypeSummary.cash) },
  { label: 'الإيراد الشهري', tone: 'primary', value: formatCurrency(prototypeSummary.revenue) },
  { label: 'المصروف الشهري', tone: 'primary', value: formatCurrency(prototypeSummary.expense) },
  {
    label: 'صافي التدفق الشهري',
    tone: netCashFlow > 0 ? 'success' : netCashFlow < 0 ? 'danger' : 'primary',
    value: formatCurrency(netCashFlow, true),
  },
] as const;

function formatCurrency(value: number, signed = false) {
  const sign = signed && value > 0 ? '+' : value < 0 ? '-' : '';
  const amount = Math.abs(value).toLocaleString('en-US');
  return `${sign}${amount} ر.س`;
}

export function FinancialSetupReadyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.48, 1]}
        start={{ x: 0.22, y: 0 }}
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
        <View style={styles.hero}>
          <View accessibilityLabel="تم إعداد النظرة المالية بنجاح" style={styles.successHalo}>
            <View style={styles.successCircle}>
              <Ionicons color={colors.brand.calmGreen} name="checkmark" size={44} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <AppText align="center" tone="success" variant="caption">
              تم إعداد نظرتك المالية
            </AppText>
            <AppText align="center" variant="screenTitle">
              نظرتك المالية جاهزة
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              بناءً على بيانات نشاطك، أنشأ Capital ملخصًا أوليًا يساعدك على فهم وضعك المالي واتخاذ الخطوة التالية.
            </AppText>
          </View>
        </View>

        <GlassSurface accessibilityLabel="ملخص وضعك المالي" style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIcon}>
              <Ionicons color={colors.brand.calmGreen} name="wallet-outline" size={18} />
            </View>
            <AppText style={styles.cardTitleText} variant="cardTitle">ملخص وضعك المالي</AppText>
          </View>

          <View style={styles.metricsGrid}>
            {summaryMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricTile}>
                <AppText style={styles.rtlText} tone="secondary" variant="caption">
                  {metric.label}
                </AppText>
                <AppText style={styles.metricValue} tone={metric.tone ?? 'primary'} variant="cardTitle">
                  {metric.value}
                </AppText>
              </View>
            ))}
          </View>
        </GlassSurface>

        <GlassSurface accessibilityLabel="حالة النشاط" style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.headerIcon}>
              <Ionicons color={colors.brand.calmGreen} name="pulse-outline" size={18} />
            </View>
            <AppText style={styles.cardTitleText} variant="cardTitle">حالة النشاط</AppText>
          </View>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <AppText tone="success" variant="caption">
              الوضع المالي مستقر
            </AppText>
          </View>

          <AppText style={styles.rtlText} tone="secondary" variant="body">
            إيراداتك الحالية تغطي مصروفاتك، مع تدفق نقدي إيجابي يحتاج إلى متابعة منتظمة.
          </AppText>
        </GlassSurface>

        <View accessibilityLabel="ملاحظة Capital" style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIcon}>
              <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
            </View>
            <AppText style={styles.cardTitleText} tone="success" variant="cardTitle">
              ملاحظة Capital
            </AppText>
          </View>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            لديك تدفق نقدي إيجابي، لكن الالتزامات الشهرية تمثل جزءًا ملحوظًا من مصروفاتك. متابعة المصروفات المتكررة قد تساعدك على تحسين هامش الأمان المالي.
          </AppText>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
          <AppButton onPress={() => router.replace(routes.home)}>الانتقال إلى الرئيسية</AppButton>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.push(routes.financialSetupReview)}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <AppText align="center" tone="secondary" variant="buttonLabel">
              مراجعة البيانات
            </AppText>
          </Pressable>
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
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  successHalo: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.12)',
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: radii.pill,
    borderWidth: 1,
    boxShadow: '0 0 34px rgba(79,138,91,0.18)',
    height: 124,
    justifyContent: 'center',
    width: 124,
  },
  successCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.30)',
    borderColor: 'rgba(167,200,161,0.46)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  copyBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 330,
  },
  summaryCard: {
    marginTop: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricTile: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    direction: 'ltr',
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 140,
    padding: spacing.md,
  },
  metricValue: {
    alignSelf: 'stretch',
    direction: 'ltr',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  healthCard: {
    gap: spacing.md,
  },
  healthHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.25)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    backgroundColor: colors.brand.mediumGreen,
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  insightCard: {
    backgroundColor: 'rgba(11,46,38,0.62)',
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: radii.glass,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  insightHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  insightIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.20)',
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  cardTitleText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.md,
  },
  actionArea: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
