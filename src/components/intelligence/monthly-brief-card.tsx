import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/feedback';
import { AppText } from '@/components/ui/app-text';
import type { MonthlyBriefItem } from '@/screens/intelligence/intelligence-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { directionSafeText } from '@/utils/rtl';

type MonthlyBriefCardProps = {
  label: string;
  statusLabel: string;
  items: readonly MonthlyBriefItem[];
};

const itemToneColor: Record<MonthlyBriefItem['tone'], string> = {
  brand: colors.brand.green,
  danger: colors.semantic.danger,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
};

export function MonthlyBriefCard({ label, statusLabel, items }: MonthlyBriefCardProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(38,46,62,0.62)', 'rgba(20,24,32,0.58)', 'rgba(10,13,18,0.62)']}
        end={{ x: 0.9, y: 1 }}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.006)', 'rgba(255,255,255,0)']}
        style={styles.softReflection}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <StatusBadge label={statusLabel} tone="success" />
          <AppText align="right" style={styles.label} variant="body">
            {label}
          </AppText>
        </View>
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={[styles.item, item.id === 'opportunity' && styles.fullWidthItem]}>
              <View style={styles.itemCopy}>
                <AppText align="right" style={styles.rtlText} tone="secondary" variant="caption">
                  {item.label}
                </AppText>
                <AppText align="right" style={[styles.value, { color: itemToneColor[item.tone] }]} variant="body">
                  {directionSafeText(item.value)}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 28,
    borderWidth: 1,
    boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.35), 0 18px 36px rgba(0,0,0,0.42)',
    overflow: 'hidden',
    position: 'relative',
  },
  softReflection: {
    borderRadius: 44,
    height: 88,
    left: 16,
    position: 'absolute',
    top: 12,
    width: 88,
  },
  content: {
    gap: spacing.lg,
    padding: 22,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    color: '#A7AFBB',
    flex: 1,
    fontWeight: '500',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.button,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 0,
    padding: 13,
  },
  fullWidthItem: {
    flexBasis: '100%',
  },
  itemCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  value: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
