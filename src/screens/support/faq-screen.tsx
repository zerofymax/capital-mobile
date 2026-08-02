import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FaqAccordionCard } from '@/components/support';
import { AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  defaultFaqCategory,
  faqCategories,
  faqItems,
  type FaqCategory,
  type FaqCategoryOption,
  type FaqItem,
} from './faq-data';

export function FaqScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>(defaultFaqCategory);
  const searchTerm = query.trim();

  const visibleItems = useMemo(() => {
    if (searchTerm) {
      return faqItems.filter((item) => matchesSearch(searchTerm, [item.question, item.answer]));
    }

    return faqItems.filter((item) => item.category === selectedCategory);
  }, [searchTerm, selectedCategory]);

  function handleCategoryPress(category: FaqCategory) {
    setSelectedCategory(category);
    setQuery('');
  }

  function handleFaqPress(item: FaqItem) {
    router.push({ pathname: routes.faqDetail, params: { id: item.id } });
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
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FaqHeader />

          <View style={styles.searchCard}>
            <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
            <TextInput
              accessibilityLabel="ابحث في الأسئلة الشائعة"
              onChangeText={setQuery}
              placeholder="ابحث في الأسئلة الشائعة"
              placeholderTextColor={colors.text.tertiary}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.chips}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {faqCategories.map((category) => (
              <CategoryChip
                category={category}
                key={category.id}
                onPress={handleCategoryPress}
                selected={selectedCategory === category.id}
              />
            ))}
          </ScrollView>

          {visibleItems.length > 0 ? (
            <View style={styles.faqList}>
              {visibleItems.map((item) => (
                <FaqAccordionCard item={item} key={item.id} onPress={handleFaqPress} />
              ))}
            </View>
          ) : (
            <EmptySearchState />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FaqHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الأسئلة الشائعة
      </AppText>
      <View style={styles.headerSlot} />
    </View>
  );
}

function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: FaqCategoryOption;
  selected: boolean;
  onPress: (id: FaqCategory) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={category.label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(category.id)}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" numberOfLines={1} tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {category.label}
      </AppText>
    </Pressable>
  );
}

function EmptySearchState() {
  return (
    <SolidCard style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.text.tertiary} name="search-outline" size={24} />
      </View>
      <AppText align="center" variant="cardTitle">
        لا توجد نتائج
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        جرّب كلمات مختلفة
      </AppText>
    </SolidCard>
  );
}

function matchesSearch(query: string, values: string[]) {
  const lowerQuery = query.toLowerCase();

  return values.some((value) => value.toLowerCase().includes(lowerQuery));
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    flex: 1,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  searchCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 42,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chips: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  selectedChip: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.46)',
  },
  unselectedChip: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
  },
  faqList: {
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 260,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
