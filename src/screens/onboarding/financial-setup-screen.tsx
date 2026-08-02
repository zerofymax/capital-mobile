import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Divider, GlassSurface } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function FinancialSetupScreen() {
  const insets = useSafeAreaInsets();

  function handleStartSetup() {
    router.push(routes.financialSetupBusinessInfo);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.75, y: 1 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0.24, y: 0 }}
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
        <View style={styles.topArea}>
          <View style={styles.brandTile}>
            <Ionicons color={colors.brand.calmGreen} name="globe-outline" size={24} />
          </View>
        </View>

        <View style={styles.mainArea}>
          <View style={styles.copy}>
            <AppText variant="screenTitle">لنجهز نشاطك المالي</AppText>
            <AppText tone="secondary" variant="body">
              سنطرح عليك بعض الأسئلة السريعة حتى ينشئ Capital أول نظرة مالية مخصصة لنشاطك.
            </AppText>
          </View>

          <GlassSurface radius={radii.glass}>
            <InfoRow iconName="time-outline" subtitle="أقل من دقيقتين" title="الوقت المتوقع" />
            <View style={styles.dividerWrap}>
              <Divider />
            </View>
            <InfoRow
              iconName="lock-closed-outline"
              subtitle="يمكنك تعديل هذه المعلومات لاحقًا"
              title="خصوصية بياناتك"
            />
          </GlassSurface>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actionArea}>
          <AppButton onPress={handleStartSetup}>ابدأ الإعداد</AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

type InfoRowProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

function InfoRow({ iconName, title, subtitle }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.brand.calmGreen} name={iconName} size={19} />
      </View>
      <View style={styles.infoText}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
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
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  topArea: {
    alignItems: 'flex-end',
  },
  brandTile: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,90,58,0.26)',
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: radii.input,
    borderWidth: 1,
    boxShadow: '0 14px 30px rgba(31,90,58,0.24)',
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  mainArea: {
    gap: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  copy: {
    gap: spacing.md,
  },
  dividerWrap: {
    paddingVertical: spacing.md,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.16)',
    borderColor: 'rgba(167,200,161,0.22)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  infoText: {
    flex: 1,
    gap: spacing.xxs,
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxxl,
  },
  actionArea: {
    gap: spacing.md,
  },
});
