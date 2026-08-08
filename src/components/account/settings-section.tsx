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
      <View style={styles.sectionTitleWrap}>
        <AppText style={styles.sectionTitle} variant="sectionTitle">
          {section.title}
        </AppText>
      </View>
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
  sectionTitleWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    flexDirection: 'row',
    width: '100%',
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flex: 1,
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
