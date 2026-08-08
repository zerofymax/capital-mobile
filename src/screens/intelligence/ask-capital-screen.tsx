import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import { useGoalsStore } from '@/screens/goals/goals-store';
import { useInvoicesStore } from '@/screens/invoices/invoices-store';
import { getCurrencySymbol, useTransactionsStore } from '@/screens/ledger/ledger-data';
import { useRecurringExpensesStore } from '@/screens/recurring-expenses/recurring-expenses-store';
import { useCategoriesStore } from '@/state/categories-state';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { LtrText, NumericText } from '@/utils/rtl';
import {
  answerAskCapitalQuestion,
  askCapitalSuggestedQuestions,
  type AskCapitalAnswer,
} from './ask-capital-local';

type ConversationQuestion = {
  id: number;
  text: string;
};

export function AskCapitalScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const nextMessageId = useRef(1);
  const submittingRef = useRef(false);
  const { transactions } = useTransactionsStore();
  const { categories } = useCategoriesStore();
  const { invoices } = useInvoicesStore();
  const { expenses: recurringExpenses } = useRecurringExpensesStore();
  const { goals } = useGoalsStore();
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<ConversationQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const contentBottomPadding =
    Platform.OS === 'android'
      ? Math.max(
          insets.bottom + spacing.xxxl,
          spacing.screenBottom + spacing.lg,
        )
      : insets.bottom + spacing.xxl;

  function submitQuestion(value: string) {
    const normalizedQuestion = value.trim();

    if (!normalizedQuestion || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setQuestions((current) => [
      ...current,
      { id: nextMessageId.current++, text: normalizedQuestion },
    ]);
    setQuestion('');

    requestAnimationFrame(() => {
      submittingRef.current = false;
      setSubmitting(false);
    });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardRoot}
      >
        <Header />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: contentBottomPadding },
          ]}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.localBadge}>
            <Ionicons color={colors.brand.calmGreen} name="phone-portrait-outline" size={16} />
            <AppText style={styles.localBadgeText} variant="caption">
              تحليل محلي تجريبي
            </AppText>
          </View>

          <View style={styles.rightAlignedBlock}>
            <AppText style={styles.rtlText} tone="secondary" variant="body">
              اسأل عن بياناتك المسجلة داخل <LtrText style={styles.inlineLtr}>Capital</LtrText> واحصل على إجابات محسوبة محليًا.
            </AppText>
          </View>

          <SolidCard style={styles.welcomeCard}>
            <View style={styles.capitalIcon}>
              <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
            </View>
            <View style={styles.welcomeCopy}>
              <AppText style={styles.rtlText} variant="cardTitle">مرحبًا</AppText>
              <AppText style={styles.rtlText} tone="secondary" variant="body">
                يمكنني مساعدتك في قراءة بيانات <LtrText style={styles.inlineLtr}>Capital</LtrText> المسجلة محليًا.
              </AppText>
            </View>
          </SolidCard>

          <View style={styles.section}>
            <View style={styles.rightAlignedBlock}>
              <AppText style={styles.sectionTitle} variant="sectionTitle">أسئلة مقترحة</AppText>
            </View>
            <View style={styles.suggestions}>
              {askCapitalSuggestedQuestions.map((suggestion) => (
                <Pressable
                  accessibilityLabel={suggestion}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: submitting }}
                  disabled={submitting}
                  key={suggestion}
                  onPress={() => submitQuestion(suggestion)}
                  style={({ pressed }) => [
                    styles.suggestion,
                    pressed && styles.pressed,
                    submitting && styles.disabled,
                  ]}
                >
                  <AppText style={styles.suggestionText} variant="supporting">
                    {suggestion}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          {questions.length ? (
            <View style={styles.conversation}>
              <AppText style={styles.sectionTitle} variant="sectionTitle">السجل المحلي</AppText>
              {questions.map((item) => {
                const answer = answerAskCapitalQuestion(item.text, {
                  categories,
                  goals,
                  invoices,
                  now: new Date(),
                  recurringExpenses,
                  transactions,
                });

                return <ConversationItem answer={answer} key={item.id} question={item.text} />;
              })}
            </View>
          ) : null}

          <View style={styles.inputSection}>
            <View style={styles.rightAlignedBlock}>
              <AppText style={styles.sectionTitle} variant="sectionTitle">اكتب سؤالك</AppText>
            </View>
            <TextInput
              accessibilityLabel="اكتب سؤالك"
              multiline
              onChangeText={setQuestion}
              placeholder="مثال: كم تبقى لي للتحصيل؟"
              placeholderTextColor={colors.text.tertiary}
              style={styles.input}
              textAlign="right"
              value={question}
            />
            <Pressable
              accessibilityLabel="إرسال السؤال"
              accessibilityRole="button"
              accessibilityState={{ disabled: !question.trim() || submitting }}
              disabled={!question.trim() || submitting}
              onPress={() => submitQuestion(question)}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.pressed,
                (!question.trim() || submitting) && styles.sendButtonDisabled,
              ]}
            >
              <AppText align="center" style={styles.sendButtonText} variant="body">
                إرسال
              </AppText>
            </Pressable>
          </View>

          <View style={styles.privacyNote}>
            <Ionicons color={colors.text.tertiary} name="shield-checkmark-outline" size={16} />
            <AppText style={styles.privacyText} tone="secondary" variant="caption">
              تُحلل الأسئلة محليًا على جهازك، ولا تُرسل بياناتك إلى خادم خارجي.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Feather color={colors.text.muted} name="chevron-left" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="right" style={styles.headerTitle} variant="screenTitle">
          اسأل <LtrText style={styles.inlineLtr}>Capital</LtrText>
        </AppText>
        <AppText align="right" style={styles.headerSubtitle} tone="secondary" variant="supporting">
          اسأل عن أرقام نشاطك المسجلة.
        </AppText>
      </View>
    </View>
  );
}

