import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ScreenProps = ViewProps & {
  padded?: boolean;
};

export function Screen({ children, padded = true, style, ...props }: PropsWithChildren<ScreenProps>) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[
        styles.screen,
        padded && {
          paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.screenBottom),
          paddingHorizontal: spacing.screenX,
          paddingTop: Math.max(insets.top, spacing.safeTop),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScrollScreen({
  children,
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScrollViewProps>) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.screenBottom),
          paddingTop: Math.max(insets.top, spacing.safeTop),
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      {children}
    </ScrollView>
  );
}

export function DeepScreen({ children }: PropsWithChildren) {
  return <Screen>{children}</Screen>;
}

export function FixedFooterScreen({
  header,
  footer,
  children,
}: PropsWithChildren<{ header?: ReactNode; footer: ReactNode }>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.fixedHeader, { paddingTop: Math.max(insets.top, spacing.deepHeaderTop) }]}>{header}</View>
      <ScrollView
        contentContainerStyle={styles.fixedBody}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View style={[styles.fixedFooter, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.screenBottom) }]}>
        {footer}
      </View>
    </View>
  );
}

export function KeyboardSafeScreen({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background.base,
    flex: 1,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingHorizontal: spacing.screenX,
  },
  fixedHeader: {
    paddingHorizontal: spacing.screenX,
  },
  fixedBody: {
    gap: spacing.lg,
    padding: spacing.screenX,
  },
  fixedFooter: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
  },
});
