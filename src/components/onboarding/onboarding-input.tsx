import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type OnboardingInputProps = TextInputProps & {
  label: string;
  error?: string;
  ltr?: boolean;
};

export function OnboardingInput({ label, error, ltr = false, style, ...props }: OnboardingInputProps) {
  return (
    <View style={styles.root}>
      <AppText style={styles.label} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.text.tertiary}
        style={[
          styles.input,
          ltr && styles.ltrInput,
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <AppText style={styles.label} tone="danger" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'stretch',
    gap: spacing.sm,
    width: '100%',
  },
  label: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.045)',
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
  ltrInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputError: {
    borderColor: colors.semantic.danger,
  },
});
