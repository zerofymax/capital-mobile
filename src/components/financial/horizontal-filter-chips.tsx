import { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type HorizontalFilterItem<T extends string> = {
  id: T;
  label: string;
};

type HorizontalFilterChipsProps<T extends string> = {
  items: readonly HorizontalFilterItem<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
};

export function HorizontalFilterChips<T extends string>({
  items,
  selectedValue,
  onChange,
}: HorizontalFilterChipsProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollable = items.length > 3;
  const scrollToRtlStart = useCallback(() => {
    if (!scrollable) {
      return;
    }

    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
  }, [scrollable]);

  useEffect(() => {
    scrollToRtlStart();
  }, [scrollToRtlStart]);

  const chips = items.map((item) => {
    const selected = item.id === selectedValue;

    return (
      <Pressable
        accessibilityLabel={item.label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        key={item.id}
        onPress={() => onChange(item.id)}
        style={({ pressed }) => [
          styles.chip,
          scrollable ? styles.scrollChip : styles.fixedChip,
          selected && styles.selectedChip,
          pressed && styles.pressed,
        ]}
      >
        <AppText align="center" numberOfLines={1} style={[styles.label, selected && styles.selectedLabel]} variant="caption">
          {item.label}
        </AppText>
      </Pressable>
    );
  });

  if (!scrollable) {
    return <View style={styles.fixedRow}>{chips}</View>;
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.scrollContent}
      horizontal
      onContentSizeChange={scrollToRtlStart}
      onLayout={scrollToRtlStart}
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fixedRow: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    width: '100%',
  },
  scroll: {
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexGrow: 1,
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  fixedChip: {
    flex: 1,
    minWidth: 0,
  },
  scrollChip: {
    flexShrink: 0,
    minWidth: 96,
  },
  selectedChip: {
    backgroundColor: colors.brand.mediumGreen,
    borderColor: colors.brand.mediumGreen,
  },
  label: {
    color: colors.text.secondary,
    writingDirection: 'rtl',
  },
  selectedLabel: {
    color: colors.text.primary,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});
