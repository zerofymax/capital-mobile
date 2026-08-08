import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SupportSectionHeading } from '@/components/support';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getFaqItem } from './faq-data';

type FeedbackValue = 'helpful' | 'not-helpful';

const relatedArticles = [
  { id: 'data-consent', title: 'إدارة البيانات والموافقات' },
  { id: 'data-export', title: 'طلب نسخة من بياناتي' },
] as const;

export function FaqDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const faq = useMemo(() => getFaqItem(id), [id]);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.faq);
  }

  function handleRelatedPress(title: string) {
    Haptics.selectionAsync().catch(() => null);
    setNotice(`${title} ستتوفر لاحقًا ضمن النموذج الأولي.`);
  }

  function handleFeedbackPress(value: FeedbackValue) {
    Haptics.selectionAsync().catch(() => null);
    setFeedback(value);
    setNotice('شكرًا لملاحظتك');
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
          showsVerticalScrollIndicator={false}
        >
          <FaqDetailHeader onBackPress={handleBackPress} />

          {faq ? (
            <>
              <View style={styles.questionWrap}>
                <AppText accessibilityRole="header" style={styles.question} variant="screenTitle">
                  {faq.question}
                </AppText>
              </View>

              <SolidCard style={styles.answerCard}>
                <AppText style={styles.answerText} tone="secondary" variant="body">
                  {faq.answer}
                </AppText>
              </SolidCard>

              <View style={styles.section}>
                <SupportSectionHeading>مقالات ذات صلة</SupportSectionHeading>
                <SolidCard style={styles.relatedCard}>
                  {relatedArticles.map((article, index) => (
                    <RelatedArticleRow
                      divider={index < relatedArticles.length - 1}
                      key={article.id}
                      onPress={() => handleRelatedPress(article.title)}
                      title={article.title}
                    />
                  ))}
                </SolidCard>
              </View>

              <SolidCard style={styles.feedbackCard}>
                <View style={styles.feedbackPromptWrap}>
                  <AppText style={styles.feedbackPrompt} variant="body">
                    هل كانت هذه الإجابة مفيدة؟
                  </AppText>
                </View>
                <View style={styles.feedbackActions}>
                  <FeedbackButton
                    label="غير مفيدة"
                    onPress={() => handleFeedbackPress('not-helpful')}
                    selected={feedback === 'not-helpful'}
                  />
                  <FeedbackButton
                    label="نعم مفيدة"
                    onPress={() => handleFeedbackPress('helpful')}
                    selected={feedback === 'helpful'}
                  />
                </View>
              </SolidCard>

              {notice ? (
                <SolidCard style={styles.noticeCard}>
                  <AppText align="center" tone="success" variant="supporting">
                    {notice}
                  </AppText>
                </SolidCard>
              ) : null}

              <AppButton onPress={() => router.push(routes.contactSupport)} variant="secondary">
                التواصل مع الدعم
              </AppButton>
            </>
          ) : (
            <SolidCard style={styles.notFoundCard}>
              <View style={styles.notFoundIcon}>
                <Ionicons color={colors.text.tertiary} name="help-circle-outline" size={28} />
              </View>
              <AppText align="center" variant="cardTitle">
                تعذر العثور على السؤال
              </AppText>
              <AppButton onPress={() => router.replace(routes.faq)} variant="secondary">
                العودة إلى الأسئلة الشائعة
              </AppButton>
            </SolidCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FaqDetailHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأسئلة الشائعة"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        سؤال شائع
      </AppText>
    </View>
  );
}

function RelatedArticleRow({
  title,
  divider,
  onPress,
}: {
  title: string;
  divider: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.relatedRow, divider && styles.relatedDivider, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
      <AppText style={styles.relatedTitle} variant="body">
        {title}
      </AppText>
    </Pressable>
  );
}

function FeedbackButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.feedbackButton,
        selected ? styles.feedbackSelected : styles.feedbackUnselected,
        pressed && styles.pressed,
      ]}
    >
      <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
        {label}
      </AppText>
    </Pressable>
  );
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
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
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
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  questionWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  question: {
    alignSelf: 'stretch',
    lineHeight: 34,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  answerCard: {
    alignItems: 'flex-end',
    direction: 'ltr',
    padding: spacing.xl,
  },
  answerText: {
    alignSelf: 'stretch',
    lineHeight: 27,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  section: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  relatedCard: {
    padding: 0,
  },
  relatedRow: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  relatedDivider: {
    borderBottomColor: colors.surface.border,
    borderBottomWidth: 1,
  },
  relatedTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  feedbackCard: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  feedbackPromptWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  feedbackPrompt: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  feedbackActions: {
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedbackButton: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  feedbackSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.48)',
  },
  feedbackUnselected: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
  },
  noticeCard: {
    backgroundColor: colors.semantic.successTint,
    paddingVertical: spacing.md,
  },
  notFoundCard: {
    alignItems: 'center',
    gap: spacing.lg,
    justifyContent: 'center',
    minHeight: 340,
  },
  notFoundIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.99 }],
  },
});
