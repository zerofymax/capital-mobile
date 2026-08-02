import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.root}>
      <AppText tone="secondary" variant="supporting">
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, error ? styles.inputError : null, style]}
      />
      {error ? (
        <AppText tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.inputBorder,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
});
