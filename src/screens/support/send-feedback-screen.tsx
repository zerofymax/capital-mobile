import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '@/components/forms';
import { FeedbackOptionChip, SupportModalHeader, SupportSectionHeading } from '@/components/support';
import { AppButton, AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  feedbackTypes,
  ratingOptions,
  supportMessages,
  type FeedbackType,
} from './support-data';

export function SendFeedbackScreen() {
  const insets = useSafeAreaInsets();
  const [feedbackType, setFeedbackType] = useState<FeedbackType | ''>('');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const feedbackTypeError = notice === supportMessages.feedbackTypeRequired ? notice : undefined;
  const ratingError = notice === supportMessages.ratingRequired ? notice : undefined;
  const noteError = notice === supportMessages.noteRequired ? notice : undefined;
  const success = notice === supportMessages.feedbackSent;

  function handleSubmit() {
    if (!feedbackType) {
      setNotice(supportMessages.feedbackTypeRequired);
      return;
    }

    if (!rating) {
      setNotice(supportMessages.ratingRequired);
      return;
    }

    if (!note.trim()) {
      setNotice(supportMessages.noteRequired);
      return;
    }

    setNotice(supportMessages.feedbackSent);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
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
          <SupportModalHeader title="إرسال ملاحظات" />
          <View style={styles.intro}>
            <AppText style={styles.introText} tone="secondary" variant="body">
              ساعدنا نحسن تجربة Capital
            </AppText>
          </View>

          <View style={styles.section}>
            <SupportSectionHeading>نوع الملاحظة</SupportSectionHeading>
            <View style={styles.chipGrid}>
              {feedbackTypes.map((item) => (
                <FeedbackOptionChip
                  id={item.id}
                  key={item.id}
                  label={item.label}
                  onPress={(value) => {
                    setFeedbackType(value);
                    setNotice(null);
                  }}
                  selected={item.id === feedbackType}
                />
              ))}
            </View>
            {feedbackTypeError ? (
              <AppText style={styles.errorText} tone="danger" variant="caption">
                {feedbackTypeError}
              </AppText>
            ) : null}
          </View>

          <View style={styles.section}>
            <SupportSectionHeading>التقييم</SupportSectionHeading>
            <View style={styles.ratingRow}>
              {ratingOptions.map((item) => (
                <FeedbackOptionChip
                  id={item}
                  key={item}
                  label={item}
                  onPress={(value) => {
                    setRating(value);
                    setNotice(null);
                  }}
                  selected={item === rating}
                />
              ))}
            </View>
            {ratingError ? (
              <AppText style={styles.errorText} tone="danger" variant="caption">
                {ratingError}
              </AppText>
            ) : null}
          </View>

          <FormField
            error={noteError}
            errorStyle={styles.errorText}
            label="ملاحظتك"
            labelStyle={styles.fieldLabel}
            multiline
            onChangeText={(value) => {
              setNote(value);
              setNotice(null);
            }}
            placeholder="اكتب ملاحظتك هنا"
            style={styles.textArea}
            textAlignVertical="top"
            value={note}
          />

          {notice && !feedbackTypeError && !ratingError && !noteError ? (
            <SolidCard style={[styles.notice, success ? styles.successNotice : styles.warningNotice]}>
              <Ionicons
                color={success ? colors.semantic.success : colors.semantic.warning}
                name={success ? 'checkmark-circle-outline' : 'information-circle-outline'}
                size={18}
              />
              <AppText style={styles.noticeText} tone={success ? 'success' : 'warning'} variant="supporting">
                {notice}
              </AppText>
            </SolidCard>
          ) : null}

          <AppButton iconName="send-outline" onPress={handleSubmit} style={styles.submitButton}>
            إرسال الملاحظة
          </AppButton>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  intro: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    marginTop: -spacing.sm,
    width: '100%',
  },
  introText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  section: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  chipGrid: {
    alignSelf: 'stretch',
    direction: 'rtl',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ratingRow: {
    alignSelf: 'stretch',
    direction: 'rtl',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fieldLabel: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  errorText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  textArea: {
    minHeight: 118,
    paddingVertical: spacing.md,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  notice: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  successNotice: {
    backgroundColor: colors.semantic.successTint,
  },
  warningNotice: {
    backgroundColor: colors.semantic.warningTint,
  },
  noticeText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  submitButton: {
    direction: 'ltr',
  },
});
