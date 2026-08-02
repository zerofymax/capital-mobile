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
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.link} name={iconName} size={20} />
      </View>
      <View style={styles.copy}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText tone="secondary" variant="supporting">
          {description}
        </AppText>
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
    flexDirection: 'row-reverse',
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
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.semantic.warningTint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
