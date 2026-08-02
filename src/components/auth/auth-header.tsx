import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const capitalLogo = require('../../../assets/images/capital-app-icon.png');

type AuthHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  align?: 'center' | 'right';
};

export function AuthHeader({ eyebrow = 'Capital', title, subtitle, align = 'right' }: AuthHeaderProps) {
  return (
    <View style={[styles.root, align === 'center' && styles.center]}>
      <View style={styles.mark}>
        <Image resizeMode="contain" source={capitalLogo} style={styles.markImage} />
      </View>
      <View style={styles.copy}>
        <AppText align={align} style={styles.eyebrow} variant="caption">
          {eyebrow}
        </AppText>
        <AppText align={align} variant="screenTitle">
          {title}
        </AppText>
        <AppText align={align} tone="secondary" variant="supporting">
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.brand.deepGreen,
    borderColor: 'rgba(167,200,161,0.34)',
    borderRadius: 18,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 54,
  },
  markImage: {
    height: 48,
    width: 48,
  },
  copy: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.brand.link,
    fontWeight: '700',
  },
});
