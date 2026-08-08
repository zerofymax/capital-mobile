import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function AccountCreatedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.7, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.3, y: 0 }}
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerArea}>
          <View style={styles.successHalo}>
            <View style={styles.successCircle}>
              <Ionicons color={colors.brand.calmGreen} name="checkmark" size={46} />
            </View>
          </View>

          <View style={styles.copy}>
            <AppText align="center" variant="screenTitle">
              تم إنشاء حسابك
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              بقيت خطوات بسيطة لإعداد نشاطك المالي
            </AppText>
          </View>
        </View>

        <View style={styles.actionArea}>
          <AppButton onPress={() => router.replace(routes.financialSetupBusinessInfo)}>بدء إعداد النشاط</AppButton>
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
    paddingHorizontal: 20,
  },
  centerArea: {
    alignItems: 'center',
    flexGrow: 1,
    gap: spacing.xxl,
    justifyContent: 'center',
    minHeight: 420,
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
    gap: spacing.sm,
    maxWidth: 300,
  },
  actionArea: {
    paddingTop: spacing.xl,
  },
});
