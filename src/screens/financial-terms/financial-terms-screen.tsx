import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CapitalGlassIconButton } from '@/components/navigation/capital-glass-icon-button';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { useThemeColors } from '@/state/appearance-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';
import {
  financialTermCategories,
  getFinancialTermCategoryLabel,
  searchFinancialTerms,
} from './financial-terms-data';
import type { FinancialTerm, FinancialTermCategoryFilter } from './financial-terms-types';

export function FinancialTermsScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FinancialTermCategoryFilter>('all');
  const terms = useMemo(() => searchFinancialTerms(query, category), [category, query]);
  const resultLabel = formatTermsCount(terms.length);

  function openTerm(termId: string) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.financialTermDetails, params: { termId } });
  }

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
          subtitle="شرح مبسط للمفاهيم التي تحتاجها لإدارة شركتك وفهم أرقامها."
          title="المصطلحات المالية"
        />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 32, spacing.screenBottom) }]}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <View style={styles.searchBox}>
          <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
          <TextInput
            accessibilityLabel="ابحث عن مصطلح"
            onChangeText={setQuery}
            placeholder="ابحث عن مصطلح"
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          style={styles.categoryScroll}
        >
          {financialTermCategories.map((item) => {
            const selected = item.id === category;

            return (
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.id}
                onPress={() => setCategory(item.id)}
                style={({ pressed }) => [styles.categoryChip, selected && styles.categoryChipActive, pressed && styles.pressed]}
              >
                <AppText align="center" style={selected && styles.categoryChipTextActive} variant="caption">
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultHeader}>
          <AppText tone="secondary" variant="supporting">
            {resultLabel}
          </AppText>
          <AppText variant="sectionTitle">{getFinancialTermCategoryLabel(category)}</AppText>
        </View>

        {terms.length === 0 ? <EmptyTermsState onClear={() => setQuery('')} /> : null}

        <View style={styles.termList}>
          {terms.map((term) => (
            <FinancialTermCard key={term.id} onPress={() => openTerm(term.id)} term={term} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function FinancialTermsHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <CapitalGlassIconButton
        accessibilityLabel="رجوع"
        hitSlop={8}
        iconColor={colors.text.muted}
        iconName="chevron-forward-outline"
        iconSize={21}
        onPress={onBack}
        pressedStyle={styles.pressed}
        radius={radii.control}
        style={styles.backButton}
      />
      <View style={styles.headerCopy}>
        <AppText align="center" style={styles.headerTitle} variant="screenTitle">
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" tone="secondary" variant="supporting">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.headerSlot} />
    </View>
  );
}

function FinancialTermCard({ term, onPress }: { term: FinancialTerm; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`فتح مصطلح ${term.titleAr}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.termCard, pressed && styles.pressed]}
    >
      <View style={styles.termIcon}>
        <Ionicons color={colors.brand.calmGreen} name={term.icon} size={19} />
      </View>
      <View style={styles.termCopy}>
        <View style={styles.termTitleRow}>
          {term.acronym ? (
            <View style={styles.acronymBadge}>
              <AppText align="center" style={styles.acronymText} variant="caption">
                {term.acronym}
              </AppText>
            </View>
          ) : null}
          <AppText numberOfLines={1} variant="cardTitle">
            {term.titleAr}
          </AppText>
        </View>
        <AppText tone="secondary" variant="caption">
          {getFinancialTermCategoryLabel(term.category)}
        </AppText>
        <AppText numberOfLines={2} tone="secondary" variant="supporting">
          {directionSafeText(term.shortDefinition)}
        </AppText>
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={17} />
    </Pressable>
  );
}

function EmptyTermsState({ onClear }: { onClear: () => void }) {
  return (
    <SolidCard style={styles.emptyCard}>
      <Ionicons color={colors.text.tertiary} name="search-outline" size={26} />
      <AppText align="center" variant="cardTitle">
        لم نعثر على المصطلح
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        جرّب البحث باسم آخر أو اختر قسمًا مختلفًا.
      </AppText>
      <AppButton onPress={onClear} variant="secondary">
        مسح البحث
      </AppButton>
    </SolidCard>
  );
}

function formatTermsCount(count: number) {
  if (count === 1) {
    return 'مصطلح واحد';
  }

  if (count === 2) {
    return 'مصطلحان';
  }

  if (count >= 3 && count <= 10) {
    return `${count.toLocaleString('en-US')} مصطلحات`;
  }

  return `${count.toLocaleString('en-US')} مصطلحًا`;
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
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 25,
  },
  headerSlot: {
    width: 38,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 15,
    minHeight: 46,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  categoryScroll: {
    marginHorizontal: -spacing.xs,
  },
  categoryList: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  categoryChipActive: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  categoryChipTextActive: {
    color: colors.brand.lightNeutral,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termList: {
    gap: spacing.md,
  },
  termCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 108,
    padding: spacing.md,
  },
  termIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  termCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  termTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  acronymBadge: {
    backgroundColor: 'rgba(167,200,161,0.1)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  acronymText: {
    color: colors.brand.calmGreen,
    writingDirection: 'ltr',
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
