import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SupportChatMessage = {
  id: string;
  sender: 'support' | 'user' | 'system';
  text: string;
  time: string;
};

type QuickTopic = {
  id: 'transaction' | 'subscription' | 'security' | 'general';
  label: string;
  response: string;
};

const initialMessages: SupportChatMessage[] = [
  {
    id: 'support-welcome',
    sender: 'support',
    text: 'مرحبًا بك في دعم Capital',
    time: 'الآن',
  },
  {
    id: 'support-question',
    sender: 'support',
    text: 'كيف يمكننا مساعدتك اليوم؟',
    time: 'الآن',
  },
  {
    id: 'system-guidance',
    sender: 'system',
    text: 'للحصول على مساعدة أسرع، اختر موضوعًا أو اكتب رسالتك مباشرة.',
    time: 'الآن',
  },
];

const quickTopics: QuickTopic[] = [
  {
    id: 'transaction',
    label: 'مشكلة في معاملة',
    response: 'شكرًا لك. اذكر اسم المعاملة وتاريخها والمشكلة التي تواجهها.',
  },
  {
    id: 'subscription',
    label: 'مشكلة في الاشتراك',
    response: 'شكرًا لك. وضّح اسم الخطة أو الاشتراك والمشكلة التي ظهرت لك.',
  },
  {
    id: 'security',
    label: 'مشكلة أمان',
    response: 'سنساعدك فورًا. لا ترسل كلمة المرور أو رمز PIN داخل المحادثة.',
  },
  {
    id: 'general',
    label: 'سؤال عام',
    response: 'اكتب سؤالك وسنراجع التفاصيل معك.',
  },
];

const fallbackSupportResponse =
  'تم حفظ رسالتك داخل النسخة التجريبية. سيتم تفعيل الإرسال إلى فريق الدعم في إصدار لاحق.';

export function LiveSupportScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<SupportChatMessage>>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [messages, setMessages] = useState<SupportChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();
  const sendDisabled = trimmedDraft.length === 0;

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToLatest();
  }, [messages.length, scrollToLatest]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.helpCenter);
  }

  function createMessage(sender: SupportChatMessage['sender'], text: string): SupportChatMessage {
    return {
      id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender,
      text,
      time: 'الآن',
    };
  }

  function queueSupportResponse(text: string) {
    const timer = setTimeout(() => {
      setMessages((current) => [...current, createMessage('support', text)]);
    }, 700);

    timersRef.current.push(timer);
  }

  function handleQuickTopicPress(topic: QuickTopic) {
    Haptics.selectionAsync().catch(() => null);
    setMessages((current) => [...current, createMessage('user', topic.label)]);
    queueSupportResponse(topic.response);
  }

  function handleSendPress() {
    if (sendDisabled) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setMessages((current) => [...current, createMessage('user', trimmedDraft)]);
    setDraft('');
    queueSupportResponse(fallbackSupportResponse);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.46, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View
          style={[
            styles.screen,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <LiveSupportHeader onBackPress={handleBackPress} />

          <FlatList
            contentContainerStyle={styles.messagesContent}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToLatest}
            ref={listRef}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
          />

          <QuickTopics onTopicPress={handleQuickTopicPress} />

          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="اكتب رسالتك"
              multiline
              onChangeText={setDraft}
              onSubmitEditing={handleSendPress}
              placeholder="اكتب رسالتك..."
              placeholderTextColor={colors.text.tertiary}
              returnKeyType="send"
              style={styles.input}
              textAlignVertical="center"
              value={draft}
            />
            <Pressable
              accessibilityLabel="إرسال الرسالة"
              accessibilityRole="button"
              accessibilityState={{ disabled: sendDisabled }}
              disabled={sendDisabled}
              hitSlop={8}
              onPress={handleSendPress}
              style={({ pressed }) => [
                styles.sendButton,
                sendDisabled && styles.sendButtonDisabled,
                pressed && !sendDisabled && styles.pressed,
              ]}
            >
              <Ionicons color={colors.text.primary} name="send-outline" size={20} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function renderMessage({ item }: ListRenderItemInfo<SupportChatMessage>) {
  if (item.sender === 'system') {
    return (
      <SolidCard accessibilityRole="text" style={styles.systemCard}>
        <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={17} />
        <AppText style={styles.systemText} tone="secondary" variant="supporting">
          {item.text}
        </AppText>
      </SolidCard>
    );
  }

  const support = item.sender === 'support';

  return (
    <View accessibilityRole="text" style={[styles.messageRow, support ? styles.supportRow : styles.userRow]}>
      {support ? <SupportAvatar small /> : null}
      <View style={[styles.bubble, support ? styles.supportBubble : styles.userBubble]}>
        <AppText style={styles.messageText} variant="body">
          {item.text}
        </AppText>
        <AppText align="right" style={styles.messageTime} tone="tertiary" variant="caption">
          {item.time}
        </AppText>
      </View>
    </View>
  );
}

function LiveSupportHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى مركز المساعدة"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>

      <View style={styles.headerMain}>
        <SupportAvatar />
        <View style={styles.headerCopy}>
          <AppText numberOfLines={1} style={styles.headerTitle} variant="sectionTitle">
            الدردشة مع الدعم
          </AppText>
          <View accessibilityRole="text" style={styles.statusRow}>
            <View style={styles.statusDot} />
            <AppText tone="success" variant="caption">
              تجريبي
            </AppText>
            <AppText tone="secondary" variant="caption">
              ردود محاكاة محلية
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

function SupportAvatar({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.avatar, small && styles.smallAvatar]}>
      <Ionicons color={colors.brand.calmGreen} name="headset-outline" size={small ? 17 : 21} />
      <View style={[styles.onlineDot, small && styles.smallOnlineDot]} />
    </View>
  );
}

