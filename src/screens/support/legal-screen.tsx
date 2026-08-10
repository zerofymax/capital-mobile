import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SupportModalHeader } from '@/components/support';
import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import { getLegalContentType, legalContent, type LegalContentType } from './support-data';

export function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const selectedType = getLegalContentType(type);
  const sections: LegalContentType[] = selectedType ? [selectedType] : ['terms', 'privacy'];
  const headerTitle = selectedType ? legalContent[selectedType].title : 'الشروط والخصوصية';

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
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Platform.OS === 'ios' ? spacing.sm : Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <SupportModalHeader accessibilityLabel="العودة" iconName="chevron-back-outline" title={headerTitle} />

        <SolidCard style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
          </View>
          <AppText style={styles.noticeText} tone="warning" variant="supporting">
            هذا المحتوى قانوني تجريبي ومخصص للعرض فقط.
          </AppText>
        </SolidCard>

        {sections.map((sectionType) => (
          <SolidCard key={sectionType} style={styles.legalCard}>
            <View style={styles.legalCopy}>
              <AppText style={styles.legalText} variant="sectionTitle">{legalContent[sectionType].title}</AppText>
              <AppText style={styles.legalText} tone="secondary" variant="body">
                {directionSafeText(legalContent[sectionType].body)}
              </AppText>
            </View>
          </SolidCard>
        ))}
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
    gap: spacing.lg,
    paddingHorizontal: 16,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  noticeIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,163,61,0.16)',
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  noticeText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  legalCard: {
    gap: spacing.md,
  },
  legalCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.md,
    width: '100%',
  },
  legalText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
