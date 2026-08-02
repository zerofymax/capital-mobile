import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SupportModalHeader } from '@/components/support';
import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { openSourceLicenses, type OpenSourceLicenseItem } from './about-capital-data';

export function OpenSourceLicensesScreen() {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<string | null>(null);

  async function handleOpenProject(item: OpenSourceLicenseItem) {
    Haptics.selectionAsync().catch(() => null);

    try {
      const canOpen = await Linking.canOpenURL(item.projectUrl);

      if (!canOpen) {
        setNotice('تعذر فتح رابط المشروع الآن.');
        return;
      }

      await Linking.openURL(item.projectUrl);
    } catch {
      setNotice('تعذر فتح رابط المشروع الآن.');
    }
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SupportModalHeader title="تراخيص المصدر المفتوح" />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          <AppText align="center" tone="secondary" variant="supporting">
            المكتبات مفتوحة المصدر المستخدمة في بناء Capital.
          </AppText>

          <SolidCard style={styles.noticeCard}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
            <AppText style={styles.noticeText} tone="warning" variant="supporting">
              تخضع كل مكتبة لشروط الترخيص الخاصة بها.
            </AppText>
          </SolidCard>

          {notice ? (
            <SolidCard accessibilityLiveRegion="polite" style={styles.errorNotice}>
              <Ionicons color={colors.semantic.warning} name="alert-circle-outline" size={18} />
              <AppText style={styles.noticeText} tone="warning" variant="supporting">
                {notice}
              </AppText>
            </SolidCard>
          ) : null}

          <View style={styles.licensesList}>
            {openSourceLicenses.map((item) => (
              <LicenseCard item={item} key={item.id} onOpenProject={() => handleOpenProject(item)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function LicenseCard({ item, onOpenProject }: { item: OpenSourceLicenseItem; onOpenProject: () => void }) {
  return (
    <SolidCard style={styles.licenseCard}>
      <View style={styles.licenseHeader}>
        <View style={styles.libraryIcon}>
          <Ionicons color={colors.brand.calmGreen} name="cube-outline" size={18} />
        </View>
        <View style={styles.libraryCopy}>
          <AppText style={styles.libraryName} variant="cardTitle">
            {item.name}
          </AppText>
          <AppText style={styles.libraryVersion} tone="secondary" variant="caption">
            {item.version}
          </AppText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <AppText tone="secondary" variant="caption">
          الترخيص
        </AppText>
        <AppText style={styles.ltrText} variant="supporting">
          {item.license}
        </AppText>
      </View>

      <Pressable
        accessibilityLabel={`فتح رابط ${item.name}`}
        accessibilityRole="link"
        onPress={onOpenProject}
        style={({ pressed }) => [styles.projectLink, pressed && styles.pressed]}
      >
        <Ionicons color={colors.brand.calmGreen} name="open-outline" size={16} />
        <AppText align="center" numberOfLines={1} style={styles.projectUrl} tone="link" variant="caption">
          فتح الموقع الرسمي
        </AppText>
      </Pressable>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
  },
  content: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  noticeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  errorNotice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
    lineHeight: 22,
  },
  licensesList: {
    gap: spacing.md,
  },
  licenseCard: {
    gap: spacing.md,
  },
  licenseHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  libraryIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  libraryCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  libraryName: {
    textAlign: 'right',
  },
  libraryVersion: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  projectLink: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(167,200,161,0.08)',
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  projectUrl: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
