import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Divider } from '@/components/ui';
import type { ReportTypeRow as ReportTypeRowData } from '@/screens/reports/reports-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ReportTypeRowProps = {
  report: ReportTypeRowData;
  isLast?: boolean;
  onPress: () => void;
};

export function ReportTypeRow({ report, isLast = false, onPress }: ReportTypeRowProps) {
  return (
    <View>
      <Pressable
        accessibilityLabel={`تصدير ${report.title}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.root, pressed && styles.pressed]}
      >
        <View style={styles.copy}>
          <AppText numberOfLines={1} style={styles.copyText} variant="body">
            {report.title}
          </AppText>
          <AppText numberOfLines={2} style={styles.copyText} tone="secondary" variant="caption">
            {report.description}
          </AppText>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.brand.green} name={report.icon} size={18} />
        </View>
        <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={16} />
      </Pressable>
      {isLast ? null : <Divider />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.12)',
    borderColor: 'rgba(167,200,161,0.26)',
    borderRadius: radii.control,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  copyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
});
