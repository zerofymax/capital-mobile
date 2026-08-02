import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import type { AccountSettingsRow as AccountSettingsRowData } from '@/screens/account/account-data';
import { useThemeColors } from '@/state/appearance-state';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type SettingsRowProps = {
  row: AccountSettingsRowData;
  isLast?: boolean;
  onPress: () => void;
};

export function SettingsRow({ row, isLast = false, onPress }: SettingsRowProps) {
  const colors = useThemeColors();

  return (
    <View>
      <Pressable
        accessibilityLabel={row.title}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          pressed && { backgroundColor: colors.glass.overlay },
        ]}
      >
        <View style={[styles.iconWrap, { borderColor: colors.surface.border }]}>
          <Ionicons color={colors.brand.green} name={row.icon} size={18} />
        </View>
        <View style={styles.copy}>
          <AppText numberOfLines={1} variant="body">
            {directionSafeText(row.title)}
          </AppText>
          <AppText numberOfLines={2} tone="secondary" variant="caption">
            {directionSafeText(row.description)}
          </AppText>
        </View>
        {row.soon ? (
          <View style={[styles.soonBadge, { borderColor: colors.surface.border }]}>
            <AppText align="center" style={styles.soonText} variant="caption">
              قريبًا
            </AppText>
          </View>
        ) : (
          <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
        )}
      </Pressable>
      {isLast ? null : <Divider />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  soonBadge: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  soonText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
