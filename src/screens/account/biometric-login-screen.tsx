import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/system';
import { AppText, Divider, SolidCard } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type BiometricDialogAction = 'enable' | 'disable';

type BiometricMethod = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
};

const supportedMethods: BiometricMethod[] = [
  {
    id: 'fingerprint',
    icon: 'finger-print-outline',
    title: 'بصمة الإصبع',
    status: 'متاحة في النموذج',
  },
  {
    id: 'face',
    icon: 'scan-outline',
    title: 'التعرف على الوجه',
    status: 'متاحة في النموذج',
  },
  {
    id: 'pin',
    icon: 'keypad-outline',
    title: 'رمز PIN',
    status: 'طريقة احتياطية',
  },
];

export function BiometricLoginScreen() {
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [enabled, setEnabled] = useState(false);
  const [dialogAction, setDialogAction] = useState<BiometricDialogAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  function goBackToSecurity() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(routes.security);
  }

  function requestToggle(nextValue: boolean) {
    if (loading) {
      return;
    }

    Haptics.selectionAsync().catch(() => null);
    setFeedback(null);
    setDialogAction(nextValue ? 'enable' : 'disable');
  }

  function handleConfirmAction() {
    if (!dialogAction || loading) {
      return;
    }

    if (dialogAction === 'disable') {
      setDialogAction(null);
      setEnabled(false);
      setFeedback('تم إيقاف الدخول بالبصمة');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      return;
    }

    setDialogAction(null);
    setLoading(true);
    setFeedback('جاري التحقق');
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      setEnabled(true);
      setLoading(false);
      setFeedback('تم تفعيل الدخول بالبصمة');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
    }, 650);
  }

  const statusLabel = enabled ? 'مفعّل' : 'غير مفعّل';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.5, 1]}
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
        <BiometricHeader onBackPress={goBackToSecurity} />
        <BiometricHeroCard />
        <BiometricStatusCard enabled={enabled} loading={loading} statusLabel={statusLabel} />

        {feedback ? (
          <SolidCard accessibilityLiveRegion="polite" style={[styles.feedbackCard, enabled && styles.feedbackSuccess]}>
            {loading ? (
              <ActivityIndicator color={colors.brand.calmGreen} size="small" />
            ) : (
              <Ionicons color={enabled ? colors.semantic.success : colors.semantic.warning} name="information-circle-outline" size={18} />
            )}
            <AppText style={styles.feedbackText} tone={enabled ? 'success' : 'warning'} variant="supporting">
              {feedback}
            </AppText>
          </SolidCard>
        ) : null}

        <BiometricToggleCard enabled={enabled} loading={loading} onToggle={requestToggle} />
        <SupportedMethodsSection />
        <FallbackMethodCard />
        <CompatibilityNotice />
        <SecurityNotice />
      </ScrollView>

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="متابعة"
        description="في النسخة الإنتاجية، سيطلب Capital التحقق من بصمتك أو وجهك قبل التفعيل. لن يتم إجراء تحقق حقيقي في هذا النموذج المحلي."
        onCancel={() => setDialogAction(null)}
        onConfirm={handleConfirmAction}
        title="تفعيل الدخول بالبصمة؟"
        tone="success"
        visible={dialogAction === 'enable'}
      />

      <ConfirmationDialog
        cancelLabel="إلغاء"
        confirmLabel="إيقاف"
        description="ستحتاج إلى استخدام رمز PIN أو كلمة المرور لتسجيل الدخول."
        onCancel={() => setDialogAction(null)}
        onConfirm={handleConfirmAction}
        title="إيقاف الدخول بالبصمة؟"
        tone="warning"
        visible={dialogAction === 'disable'}
      />
    </View>
  );
}

function BiometricHeader({ onBackPress }: { onBackPress: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="العودة إلى الأمان"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBackPress}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="chevron-back-outline" size={22} />
      </Pressable>
      <AppText align="right" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        الدخول بالبصمة
      </AppText>
    </View>
  );
}

function BiometricHeroCard() {
  return (
    <SolidCard style={styles.heroCard}>
      <View style={styles.heroIconWrap}>
        <Ionicons color={colors.brand.calmGreen} name="finger-print-outline" size={42} />
      </View>
      <View style={styles.heroCopy}>
        <AppText align="right" style={styles.rtlText} variant="sectionTitle">
          دخول أسرع وأكثر أمانًا
        </AppText>
        <AppText align="right" style={styles.description} tone="secondary" variant="supporting">
          استخدم بصمة الإصبع أو التعرف على الوجه لتسجيل الدخول إلى Capital بسرعة.
        </AppText>
      </View>
    </SolidCard>
  );
}

function BiometricStatusCard({
  enabled,
  loading,
  statusLabel,
}: {
  enabled: boolean;
  loading: boolean;
  statusLabel: string;
}) {
  return (
    <SolidCard style={styles.statusCard}>
      <View style={styles.statusCopy}>
        <AppText variant="cardTitle">حالة الدخول بالبصمة</AppText>
        <AppText style={styles.description} tone="secondary" variant="caption">
          الحالة المعروضة محلية وتجريبية فقط.
        </AppText>
      </View>
      <StatusBadge label={loading ? 'قيد التحقق' : statusLabel} tone={enabled ? 'success' : 'muted'} />
    </SolidCard>
  );
}

