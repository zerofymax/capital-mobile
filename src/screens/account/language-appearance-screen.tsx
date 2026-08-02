import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import {
  setAppearancePreference,
  useResolvedAppearance,
  type AppearancePreference,
} from '@/state/appearance-state';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type AppearanceOption = {
  id: AppearancePreference | 'light';
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  soon?: boolean;
};

const appearanceOptions: AppearanceOption[] = [
  {
    id: 'dark',
    title: 'داكن',
    description: 'استخدام المظهر الداكن دائمًا.',
    icon: 'moon-outline',
  },
  {
    id: 'light',
    title: 'فاتح',
    description: 'استخدام المظهر الفاتح دائمًا.',
    icon: 'sunny-outline',
    soon: true,
  },
  {
    id: 'system',
    title: 'حسب النظام',
    description: 'يتبع إعدادات الجهاز.',
    icon: 'phone-portrait-outline',
  },
];

export function LanguageAppearanceScreen() {
  const insets = useSafeAreaInsets();
  const appearance = useResolvedAppearance();
  const colors = appearance.colors;
  const [notice, setNotice] = useState<string | null>(null);

  function handleAppearancePress(preference: AppearancePreference) {
    Haptics.selectionAsync().catch(() => null);
    setNotice(null);
    setAppearancePreference(preference);
  }

  function handleLightPress() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setNotice('المظهر الفاتح قادم في تحديث لاحق.');
  }

  function handleAppearanceOptionPress(option: AppearanceOption) {
    if (option.id === 'light') {
      handleLightPress();
      return;
    }

    handleAppearancePress(option.id);
  }

  function handleEnglishPress() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => null);
    setNotice('اللغة الإنجليزية قادمة في تحديث لاحق.');
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background.base }]}>
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
          { paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom) },
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <ModalHeader onBack={() => router.back()} />

        {notice ? <Notice message={notice} /> : null}

        <View style={styles.section}>
          <AppText variant="sectionTitle">المظهر</AppText>
          <View style={styles.optionList}>
            {appearanceOptions.map((option) => (
              <AppearanceCard
                key={option.id}
                option={option}
                selected={!option.soon && appearance.preference === option.id}
                onPress={() => handleAppearanceOptionPress(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle">اللغة</AppText>
          <View style={styles.optionList}>
            <LanguageCard
              description="اللغة الحالية للتطبيق."
              icon="language-outline"
              selected
              status="مفعّلة"
              title="العربية"
            />
            <LanguageCard
              description="واجهة كاملة باللغة الإنجليزية."
              disabled
              icon="text-outline"
              onPress={handleEnglishPress}
              status="قريبًا"
              title="English"
              titleLtr
            />
          </View>
        </View>

        <SolidCard style={styles.languageNotice}>
          <Ionicons color={colors.brand.green} name="information-circle-outline" size={18} />
          <AppText style={styles.noticeText} tone="secondary" variant="supporting">
            Capital متاح حاليًا باللغة العربية، وسيتم دعم الإنجليزية في تحديث لاحق.
          </AppText>
        </SolidCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModalHeader({ onBack }: { onBack: () => void }) {
  const colors = useResolvedAppearance().colors;

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="رجوع"
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: colors.surface.card, borderColor: colors.surface.border },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={21} />
      </Pressable>
      <View style={styles.headerCopy}>
        <AppText align="center" variant="screenTitle">
          المظهر واللغة
        </AppText>
        <AppText align="center" tone="secondary" variant="supporting">
          خصّص طريقة ظهور Capital واختر لغة التطبيق.
        </AppText>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function AppearanceCard({
  option,
  selected,
  onPress,
}: {
  option: AppearanceOption;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useResolvedAppearance().colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: option.soon, selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor: colors.surface.card,
          borderColor: selected ? colors.brand.mediumGreen : colors.surface.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: colors.semantic.successTint, borderColor: colors.surface.border }]}>
        <Ionicons color={colors.brand.green} name={option.icon} size={20} />
      </View>
      <View style={styles.optionCopy}>
        <View style={styles.optionTitleRow}>
          <AppText variant="cardTitle">{option.title}</AppText>
          {option.soon ? (
            <View style={[styles.selectedBadge, { backgroundColor: colors.surface.muted }]}>
              <AppText align="center" tone="secondary" variant="caption">
                قريبًا
              </AppText>
            </View>
          ) : selected ? (
            <View style={[styles.selectedBadge, { backgroundColor: colors.semantic.successTint }]}>
              <Ionicons color={colors.semantic.success} name="checkmark-outline" size={14} />
              <AppText align="center" tone="success" variant="caption">
                محدد
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText tone="secondary" variant="caption">
          {option.description}
        </AppText>
        <View style={styles.previewRow}>
          <View style={[styles.previewBlock, { backgroundColor: '#111419' }]} />
          <View style={[styles.previewLine, { backgroundColor: colors.text.tertiary }]} />
          <View style={[styles.previewDot, { backgroundColor: colors.brand.green }]} />
        </View>
      </View>
    </Pressable>
  );
}

function LanguageCard({
  title,
  description,
  status,
  icon,
  selected,
  disabled,
  titleLtr,
  onPress,
}: {
  title: string;
  description: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  disabled?: boolean;
  titleLtr?: boolean;
  onPress?: () => void;
}) {
  const colors = useResolvedAppearance().colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor: colors.surface.card,
          borderColor: selected ? colors.brand.mediumGreen : colors.surface.border,
          opacity: disabled ? 0.82 : 1,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: colors.semantic.successTint, borderColor: colors.surface.border }]}>
        <Ionicons color={colors.brand.green} name={icon} size={20} />
      </View>
      <View style={styles.optionCopy}>
        <View style={styles.optionTitleRow}>
          <AppText align={titleLtr ? 'left' : 'right'} style={titleLtr && styles.ltrTitle} variant="cardTitle">
            {title}
          </AppText>
          <View style={[styles.selectedBadge, { backgroundColor: selected ? colors.semantic.successTint : colors.surface.muted }]}>
            {selected ? <Ionicons color={colors.semantic.success} name="checkmark-outline" size={14} /> : null}
            <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="caption">
              {status}
            </AppText>
          </View>
        </View>
        <AppText tone="secondary" variant="caption">
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

function Notice({ message }: { message: string }) {
  const colors = useResolvedAppearance().colors;

  return (
    <SolidCard accessibilityLiveRegion="polite" style={styles.notice}>
      <Ionicons color={colors.semantic.warning} name="information-circle-outline" size={18} />
      <AppText style={styles.noticeText} tone="warning" variant="supporting">
        {message}
      </AppText>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerSpacer: {
    width: 42,
  },
  section: {
    gap: spacing.md,
  },
  optionList: {
    gap: spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    borderRadius: radii.card,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 86,
    padding: spacing.md,
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  optionCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  selectedBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  previewBlock: {
    borderColor: 'rgba(79,138,91,0.25)',
    borderRadius: 8,
    borderWidth: 1,
    height: 18,
    width: 36,
  },
  previewLine: {
    borderRadius: radii.pill,
    height: 5,
    opacity: 0.42,
    width: 58,
  },
  previewDot: {
    borderRadius: radii.pill,
    height: 10,
    width: 10,
  },
  languageNotice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  notice: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
  },
  ltrTitle: {
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