function QuickTopics({ onTopicPress }: { onTopicPress: (topic: QuickTopic) => void }) {
  return (
    <View style={styles.quickTopics}>
      {quickTopics.map((topic) => (
        <Pressable
          accessibilityLabel={topic.label}
          accessibilityRole="button"
          key={topic.id}
          onPress={() => onTopicPress(topic)}
          style={({ pressed }) => [styles.topicChip, pressed && styles.pressed]}
        >
          <AppText align="center" numberOfLines={1} tone="success" variant="caption">
            {topic.label}
          </AppText>
        </Pressable>
      ))}
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
  },
  screen: {
    flex: 1,
    gap: spacing.md,
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
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
  headerMain: {
    alignItems: 'center',
    flex: 1,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  headerCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statusDot: {
    backgroundColor: colors.semantic.success,
    borderRadius: radii.pill,
    height: 7,
    width: 7,
  },
  headerTitle: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(167,200,161,0.28)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  smallAvatar: {
    height: 32,
    width: 32,
  },
  onlineDot: {
    backgroundColor: colors.semantic.success,
    borderColor: colors.background.base,
    borderRadius: radii.pill,
    borderWidth: 2,
    bottom: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    width: 12,
  },
  smallOnlineDot: {
    height: 9,
    width: 9,
  },
  messagesContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  systemCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  systemText: {
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  messageRow: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '88%',
  },
  supportRow: {
    alignSelf: 'flex-start',
    direction: 'ltr',
    flexDirection: 'row',
  },
  userRow: {
    alignSelf: 'flex-end',
    direction: 'ltr',
    flexDirection: 'row',
  },
  bubble: {
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.xs,
    maxWidth: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  supportBubble: {
    backgroundColor: colors.surface.card,
    borderBottomLeftRadius: radii.small,
    borderColor: colors.surface.border,
  },
  userBubble: {
    backgroundColor: colors.semantic.successTint,
    borderBottomRightRadius: radii.small,
    borderColor: 'rgba(79,138,91,0.36)',
  },
  messageText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  messageTime: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  quickTopics: {
    direction: 'rtl',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  topicChip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: 'rgba(79,138,91,0.30)',
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  composer: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.glass,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    maxHeight: 112,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : spacing.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.green,
    borderRadius: radii.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface.disabled,
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
