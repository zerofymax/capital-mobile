import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SupportModalHeader } from '@/components/support';
import { AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  appEngagementLinks,
  getAppVersionInfo,
  legalInformationLinks,
  releaseNotes,
  type AboutCapitalLinkItem,
} from './about-capital-data';

const capitalLogo = require('../../../assets/images/capital-app-icon.png');

export function AboutCapitalScreen() {
  const insets = useSafeAreaInsets();
  const versionInfo = getAppVersionInfo();
  const currentYear = new Date().getFullYear();

  function handleLinkPress(item: AboutCapitalLinkItem) {
    Haptics.selectionAsync().catch(() => null);

    if (item.soon) {
      return;
    }

    if (item.id === 'privacy') {
      router.push({ pathname: routes.legal, params: { type: 'privacy' } });
      return;
    }

    if (item.id === 'terms') {
      router.push({ pathname: routes.legal, params: { type: 'terms' } });
      return;
    }

    if (item.id === 'open-source') {
      router.push(routes.openSourceLicenses);
      return;
    }

    if (item.id === 'help-center') {
      router.push(routes.helpCenter);
      return;
    }

    if (item.id === 'send-feedback') {
      router.push(routes.sendFeedback);
      return;
    }

    if (item.id === 'contact-support') {
      router.push(routes.contactSupport);
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
        <SupportModalHeader title="عن Capital" />
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
            تعرّف على التطبيق، الإصدار الحالي، والسياسات المرتبطة باستخدامه.
          </AppText>

          <SolidCard style={styles.heroCard}>
            <View style={styles.logoMark}>
              <Image resizeMode="contain" source={capitalLogo} style={styles.logoImage} />
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.appTitleRow}>
                <AppText align="center" variant="screenTitle">
                  Capital
                </AppText>
                <StatusBadge label="نسخة تجريبية" />
              </View>
              <AppText align="center" style={styles.heroDescription} tone="secondary" variant="body">
                إدارة مالية مبسطة تساعد الشركات الناشئة على فهم أرقامها واتخاذ قرارات أوضح.
              </AppText>
            </View>
          </SolidCard>

          <PrototypeNotice />

          <View style={styles.section}>
            <AppText variant="sectionTitle">معلومات الإصدار</AppText>
            <SolidCard style={styles.rowsCard}>
              <InfoRow label="إصدار التطبيق" ltrValue value={versionInfo.versionLabel} />
              {versionInfo.buildNumber ? (
                <>
                  <Divider />
                  <InfoRow label="رقم البناء" ltrValue value={versionInfo.buildNumber} />
                </>
              ) : null}
              <Divider />
              <InfoRow label="بيئة التطبيق" value={versionInfo.environmentLabel} />
            </SolidCard>
          </View>

          <View style={styles.section}>
            <AppText variant="sectionTitle">ما الجديد في هذا الإصدار؟</AppText>
            <SolidCard style={styles.releaseCard}>
              {releaseNotes.map((note) => (
                <View key={note.id} style={styles.releaseRow}>
                  <Ionicons color={colors.brand.calmGreen} name="checkmark-circle-outline" size={17} />
                  <AppText style={styles.releaseText} tone="secondary" variant="supporting">
                    {note.label}
                  </AppText>
                </View>
              ))}
              <Divider />
              <AppText style={styles.releaseNote} tone="warning" variant="supporting">
                بعض الوظائف ما زالت تجريبية أو ستتوفر في تحديثات لاحقة.
              </AppText>
            </SolidCard>
          </View>

          <LinkSection items={legalInformationLinks} onPress={handleLinkPress} title="المعلومات القانونية" />

          <View style={styles.section}>
            <AppText variant="sectionTitle">قنوات التواصل الرسمية</AppText>
            <SolidCard style={styles.placeholderCard}>
              <Ionicons color={colors.text.tertiary} name="link-outline" size={20} />
              <AppText style={styles.placeholderText} tone="secondary" variant="supporting">
                قنوات التواصل الرسمية ستتوفر لاحقًا.
              </AppText>
            </SolidCard>
          </View>

          <LinkSection items={appEngagementLinks} onPress={handleLinkPress} title="المتجر والمشاركة" />

          <AppText align="center" style={styles.copyright} tone="tertiary" variant="caption">
            {`© ${currentYear} Capital. جميع الحقوق محفوظة.`}
          </AppText>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PrototypeNotice() {
  return (
    <SolidCard style={styles.prototypeCard}>
      <View style={styles.prototypeIcon}>
        <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
      </View>
      <AppText style={styles.prototypeText} tone="warning" variant="supporting">
        Capital حاليًا نموذج تجريبي محلي. بعض البيانات والوظائف المعروضة تجريبية ولا تمثل خدمات مالية أو
        محاسبية أو مصرفية فعلية.
      </AppText>
    </SolidCard>
  );
}

function LinkSection({
  items,
  onPress,
  title,
}: {
  items: readonly AboutCapitalLinkItem[];
  onPress: (item: AboutCapitalLinkItem) => void;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">{title}</AppText>
      <SolidCard style={styles.rowsCard}>
        {items.map((item, index) => (
          <View key={item.id}>
            <AboutLinkRow item={item} onPress={() => onPress(item)} />
            {index < items.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </SolidCard>
    </View>
  );
}

function AboutLinkRow({ item, onPress }: { item: AboutCapitalLinkItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${item.title}. ${item.description}${item.soon ? '. قريبًا' : ''}`}
      accessibilityRole="button"
      disabled={item.soon}
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && !item.soon && styles.pressed]}
    >
      <View style={styles.linkIcon}>
        <Ionicons color={colors.text.muted} name={item.icon} size={18} />
      </View>
      <View style={styles.linkCopy}>
        <View style={styles.linkTitleRow}>
          <AppText style={styles.linkTitle} variant="body">
            {item.title}
          </AppText>
          {item.soon ? <SoonBadge /> : null}
        </View>
        <AppText style={styles.linkDescription} tone="secondary" variant="caption">
          {item.description}
        </AppText>
      </View>
      {item.soon ? null : <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />}
    </Pressable>
  );
}

function InfoRow({ label, value, ltrValue = false }: { label: string; value: string; ltrValue?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={[styles.infoValue, ltrValue && styles.ltrValue]} variant="supporting">
        {value}
      </AppText>
    </View>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <View style={styles.statusBadge}>
      <AppText align="center" tone="success" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

function SoonBadge() {
  return (
    <View style={styles.soonBadge}>
      <AppText align="center" tone="warning" variant="caption">
        قريبًا
      </AppText>
    </View>
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
  heroCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.brand.deepGreen,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: 24,
    borderWidth: 1,
    height: 92,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 92,
  },
  logoImage: {
    height: 86,
    width: 86,
  },
  heroCopy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  appTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  heroDescription: {
    lineHeight: 24,
  },
  statusBadge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  prototypeCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  prototypeIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,163,61,0.16)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  prototypeText: {
    flex: 1,
    lineHeight: 22,
  },
  section: {
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'left',
  },
  ltrValue: {
    writingDirection: 'ltr',
  },
  releaseCard: {
    gap: spacing.md,
  },
  releaseRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  releaseText: {
    flex: 1,
  },
  releaseNote: {
    lineHeight: 22,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  linkCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  linkTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  linkTitle: {
    flexShrink: 1,
  },
  linkDescription: {
    lineHeight: 18,
    textAlign: 'right',
  },
  soonBadge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  placeholderCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  placeholderText: {
    flex: 1,
  },
  copyright: {
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
