import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  getFinancialTermById,
  getFinancialTermCategoryLabel,
  getRelatedFinancialTerms,
} from './financial-terms-data';
import type { FinancialTerm } from './financial-terms-types';
import { FinancialTermsHeader } from './financial-terms-screen';

export function FinancialTermDetailsScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const params = useLocalSearchParams<{ termId?: string }>();
  const termId = Array.isArray(params.termId) ? params.termId[0] : params.termId;
  const term = getFinancialTermById(termId);

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: themeColors.background.base }]}>
      <LinearGradient
        colors={[themeColors.background.heroStart, themeColors.background.base, themeColors.background.base]}
        end={{ x: 0.68, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.32, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.headerWrap}>
        <FinancialTermsHeader
          onBack={() => router.back()}
          subtitle={term ? getFinancialTermCategoryLabel(term.category) : undefined}
          title={term?.titleAr ?? 'تعذر العثور على المصطلح'}
        />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, spacing.screenBottom) }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        {term ? <TermDetailsContent term={term} /> : <InvalidTermState />}
      </ScrollView>
    </SafeAreaView>
  );
}

function TermDetailsContent({ term }: { term: FinancialTerm }) {
  const [showSimpler, setShowSimpler] = useState(false);
  const relatedTerms = getRelatedFinancialTerms(term);

  function openRelatedTerm(termId: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.financialTermDetails, params: { termId } });
  }

  function openCapitalDestination() {
    if (!term.capitalDestination) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    router.push(term.capitalDestination.route);
  }

  return (
    <>
      <SolidCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons color={colors.brand.calmGreen} name={term.icon} size={24} />
          </View>
          <View style={styles.heroCopy}>
            <AppText style={styles.rtlText} variant="sectionTitle">{term.titleAr}</AppText>
            <View style={styles.metaRow}>
              {term.acronym ? <LtrBadge value={term.acronym} /> : null}
              {term.englishName ? (
                <AppText style={styles.englishName} tone="secondary" variant="caption">
                  {term.englishName}
                </AppText>
              ) : null}
            </View>
            <AppText style={styles.rtlText} tone="secondary" variant="caption">
              {getFinancialTermCategoryLabel(term.category)}
            </AppText>
          </View>
        </View>
        <AppText style={styles.rtlText} variant="body">{directionSafeText(term.shortDefinition)}</AppText>
      </SolidCard>

      <DetailCard icon="book-outline" title="ما معنى المصطلح؟">
        <AppText style={styles.rtlText} tone="secondary" variant="body">
          {directionSafeText(term.simpleExplanation)}
        </AppText>
      </DetailCard>

      <Pressable
        accessibilityLabel="شرح أبسط"
        accessibilityRole="button"
        onPress={() => setShowSimpler((current) => !current)}
        style={({ pressed }) => [styles.simplerCard, pressed && styles.pressed]}
      >
        <View style={styles.simplerHeader}>
          <Ionicons color={colors.text.tertiary} name={showSimpler ? 'chevron-up-outline' : 'chevron-down-outline'} size={17} />
          <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
          <AppText style={styles.detailTitle} variant="cardTitle">شرح أبسط</AppText>
        </View>
        {showSimpler ? (
          <View style={styles.simplerBody}>
            <AppText style={styles.rtlText} tone="secondary" variant="caption">
              الخلاصة في جملة واحدة
            </AppText>
            <AppText style={styles.rtlText} variant="body">{directionSafeText(term.simplerSummary)}</AppText>
          </View>
        ) : null}
      </Pressable>

      <DetailCard icon="flag-outline" title="لماذا يهم مؤسس الشركة؟">
        <AppText style={styles.rtlText} tone="secondary" variant="body">
          {directionSafeText(term.founderImportance)}
        </AppText>
      </DetailCard>

      {term.formula ? (
        <DetailCard icon="calculator-outline" title="طريقة الحساب">
          <View style={styles.formulaBox}>
            <AppText style={styles.formulaText} variant="cardTitle">
              {directionSafeText(term.formula)}
            </AppText>
          </View>
          {term.formulaExplanation ? (
            <AppText style={styles.rtlText} tone="secondary" variant="supporting">
              {directionSafeText(term.formulaExplanation)}
            </AppText>
          ) : null}
        </DetailCard>
      ) : null}

      {term.example ? (
        <DetailCard icon="receipt-outline" title="مثال مبسط">
          <AppText style={styles.rtlText} variant="cardTitle">{term.example.title}</AppText>
          <AppText style={styles.rtlText} tone="secondary" variant="body">
            {directionSafeText(term.example.description)}
          </AppText>
          {term.example.result ? (
            <View style={styles.resultBadge}>
              <AppText style={styles.resultText} variant="cardTitle">
                {directionSafeText(term.example.result)}
              </AppText>
            </View>
          ) : null}
        </DetailCard>
      ) : null}

      {term.interpretation?.length ? (
        <DetailCard icon="analytics-outline" title="كيف تفسر النتيجة؟">
          {term.interpretation.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <AppText style={styles.bulletText} tone="secondary" variant="supporting">
                {directionSafeText(item)}
              </AppText>
            </View>
          ))}
        </DetailCard>
      ) : null}

      {term.commonMistake ? (
        <DetailCard icon="warning-outline" title="خطأ شائع" warning>
          <AppText style={styles.rtlText} variant="body">{directionSafeText(term.commonMistake)}</AppText>
        </DetailCard>
      ) : null}

      {relatedTerms.length ? (
        <DetailCard icon="git-branch-outline" title="مصطلحات مرتبطة">
          <View style={styles.relatedList}>
            {relatedTerms.map((related) => (
              <Pressable
                accessibilityLabel={`فتح مصطلح ${related.titleAr}`}
                accessibilityRole="button"
                key={related.id}
                onPress={() => openRelatedTerm(related.id)}
                style={({ pressed }) => [styles.relatedChip, pressed && styles.pressed]}
              >
                <AppText style={styles.relatedTitle} variant="caption">{related.titleAr}</AppText>
                {related.acronym ? <LtrBadge small value={related.acronym} /> : null}
              </Pressable>
            ))}
          </View>
        </DetailCard>
      ) : null}

      {term.capitalDestination ? (
        <AppButton onPress={openCapitalDestination} variant="secondary">
          {term.capitalDestination.label}
        </AppButton>
      ) : null}
    </>
  );
}

