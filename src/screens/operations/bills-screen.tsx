import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BillCard, BillSummaryCard } from '@/components/operations';
import { AppText, GlassSurface } from '@/components/ui';
import { routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import {
  billFilters,
  billSummary,
  prototypeBills,
  type BillFilter,
  type BillItem,
} from './operations-data';

export function BillsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<BillFilter>('all');
  const visibleBills = useMemo(
    () => (filter === 'all' ? prototypeBills : prototypeBills.filter((bill) => bill.status === filter)),
    [filter],
  );

  function handleBillPress(bill: BillItem) {
    router.push({
      pathname: routes.billDetail,
      params: { billId: bill.id },
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.background.heroStart, colors.background.base, colors.background.base]}
        end={{ x: 0.72, y: 1 }}
        locations={[0, 0.52, 1]}
        start={{ x: 0.28, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + spacing.xxxl, spacing.screenBottom),
            paddingTop: Math.max(insets.top, spacing.safeTop),
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ModalHeader onClose={() => router.back()} title="الفواتير والمدفوعات" />
        <View style={styles.intro}>
          <AppText tone="secondary" variant="body">
            تابع الفواتير المستحقة وجدول المدفوعات القادمة
          </AppText>
        </View>

        <BillSummaryCard
          rows={[
            { label: 'إجمالي المستحق', value: billSummary.totalDue, ltr: true },
            { label: 'عدد الفواتير', value: billSummary.billCount, ltr: true },
            { label: 'أقرب استحقاق', value: billSummary.nearestDue, ltr: true },
          ]}
        />

        <GlassSurface>
          <View style={styles.filters}>
            {billFilters.map((item) => {
              const selected = item.id === filter;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText align="center" tone={selected ? 'success' : 'secondary'} variant="buttonLabel">
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </GlassSurface>

        <View style={styles.section}>
          <AppText variant="sectionTitle">الفواتير</AppText>
          {visibleBills.map((bill) => (
            <BillCard bill={bill} key={bill.id} onPress={handleBillPress} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="إغلاق"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.muted} name="close-outline" size={22} />
      </Pressable>
      <AppText align="center" numberOfLines={1} style={styles.headerTitle} variant="screenTitle">
        {title}
      </AppText>
      <View style={styles.headerSlot} />
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  closeButton: {
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
    flex: 1,
  },
  headerSlot: {
    height: 40,
    width: 40,
  },
  intro: {
    marginTop: -spacing.sm,
  },
  filters: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  filterChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  filterChipSelected: {
    backgroundColor: colors.semantic.successTint,
    borderColor: 'rgba(79,138,91,0.30)',
    borderWidth: 1,
  },
  section: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
