import { I18nManager } from 'react-native';

export function useRtlReady() {
  return I18nManager.isRTL;
}
