import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const capitalAppIcon = require('../../../assets/images/capital-app-icon.png');

export function SplashScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.54, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxl, spacing.xxxl),
            paddingTop: Math.max(insets.top + spacing.xxl, spacing.safeTop),
          },
        ]}
      >
        <View style={styles.center}>
          <View style={styles.logo}>
            <Image resizeMode="contain" source={capitalAppIcon} style={styles.logoImage} />
          </View>
          <View style={styles.copy}>
            <AppText align="center" style={styles.brandName} variant="screenTitle">
              CAPITAL
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              مدير مالي بالذكاء الاصطناعي
            </AppText>
          </View>
        </View>

        <View style={styles.bottom}>
          <ActivityIndicator color={colors.brand.link} size="small" />
          <AppText align="center" tone="tertiary" variant="caption">
            ZerofyAI
          </AppText>
          <AppButton onPress={() => router.push(routes.authWelcome)}>ابدأ الآن</AppButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.brand.deepGreen,
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: 24,
    borderWidth: 1,
    height: 82,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 82,
  },
  logoImage: {
    height: 76,
    width: 76,
  },
  copy: {
    gap: spacing.xs,
  },
  brandName: {
    color: colors.text.primary,
  },
  bottom: {
    gap: spacing.md,
  },
  glow: {
    backgroundColor: 'rgba(79,138,91,0.08)',
    borderRadius: radii.pill,
    height: 220,
    left: -64,
    position: 'absolute',
    top: 142,
    width: 220,
  },
});