function ConversationItem({
  answer,
  question,
}: {
  answer: AskCapitalAnswer;
  question: string;
}) {
  const warning = answer.status !== 'answered';

  return (
    <View style={styles.messageGroup}>
      <View style={styles.questionBubble}>
        <AppText style={styles.questionText} variant="body">{question}</AppText>
      </View>
      <SolidCard style={[styles.answerCard, warning && styles.warningCard]}>
        <View style={styles.answerHeader}>
          <View style={[styles.answerIcon, warning && styles.warningIcon]}>
            <Ionicons
              color={warning ? colors.semantic.warning : colors.brand.calmGreen}
              name={warning ? 'information-circle-outline' : 'sparkles-outline'}
              size={17}
            />
          </View>
          <AppText style={styles.answerTitle} variant="cardTitle">
            {answer.title}
          </AppText>
        </View>
        {answer.value ? (
          <NumericText style={styles.answerValue}>{answer.value}</NumericText>
        ) : null}
        <AnswerDescription text={answer.description} />
        {answer.source ? (
          <AppText style={styles.sourceText} tone="secondary" variant="caption">
            {answer.source}
          </AppText>
        ) : null}
      </SolidCard>
    </View>
  );
}

function AnswerDescription({ text }: { text: string }) {
  const currency = getCurrencySymbol();
  const moneyPattern = new RegExp(
    `([+-]?\\d[\\d,]*(?:\\.\\d+)?\\s+${escapeRegExp(currency)})`,
    'g',
  );
  const exactMoneyPattern = new RegExp(
    `^[+-]?\\d[\\d,]*(?:\\.\\d+)?\\s+${escapeRegExp(currency)}$`,
  );

  return (
    <AppText style={styles.answerDescription} tone="secondary" variant="body">
      {text.split(moneyPattern).map((part, index) =>
        exactMoneyPattern.test(part) ? (
          <LtrText key={`${part}-${index}`} style={styles.inlineMoney}>
            {part}
          </LtrText>
        ) : (
          part
        ),
      )}
    </AppText>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
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
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerTitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  localBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  localBadgeText: {
    color: colors.brand.calmGreen,
  },
  welcomeCard: {
    alignItems: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
  },
  capitalIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  welcomeCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  rightAlignedBlock: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  suggestions: {
    direction: 'rtl',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestion: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: {
    flexShrink: 1,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  conversation: {
    alignItems: 'stretch',
    gap: spacing.md,
    width: '100%',
  },
  messageGroup: {
    alignItems: 'stretch',
    direction: 'ltr',
    gap: spacing.sm,
    width: '100%',
  },
  questionBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(79,138,91,0.20)',
    borderColor: 'rgba(79,138,91,0.34)',
    borderRadius: radii.input,
    borderWidth: 1,
    maxWidth: '88%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  questionText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  answerCard: {
    gap: spacing.sm,
  },
  warningCard: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
  },
  answerHeader: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  answerIcon: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderRadius: radii.control,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  warningIcon: {
    backgroundColor: colors.semantic.warningTint,
  },
  answerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  answerValue: {
    alignSelf: 'stretch',
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'ltr',
  },
  answerDescription: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  sourceText: {
    alignSelf: 'stretch',
    borderTopColor: colors.surface.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  inlineMoney: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  inputSection: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlign: 'right',
    textAlignVertical: 'top',
    writingDirection: 'rtl',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.green,
    borderRadius: radii.button,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  privacyNote: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  privacyText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  inlineLtr: {
    textAlign: 'right',
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
