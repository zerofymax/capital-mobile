import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { NumericText } from '@/utils/rtl';

type PinKeypadProps = {
  valueLength: number;
  disabled?: boolean;
  onDigitPress: (digit: string) => void;
  onBackspacePress: () => void;
  onConfirmPress: () => void;
};

const rows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

export function PinKeypad({
  valueLength,
  disabled = false,
  onDigitPress,
  onBackspacePress,
  onConfirmPress,
}: PinKeypadProps) {
  return (
    <View style={[styles.root, disabled && styles.disabled]}>
      <View accessibilityLabel={`${valueLength} من 4 أرقام`} style={styles.dots}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.dot, index < valueLength && styles.filledDot]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {rows.map((row) => (
          <View key={row.join('-')} style={styles.keyRow}>
            {row.map((digit) => (
              <KeyButton disabled={disabled} key={digit} label={digit} onPress={() => onDigitPress(digit)} />
            ))}
          </View>
        ))}
        <View style={styles.keyRow}>
          <IconKey
            accessibilityLabel="حذف رقم"
            disabled={disabled}
            iconName="backspace-outline"
            onPress={onBackspacePress}
          />
          <KeyButton disabled={disabled} label="0" onPress={() => onDigitPress('0')} />
          <IconKey
            accessibilityLabel="تأكيد الرمز"
            disabled={disabled}
            iconName="checkmark-outline"
            onPress={onConfirmPress}
            tone="success"
          />
        </View>
      </View>
    </View>
  );
}

function KeyButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`رقم ${label}`}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && !disabled && styles.pressed]}
    >
      <NumericText style={styles.keyLabel}>{label}</NumericText>
    </Pressable>
  );
}

function IconKey({
  accessibilityLabel,
  iconName,
  disabled,
  tone = 'default',
  onPress,
}: {
  accessibilityLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  tone?: 'default' | 'success';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && !disabled && styles.pressed]}
    >
      <Ionicons color={tone === 'success' ? colors.brand.green : colors.text.muted} name={iconName} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xl,
  },
  disabled: {
    opacity: 0.58,
  },
  dots: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    writingDirection: 'ltr',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 14,
    width: 14,
  },
  filledDot: {
    backgroundColor: colors.brand.green,
    borderColor: colors.brand.green,
    boxShadow: '0 0 16px rgba(79,138,91,0.28)',
  },
  keypad: {
    gap: spacing.md,
  },
  keyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    writingDirection: 'ltr',
  },
  key: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  keyLabel: {
    color: colors.text.primary,
    fontSize: 22,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.96 }],
  },
});
