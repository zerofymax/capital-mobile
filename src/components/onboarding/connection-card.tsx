import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type ConnectionCardProps = {
  title: string;
  description: string;
  status: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export function ConnectionCard({ title, description, status, iconName }: ConnectionCardProps) {
  return (
    <SolidCard style={styles.root}>
      <View style={styles.copy}>
        <AppText style={styles.copyText} variant="cardTitle">{title}</AppText>
        <AppText style={styles.copyText} tone="secondary" variant="supporting">
          {description}
        </AppText>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.link} name={iconName} size={20} />
      </View>
      <View style={styles.badge}>
        <AppText tone="warning" variant="caption">
          {status}
        </AppText>
      </View>
    </SolidCard>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(167,200,161,0.10)',
    borderColor: 'rgba(167,200,161,0.18)',
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
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
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
