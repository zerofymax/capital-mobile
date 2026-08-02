import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText } from '@/utils/rtl';

const capitalAppIcon = require('../../../assets/images/capital-app-icon.png');

const previewBars = [44, 68, 54, 88, 64, 104];

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  function openLegal(type: 'terms' | 'privacy') {
    router.push({
      pathname: routes.legal,
      params: { type },
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.48, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xl, spacing.xxl),
            paddingTop: Math.max(insets.top + spacing.lg, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Image resizeMode="contain" source={capitalAppIcon} style={styles.brandImage} />
          </View>
          <AppText align="left" style={styles.brandText} variant="cardTitle">
            Capital
          </AppText>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <AppText tone="secondary" variant="caption">
                النقد المتاح
              </AppText>
              <NumericText style={styles.amount}>128,340 ر.س</NumericText>
            </View>
            <View style={styles.statusPill}>
              <AppText style={styles.statusText} variant="caption">
                مستقر
              </AppText>
            </View>
          </View>

          <View style={styles.insightRow}>
            <View style={styles.trendChip}>
              <NumericText style={styles.trendValue}>+12%</NumericText>
              <AppText style={styles.trendLabel} variant="caption">
                هذا الشهر
              </AppText>
            </View>
            <View style={styles.flowMetric}>
              <AppText tone="secondary" variant="caption">
                التدفق النقدي
              </AppText>
              <AppText style={styles.flowValue} variant="caption">
                إيجابي
              </AppText>
            </View>
          </View>

          <View style={styles.chartPanel}>
            <View style={styles.gridLineTop} />
            <View style={styles.gridLineMiddle} />
            <View style={styles.gridLineBase} />
            <View style={styles.chart}>
              {previewBars.map((height, index) => (
                <View key={`${height}-${index}`} style={styles.chartColumn}>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[colors.brand.calmGreen, colors.brand.mediumGreen, colors.brand.green]}
                      end={{ x: 0.5, y: 1 }}
                      start={{ x: 0.5, y: 0 }}
                      style={[styles.chartBar, { height }]}
                    />
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.chartGlow} />
          </View>
        </View>

        <View style={styles.copy}>
          <AppText align="center" style={styles.headline} variant="display">
            أدر أموالك بوضوح{'\n'}وافهم ما يجب فعله بعد ذلك
          </AppText>
          <AppText align="center" tone="secondary" variant="body">
            Capital يساعدك على متابعة وضع نشاطك المالي واتخاذ قرارات أوضح.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton onPress={() => router.push(routes.login)}>تسجيل الدخول</AppButton>
          <AppButton onPress={() => router.push(routes.register)} variant="secondary">
            فتح حساب جديد
          </AppButton>
        </View>

        <View style={styles.footerLinks}>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => openLegal('privacy')}>
            <AppText align="center" tone="secondary" variant="caption">
              سياسة الخصوصية
            </AppText>
          </Pressable>
          <AppText align="center" tone="tertiary" variant="caption">
            ·
          </AppText>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => openLegal('terms')}>
            <AppText align="center" tone="secondary" variant="caption">
              الشروط والأحكام
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
    gap: spacing.xl,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  glow: {
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderRadius: radii.pill,
    height: 260,
    left: -120,
    position: 'absolute',
    top: 108,
    width: 260,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: colors.brand.deepGreen,
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: 15,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 42,
  },
  brandImage: {
    height: 40,
    width: 40,
  },
  brandText: {
    color: colors.brand.link,
  },
  previewCard: {
    backgroundColor: 'rgba(17,20,25,0.86)',
    borderColor: 'rgba(167,200,161,0.20)',
    borderRadius: 28,
    borderWidth: 1,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 34px rgba(0,0,0,0.42)',
    gap: spacing.lg,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  previewHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  amount: {
    color: colors.text.primary,
    fontSize: 30,
    lineHeight: 38,
  },
  statusPill: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  statusText: {
    color: colors.brand.link,
  },
  insightRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  trendChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.13)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  trendValue: {
    color: colors.brand.calmGreen,
    fontSize: 14,
    lineHeight: 19,
  },
  trendLabel: {
    color: colors.text.secondary,
  },
  flowMetric: {
    alignItems: 'flex-start',
    gap: 2,
  },
  flowValue: {
    color: colors.brand.calmGreen,
    fontWeight: '700',
  },
  chartPanel: {
    height: 106,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    height: 104,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 2,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  barTrack: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.055)',
    borderRadius: radii.pill,
    height: 104,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 16,
  },
  chartBar: {
    borderRadius: radii.chart,
    boxShadow: '0 0 14px rgba(79,138,91,0.22)',
    width: 16,
  },
  gridLineTop: {
    backgroundColor: 'rgba(246,248,247,0.055)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 14,
  },
  gridLineMiddle: {
    backgroundColor: 'rgba(246,248,247,0.045)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 52,
  },
  gridLineBase: {
    backgroundColor: 'rgba(167,200,161,0.14)',
    bottom: 0,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  chartGlow: {
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderRadius: radii.pill,
    bottom: -48,
    height: 90,
    left: 24,
    position: 'absolute',
    right: 24,
  },
  copy: {
    gap: spacing.md,
  },
  headline: {
    fontSize: 31,
    lineHeight: 42,
  },
  actions: {
    gap: spacing.md,
  },
  footerLinks: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'center',
  },
});
