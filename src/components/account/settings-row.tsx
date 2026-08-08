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
        {row.soon ? (
          <View style={[styles.soonBadge, { borderColor: colors.surface.border }]}>
            <AppText align="center" style={styles.soonText} variant="caption">
              قريبًا
            </AppText>
          </View>
        ) : (
          <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
        )}
        <View style={[styles.iconWrap, { borderColor: colors.surface.border }]}>
          <Ionicons color={colors.brand.green} name={row.icon} size={18} />
        </View>
        <View style={styles.copy}>
          <AppText numberOfLines={1} style={styles.copyText} variant="body">
            {directionSafeText(row.title)}
          </AppText>
          <AppText numberOfLines={2} style={styles.copyText} tone="secondary" variant="caption">
            {directionSafeText(row.description)}
          </AppText>
        </View>
      </Pressable>
      {isLast ? null : <Divider />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
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
    alignItems: 'flex-end',
    direction: 'ltr',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  copyText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
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
