import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type LedgerSearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

export function LedgerSearchField({ value, onChangeText, onClear }: LedgerSearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.root, focused && styles.focused]}>
      <Ionicons color={focused ? colors.brand.green : colors.text.tertiary} name="search-outline" size={18} />
      <TextInput
        accessibilityLabel="البحث في العمليات"
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder="ابحث في العمليات"
        placeholderTextColor={colors.text.tertiary}
        returnKeyType="search"
        selectionColor={colors.brand.green}
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="مسح البحث"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClear}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text.secondary} name="close-outline" size={18} />
        </Pressable>
      ) : (
        <View style={styles.clearSlot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: 14,
  },
  focused: {
    borderColor: 'rgba(79,138,91,0.42)',
    boxShadow: '0 0 0 1px rgba(79,138,91,0.08)',
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    minWidth: 0,
    padding: 0,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  clearButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  clearSlot: {
    width: 32,
  },
  pressed: {
    opacity: 0.65,
  },
});
