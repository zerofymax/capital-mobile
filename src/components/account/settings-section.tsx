import { StyleSheet, View } from 'react-native';

import { SettingsRow } from '@/components/account/settings-row';
import { AppText } from '@/components/ui';
import type { AccountSettingsRow, AccountSettingsSection } from '@/screens/account/account-data';
import { useThemeColors } from '@/state/appearance-state';

type SettingsSectionProps = {
  section: AccountSettingsSection;
  onRowPress: (row: AccountSettingsRow) => void;
};

export function SettingsSection({ section, onRowPress }: SettingsSectionProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.root}>
      <AppText variant="sectionTitle">{section.title}</AppText>
      <View style={[styles.card, { backgroundColor: colors.surface.card, borderColor: colors.surface.border }]}>
        {section.rows.map((row, index) => (
          <SettingsRow
            isLast={index === section.rows.length - 1}
            key={row.id}
            onPress={() => onRowPress(row)}
            row={row}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 11,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
