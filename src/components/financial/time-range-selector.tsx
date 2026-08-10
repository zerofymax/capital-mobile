import { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export type TimeRangeOption<T extends string> = {
  id: T;
  label: string;
};

type TimeRangeSelectorProps<T extends string> = {
  options: readonly TimeRangeOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
};

export function TimeRangeSelector<T extends string>({
  options,
  selectedValue,
  onSelect,
}: TimeRangeSelectorProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const usesScrollableRow = options.length > 4;
  const scrollToRtlStart = useCallback(() => {
    if (!usesScrollableRow) {
      return;
    }

    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
  }, [usesScrollableRow]);

  useEffect(() => {
    scrollToRtlStart();
  }, [scrollToRtlStart]);

  const chips = options.map((option) => {
    const selected = option.id === selectedValue;

    return (
      <Pressable
        accessibilityLabel={option.label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        key={option.id}
        onPress={() => onSelect(option.id)}
        style={({ pressed }) => [
          styles.option,
          !usesScrollableRow && styles.gridOption,
          usesScrollableRow && styles.scrollOption,
          selected && styles.selectedOption,
          pressed && styles.pressed,
        ]}
      >
        <AppText align="center" numberOfLines={1} style={[styles.label, selected && styles.selectedLabel]} variant="caption">
          {option.label}
        </AppText>
      </Pressable>
    );
  });

  if (!usesScrollableRow) {
    return (
      <View accessibilityRole="tablist" style={styles.grid}>
        {chips}
      </View>
    );
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
  grid: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
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
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.sm,
  },
  gridOption: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 0,
  },
  scrollOption: {
    flexShrink: 0,
    minWidth: 96,
  },
  selectedOption: {
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
