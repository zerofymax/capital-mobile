import { Ionicons } from '@expo/vector-icons';
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
            { paddingBottom: insets.bottom + 24 },
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

          <AppText tone="secondary" variant="body">
            اسأل عن بياناتك المسجلة داخل Capital واحصل على إجابات محسوبة محليًا.
          </AppText>

          <SolidCard style={styles.welcomeCard}>
            <View style={styles.capitalIcon}>
              <Ionicons color={colors.brand.calmGreen} name="sparkles-outline" size={18} />
            </View>
            <View style={styles.welcomeCopy}>
              <AppText variant="cardTitle">مرحبًا</AppText>
              <AppText tone="secondary" variant="body">
                يمكنني مساعدتك في قراءة بيانات Capital المسجلة محليًا.
              </AppText>
            </View>
          </SolidCard>

          <View style={styles.section}>
            <AppText variant="sectionTitle">أسئلة مقترحة</AppText>
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
              <AppText variant="sectionTitle">السجل المحلي</AppText>
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
            <AppText variant="sectionTitle">اكتب سؤالك</AppText>
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
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          اسأل Capital
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          اسأل عن أرقام نشاطك المسجلة.
        </AppText>
      </View>
      <View style={styles.headerSlot} />
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
        <AppText variant="body">{question}</AppText>
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
    <AppText tone="secondary" variant="body">
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
    flexDirection: 'row-reverse',
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
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 42,
    width: 42,
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
    flexDirection: 'row-reverse',
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
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  section: {
    gap: spacing.md,
  },
  suggestions: {
    flexDirection: 'row-reverse',
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
  },
  conversation: {
    gap: spacing.md,
  },
  messageGroup: {
    gap: spacing.sm,
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
  answerCard: {
    gap: spacing.sm,
  },
  warningCard: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.28)',
  },
  answerHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
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
  },
  answerValue: {
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'left',
  },
  sourceText: {
    borderTopColor: colors.surface.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
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
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