function LtrBadge({ value, small }: { value: string; small?: boolean }) {
  return (
    <View style={[styles.ltrBadge, small && styles.ltrBadgeSmall]}>
      <AppText align="center" style={styles.ltrBadgeText} variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function DetailCard({ title, icon, warning, children }: React.PropsWithChildren<{ title: string; icon: keyof typeof Ionicons.glyphMap; warning?: boolean }>) {
  return (
    <SolidCard style={[styles.detailCard, warning && styles.warningCard]}>
      <View style={styles.detailHeader}>
        <View style={[styles.detailIcon, warning && styles.warningIcon]}>
          <Ionicons color={warning ? colors.semantic.warning : colors.brand.calmGreen} name={icon} size={18} />
        </View>
        <AppText style={styles.detailTitle} variant="cardTitle">{title}</AppText>
      </View>
      <View style={styles.detailBody}>{children}</View>
    </SolidCard>
  );
}

function InvalidTermState() {
  return (
    <SolidCard style={styles.invalidCard}>
      <Ionicons color={colors.text.tertiary} name="help-circle-outline" size={28} />
      <AppText align="center" variant="cardTitle">
        تعذر العثور على المصطلح
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        قد يكون الرابط غير صالح أو لم يعد هذا المصطلح متاحًا.
      </AppText>
      <AppButton onPress={() => router.replace(routes.financialTerms)} variant="secondary">
        العودة إلى المصطلحات المالية
      </AppButton>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.sm,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  heroCard: {
    gap: spacing.md,
  },
  heroTop: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroCopy: {
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  englishName: {
    writingDirection: 'ltr',
  },
  ltrBadge: {
    backgroundColor: 'rgba(167,200,161,0.1)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  ltrBadgeSmall: {
    paddingHorizontal: spacing.xs,
  },
  ltrBadgeText: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  detailCard: {
    gap: spacing.md,
  },
  detailBody: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.md,
    width: '100%',
  },
  warningCard: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
  },
  detailHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  warningIcon: {
    backgroundColor: 'rgba(232,163,61,0.16)',
  },
  detailTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  simplerCard: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  simplerHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  simplerBody: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    gap: spacing.xs,
    width: '100%',
  },
  formulaBox: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderColor: colors.surface.separator,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    padding: spacing.md,
    width: '100%',
  },
  formulaText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  resultBadge: {
    alignSelf: 'flex-end',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  resultText: {
    color: colors.brand.calmGreen,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  bulletRow: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  bulletDot: {
    backgroundColor: colors.brand.calmGreen,
    borderRadius: radii.pill,
    height: 6,
    marginTop: 8,
    width: 6,
  },
  bulletText: {
    alignSelf: 'stretch',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  relatedList: {
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relatedChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  relatedTitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  invalidCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
