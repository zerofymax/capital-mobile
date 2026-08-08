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
  rtlLayout?: boolean;
};

export function AuthHeader({ eyebrow = 'Capital', title, subtitle, align = 'right', rtlLayout = false }: AuthHeaderProps) {
  return (
    <View style={[styles.root, align === 'center' && styles.center, rtlLayout && styles.rtlRoot]}>
      {rtlLayout ? (
        <View style={styles.rtlBrand}>
          <View style={styles.mark}>
            <Image resizeMode="contain" source={capitalLogo} style={styles.markImage} />
          </View>
          <AppText align="left" style={styles.rtlBrandText} variant="caption">
            {eyebrow}
          </AppText>
        </View>
      ) : (
        <View style={styles.mark}>
          <Image resizeMode="contain" source={capitalLogo} style={styles.markImage} />
        </View>
      )}
      <View style={[styles.copy, rtlLayout && styles.rtlCopy]}>
        {!rtlLayout ? (
          <AppText align={align} style={styles.eyebrow} variant="caption">
            {eyebrow}
          </AppText>
        ) : null}
        <AppText align={align} style={rtlLayout ? styles.rtlText : undefined} variant="screenTitle">
          {title}
        </AppText>
        <AppText align={align} style={rtlLayout ? styles.rtlText : undefined} tone="secondary" variant="supporting">
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
  rtlRoot: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'rtl',
    width: '100%',
  },
  rtlBrand: {
    alignItems: 'center',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    width: '100%',
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
  rtlCopy: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
  },
  eyebrow: {
    color: colors.brand.link,
    fontWeight: '700',
  },
  rtlBrandText: {
    color: colors.brand.link,
    fontWeight: '700',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlText: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
