import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';

export function SupportSectionHeading({ children }: { children: string }) {
  return (
    <View style={styles.root}>
      <AppText style={styles.text} variant="sectionTitle">
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    direction: 'ltr',
    width: '100%',
  },
  text: {
    alignSelf: 'stretch',
    textAlign: 'right',
    width: '100%',
    writingDirection: 'rtl',
  },
});