function BiometricToggleCard({
  enabled,
  loading,
  onToggle,
}: {
  enabled: boolean;
  loading: boolean;
  onToggle: (nextValue: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityLabel="تفعيل الدخول بالبصمة"
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled: loading }}
      disabled={loading}
      onPress={() => onToggle(!enabled)}
      style={({ pressed }) => [styles.toggleCard, loading && styles.disabledBlock, pressed && !loading && styles.pressed]}
    >
      <View style={styles.toggleCopy}>
        <AppText variant="cardTitle">تفعيل الدخول بالبصمة</AppText>
        <AppText style={styles.description} tone="secondary" variant="caption">
          استخدام البصمة أو التعرف على الوجه بدلًا من إدخال رمز PIN في كل مرة.
        </AppText>
      </View>
      <Switch
        disabled={loading}
        ios_backgroundColor={colors.surface.muted}
        onValueChange={onToggle}
        thumbColor={enabled ? colors.text.inverse : colors.text.tertiary}
        trackColor={{ false: colors.surface.muted, true: colors.brand.green }}
        value={enabled}
      />
    </Pressable>
  );
}

function SupportedMethodsSection() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">طرق التحقق</AppText>
      <SolidCard style={styles.rowsCard}>
        {supportedMethods.map((method, index) => (
          <View key={method.id}>
            <MethodRow method={method} />
            {index < supportedMethods.length - 1 ? <Divider /> : null}
          </View>
        ))}
        <View style={styles.sectionFooter}>
          <AppText tone="tertiary" variant="caption">
            يتم تحديد الطريقة المتاحة فعليًا حسب جهاز المستخدم في النسخة الإنتاجية.
          </AppText>
        </View>
      </SolidCard>
    </View>
  );
}

function MethodRow({ method }: { method: BiometricMethod }) {
  return (
    <View style={styles.methodRow}>
      <View style={styles.methodIcon}>
        <Ionicons color={colors.brand.green} name={method.icon} size={18} />
      </View>
      <View style={styles.methodCopy}>
        <AppText variant="body">{method.title}</AppText>
        <AppText tone="secondary" variant="caption">
          {method.status}
        </AppText>
      </View>
    </View>
  );
}

function FallbackMethodCard() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">طريقة الدخول الاحتياطية</AppText>
      <SolidCard style={styles.fallbackCard}>
        <View style={styles.methodIcon}>
          <Ionicons color={colors.brand.green} name="keypad-outline" size={18} />
        </View>
        <View style={styles.methodCopy}>
          <AppText variant="cardTitle">رمز PIN</AppText>
          <AppText style={styles.description} tone="secondary" variant="caption">
            سيُستخدم رمز PIN إذا تعذر التحقق بالبصمة أو الوجه.
          </AppText>
        </View>
        <StatusBadge label="مفعّل" tone="success" />
      </SolidCard>
    </View>
  );
}

function CompatibilityNotice() {
  return (
    <SolidCard style={styles.noticeCard}>
      <Ionicons color={colors.semantic.warning} name="phone-portrait-outline" size={20} />
      <View style={styles.noticeCopy}>
        <AppText variant="cardTitle">توافق الجهاز</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          في النسخة الإنتاجية، سيظهر خيار التفعيل فقط إذا كان الجهاز يدعم البصمة أو التعرف على الوجه وتم إعدادها في النظام.
        </AppText>
      </View>
    </SolidCard>
  );
}

function SecurityNotice() {
  return (
    <SolidCard style={styles.securityNotice}>
      <Ionicons color={colors.brand.calmGreen} name="shield-checkmark-outline" size={20} />
      <View style={styles.noticeCopy}>
        <AppText variant="cardTitle">بياناتك البيومترية لا تغادر جهازك</AppText>
        <AppText style={styles.description} tone="secondary" variant="supporting">
          Capital لا يحتفظ بصورة بصمتك أو وجهك. يتم التحقق من خلال نظام الجهاز في النسخة الإنتاجية.
        </AppText>
      </View>
    </SolidCard>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'muted' }) {
  return (
    <View style={[styles.statusBadge, tone === 'success' && styles.statusBadgeSuccess]}>
      <AppText align="center" tone={tone === 'success' ? 'success' : 'secondary'} variant="caption">
        {label}
      </AppText>
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
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(11,46,38,0.72)',
    borderColor: 'rgba(167,200,161,0.24)',
    gap: spacing.lg,
  },
  heroIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.18)',
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  heroCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: spacing.sm,
    maxWidth: 300,
  },
  description: {
    alignSelf: 'stretch',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusCard: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  statusCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statusBadge: {
    backgroundColor: colors.surface.muted,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeSuccess: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
  },
  feedbackCard: {
    alignItems: 'center',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feedbackSuccess: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
  },
  feedbackText: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  toggleCard: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 86,
    padding: spacing.lg,
  },
  toggleCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  disabledBlock: {
    opacity: 0.62,
  },
  section: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  rowsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  methodRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  methodIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderColor: 'rgba(167,200,161,0.24)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  methodCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  sectionFooter: {
    backgroundColor: colors.surface.muted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  fallbackCard: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noticeCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  securityNotice: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(17,26,23,0.94)',
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  noticeCopy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});
