import { Platform } from 'react-native';

import { spacing } from '@/theme/spacing';

export function getFinancialSetupTopPadding(safeAreaTop: number) {
  if (Platform.OS === 'ios') {
    return safeAreaTop + spacing.sm;
  }

  return Math.max(safeAreaTop + spacing.xl, spacing.safeTop);
}
