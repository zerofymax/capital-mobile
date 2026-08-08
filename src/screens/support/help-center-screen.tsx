import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FaqAccordionCard, SupportSectionHeading } from '@/components/support';
import { AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { faqItems, type FaqItem } from './faq-data';
import { helpTopics, type HelpTopic } from './support-data';

type HelpCenterAction = {
  id: 'live-chat' | 'contact' | 'requests';
  title: string;
  subtitle?: string;
  badge?: string;
  keywords: string[];
};

const supportActions: HelpCenterAction[] = [
  {
    id: 'live-chat',
    title: 'الدردشة المباشرة مع الدعم',
    badge: 'تجريبي',
    keywords: ['دردشة', 'مباشرة', 'دعم', 'محادثة'],
  },
  {
    id: 'contact',
    title: 'التواصل مع الدعم',
    keywords: ['تواصل', 'دعم', 'مراسلة', 'مشكلة'],
  },
  {
    id: 'requests',
    title: 'طلبات الدعم الحالية',
    subtitle: 'طلبان مفتوحان',
    keywords: ['طلبات', 'دعم', 'حالية', 'مفتوحة'],
  },
];

export function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const searchTerm = query.trim();
  const searching = searchTerm.length > 0;

  const visibleTopics = useMemo(
    () =>
      helpTopics.filter((topic) =>
        matchesSearch(searchTerm, [
          topic.title,
          topic.description,
          ...topic.keywords,
          ...topic.faqs.flatMap((item) => [item.question, item.answer]),
        ]),
      ),
    [searchTerm],
  );
  const visibleActions = useMemo(
    () => supportActions.filter((action) => matchesSearch(searchTerm, [action.title, action.subtitle, action.badge, ...action.keywords])),
    [searchTerm],
  );
  const visibleFaqs = useMemo(() => {
    if (!searching) {
      return faqItems.slice(0, 5);
    }

    return faqItems.filter((item) => matchesSearch(searchTerm, [item.question, item.answer]));
  }, [searchTerm, searching]);
  const hasResults = visibleTopics.length > 0 || visibleActions.length > 0 || visibleFaqs.length > 0;

  function handleTopicPress(topic: HelpTopic) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.helpTopic, params: { topicId: topic.id } });
  }

  function handleFaqPress(item: FaqItem) {
    Haptics.selectionAsync().catch(() => null);
    router.push({ pathname: routes.faqDetail, params: { id: item.id } });
  }

  function handleActionPress(action: HelpCenterAction) {
    Haptics.selectionAsync().catch(() => null);

    if (action.id === 'contact') {
      router.push(routes.contactSupport);
      return;
    }

    if (action.id === 'live-chat') {
      router.push(routes.liveSupport);
      return;
    }

    router.push(routes.supportRequests);
  }

  return (
    <View style={styles.root}>
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
          <HelpHeader />

          <View style={styles.searchCard}>
            <Ionicons color={colors.text.tertiary} name="search-outline" size={18} />
            <TextInput
              accessibilityLabel="ابحث في مركز المساعدة"
              onChangeText={(value) => {
                setQuery(value);
                setNotice(null);
              }}
              placeholder="ابحث عن سؤالك"
              placeholderTextColor={colors.text.tertiary}
              style={styles.searchInput}
              value={query}
            />
          </View>

          {notice ? (
            <View accessibilityLiveRegion="polite" style={styles.notice}>
              <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={17} />
              <AppText style={styles.noticeText} tone="warning" variant="supporting">
                {notice}
              </AppText>
            </View>
          ) : null}

          {hasResults ? (
            <>
              {visibleTopics.length > 0 ? (
                <View style={styles.section}>
                  <SupportSectionHeading>موضوعات المساعدة</SupportSectionHeading>
                  <View style={styles.topicGrid}>
                    {visibleTopics.map((topic) => (
                      <TopicCard key={topic.id} onPress={handleTopicPress} topic={topic} />
                    ))}
                  </View>
                </View>
              ) : null}

              {visibleFaqs.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <AppText style={styles.sectionRowTitle} variant="sectionTitle">الأسئلة الشائعة</AppText>
                    <Pressable
                      accessibilityLabel="عرض جميع الأسئلة"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => router.push(routes.faq)}
                      style={({ pressed }) => [styles.viewAllButton, pressed && styles.pressed]}
                    >
                      <AppText tone="success" variant="caption">
                        عرض جميع الأسئلة
                      </AppText>
                    </Pressable>
                  </View>
                  <View style={styles.faqList}>
                    {visibleFaqs.map((item) => (
                      <FaqAccordionCard item={item} key={item.id} onPress={handleFaqPress} />
                    ))}
                  </View>
                </View>
              ) : null}

              {visibleActions.length > 0 ? (
                <View style={styles.section}>
                  <SolidCard style={styles.actionsCard}>
                    {visibleActions.map((action, index) => (
                      <View key={action.id} style={styles.actionBlock}>
                        <SupportActionRow action={action} onPress={handleActionPress} />
                        {index < visibleActions.length - 1 ? <Divider /> : null}
                      </View>
                    ))}
                  </SolidCard>
                </View>
              ) : null}
            </>
          ) : (
            <EmptySearchState />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HelpHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={19} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        مركز المساعدة
      </AppText>
    </View>
  );
}

