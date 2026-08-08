import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { ContactMethod } from '@/screens/support/support-data';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ContactMethodCardProps = {
  method: ContactMethod;
};

export function ContactMethodCard({ method }: ContactMethodCardProps) {
  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        <AppText numberOfLines={1} style={styles.copyText} variant="cardTitle">
          {method.title}
        </AppText>
        <AppText numberOfLines={2} style={styles.copyText} tone="secondary" variant="supporting">
          {method.description}
        </AppText>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.green} name={method.icon} size={20} />
      </View>
      <View style={styles.badge}>
        <AppText align="center" tone="warning" variant="caption">
          {method.status}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderColor: colors.surface.border,
    borderRadius: radii.input,
    borderWidth: 1,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.md,
    minHeight: 86,
    padding: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(79,138,91,0.10)',
    borderRadius: radii.control,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  copy: {
    alignItems: 'flex-end',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  copyText: {
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  badge: {
    backgroundColor: colors.semantic.warningTint,
    borderColor: 'rgba(232,163,61,0.24)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
