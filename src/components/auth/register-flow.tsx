import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type RegisterAgreementTextProps = {
  align?: 'center' | 'right';
  consent?: boolean;
};

type RegisterSelectFieldProps = {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
  fullWidth?: boolean;
};

export function RegisterAgreementText({ align = 'center', consent = false }: RegisterAgreementTextProps) {
  return (
    <AppText align={align} tone="secondary" variant="caption">
      {consent ? 'أوافق على ' : 'بإنشاء الحساب أنت توافق على '}
      <Text style={styles.legalAccent}>الشروط والأحكام</Text>
      {' و'}
      <Text style={styles.legalAccent}>سياسة الخصوصية</Text>
    </AppText>
  );
}

export function RegisterSelectField({ label, options, value, onSelect, fullWidth = false }: RegisterSelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  function openPicker() {
    Keyboard.dismiss();
    setPickerVisible(true);
  }

  function closePicker() {
    setPickerVisible(false);
  }

  function selectOption(option: string) {
    onSelect(option);
    setPickerVisible(false);
  }

  return (
    <View style={[styles.selectRoot, fullWidth && styles.fullWidth]}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.selectField, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text.tertiary} name="chevron-down" size={16} />
        <AppText align="right" style={styles.selectValue} variant="body">
          {value}
        </AppText>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        statusBarTranslucent
        transparent
        visible={pickerVisible}
      >
        <View style={styles.pickerModalRoot}>
          <Pressable accessibilityLabel="إغلاق القائمة" onPress={closePicker} style={styles.pickerBackdrop} />
          <View style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl) }]}>
            <View style={styles.pickerHandle} />
            <View style={styles.pickerHeader}>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={closePicker}>
                <AppText tone="link" variant="supporting">
                  إلغاء
                </AppText>
              </Pressable>
              <AppText variant="cardTitle">{label}</AppText>
            </View>

            <View style={styles.pickerOptions}>
              {options.map((option) => {
                const selected = option === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => selectOption(option)}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      selected && styles.pickerOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {selected ? <Ionicons color={colors.brand.calmGreen} name="checkmark-circle" size={18} /> : null}
                    <AppText align="right" style={styles.pickerOptionText} tone={selected ? 'primary' : 'secondary'} variant="body">
                      {option}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  legalAccent: {
    color: colors.brand.calmGreen,
  },
  selectRoot: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  fullWidth: {
    flexBasis: '100%',
  },
  selectField: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  selectValue: {
    flex: 1,
  },
  pickerModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  pickerBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pickerSheet: {
    backgroundColor: 'rgba(17,20,25,0.98)',
    borderColor: colors.glass.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    gap: spacing.md,
    maxHeight: '72%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  pickerHandle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.pill,
    height: 4,
    width: 42,
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(31,90,58,0.34)',
    borderColor: 'rgba(167,200,161,0.56)',
  },
  pickerOptionText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
