import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { BillItem } from '@/screens/operations/operations-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { BillStatusBadge } from './bill-status-badge';

type BillCardProps = {
  bill: BillItem;
  onPress: (bill: BillItem) => void;
};

export function BillCard({ bill, onPress }: BillCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.selectionAsync().catch(() => null);
        onPress(bill);
      }}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={1} style={styles.title} variant="cardTitle">
            {bill.title}
          </AppText>
          <BillStatusBadge label={bill.statusLabel} status={bill.status} />
        </View>
        <View style={styles.metaRow}>
          <AppText tone="secondary" variant="caption">
            {bill.category}
          </AppText>
          <AppText align="left" style={styles.ltrValue} tone="secondary" variant="caption">
            {bill.due}
          </AppText>
        </View>
        <AppText align="left" style={styles.amount} variant="sectionTitle">
          {bill.amount}
        </AppText>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.text.muted} name="receipt-outline" size={20} />
      </View>
      <Ionicons color={colors.text.tertiary} name="chevron-back-outline" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 96,
    padding: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radii.control,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  ltrValue: {
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  amount: {
    color: colors.brand.green,
    fontVariant: ['tabular-nums'],
    writingDirection: 'ltr',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
