import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, SolidCard } from '@/components/ui';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

type DatePickerRowProps = {
  label: string;
  value: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  ltr?: boolean;
};

export function DatePickerRow({ label, value, iconName = 'calendar-outline', ltr = false }: DatePickerRowProps) {
  return (
    <SolidCard style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.brand.link} name={iconName} size={19} />
      </View>
      <AppText style={styles.label} tone="secondary" variant="supporting">
        {label}
      </AppText>
      <AppText align={ltr ? 'left' : 'right'} style={ltr ? styles.ltrValue : styles.value} variant="body">
        {value}
      </AppText>
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
    borderRadius: radii.control,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    flex: 1,
  },
  value: {
    minWidth: 78,
  },
  ltrValue: {
    minWidth: 78,
    writingDirection: 'ltr',
  },
});