function TopicCard({ topic, onPress }: { topic: HelpTopic; onPress: (topic: HelpTopic) => void }) {
  return (
    <Pressable
      accessibilityLabel={topic.title}
      accessibilityRole="button"
      onPress={() => onPress(topic)}
      style={({ pressed }) => [styles.topicCard, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.muted} name={topic.icon} size={18} />
      <View style={styles.topicCopy}>
        <AppText style={styles.topicText} variant="body">
          {topic.title}
        </AppText>
        <AppText numberOfLines={2} style={styles.topicDescription} tone="secondary" variant="caption">
          {topic.description}
        </AppText>
      </View>
    </Pressable>
  );
}

function SupportActionRow({ action, onPress }: { action: HelpCenterAction; onPress: (action: HelpCenterAction) => void }) {
  return (
    <Pressable
      accessibilityLabel={action.title}
      accessibilityRole="button"
      onPress={() => onPress(action)}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      <View style={styles.actionCopy}>
        <View style={styles.actionTitleRow}>
          <AppText style={styles.actionTitle} variant="body">
            {action.title}
          </AppText>
          {action.badge ? (
            <View style={styles.badge}>
              <AppText align="center" style={styles.badgeText} tone="success" variant="caption">
                {action.badge}
              </AppText>
            </View>
          ) : null}
        </View>
        {action.subtitle ? (
          <AppText style={styles.actionSubtitle} tone="secondary" variant="caption">
            {action.subtitle}
          </AppText>
        ) : null}
      </View>
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
        لم نجد نتائج مطابقة
      </AppText>
      <AppText align="center" tone="secondary" variant="supporting">
        جرّب كلمات مختلفة
      </AppText>
    </SolidCard>
  );
}

function matchesSearch(query: string, values: (string | undefined)[]) {
  if (!query) {
    return true;
  }

  const lowerQuery = query.toLowerCase();

  return values.some((value) => value?.toLowerCase().includes(lowerQuery));
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000000',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: 17,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 40,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  searchCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 13,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.md,
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
  notice: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.button,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  section: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  topicGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topicCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 96,
    minWidth: 145,
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  topicCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.xs,
    minWidth: 0,
    width: '100%',
  },
  topicText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  topicDescription: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sectionTitleRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  sectionRowTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  viewAllButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  faqList: {
    gap: spacing.sm,
  },
  actionsCard: {
    borderRadius: 14,
    gap: 0,
    padding: 0,
  },
  actionBlock: {
    gap: 0,
  },
  actionRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  actionTitleRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  actionTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actionSubtitle: {
    alignSelf: 'stretch',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  badge: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.32)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 16,
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
