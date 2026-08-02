import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type DataTransferComingSoonScreenProps = {
  title: string;
};

export function DataTransferComingSoonScreen({ title }: DataTransferComingSoonScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="رجوع" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={colors.text.muted} name="chevron-forward-outline" size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <AppText align="center" variant="screenTitle">
              {title}
            </AppText>
            <AppText align="center" tone="secondary" variant="supporting">
              هذه الميزة ستكون متاحة في تحديث قادم.
            </AppText>
          </View>
          <View style={styles.headerSlot} />
        </View>

        <SolidCard style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons color={colors.brand.calmGreen} name="time-outline" size={28} />
          </View>
          <View style={styles.badge}>
            <AppText tone="warning" variant="caption">
              قريبًا
            </AppText>
          </View>
          <AppText align="center" tone="secondary" variant="supporting">
            نحافظ على تنفيذ الاستيراد والتصدير الحالي للعودة إليه لاحقًا، لكن الوصول للميزة متوقف مؤقتًا في هذا الإصدار.
          </AppText>
        </SolidCard>

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <AppText align="center" variant="buttonLabel">
            رجوع
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 68,
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
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.28)',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  badge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.26)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.brand.green,
    borderRadius: radii.button,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
