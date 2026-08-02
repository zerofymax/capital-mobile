import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export const capitalTabs = [
  {
    routeName: 'index',
    href: '/(tabs)' as Href,
    label: 'الرئيسية',
    icon: 'home-outline',
    visualRtlIndex: 0,
    accessibilityLabel: 'الرئيسية، تبويب',
  },
  {
    routeName: 'ledger',
    href: '/(tabs)/ledger' as Href,
    label: 'العمليات',
    icon: 'list-outline',
    visualRtlIndex: 1,
    accessibilityLabel: 'العمليات، تبويب',
  },
  {
    routeName: 'invoices',
    href: '/(tabs)/invoices' as Href,
    label: 'الفواتير',
    icon: 'receipt-outline',
    visualRtlIndex: 2,
    accessibilityLabel: 'الفواتير، تبويب',
  },
  {
    routeName: 'reports',
    href: '/(tabs)/reports' as Href,
    label: 'النمو',
    icon: 'trending-up-outline',
    visualRtlIndex: 3,
    accessibilityLabel: 'النمو، تبويب',
  },
  {
    routeName: 'account',
    href: '/(tabs)/account' as Href,
    label: 'المزيد',
    icon: 'ellipsis-horizontal-outline',
    visualRtlIndex: 4,
    accessibilityLabel: 'المزيد، تبويب',
  },
] as const satisfies readonly CapitalTabConfig[];

export type CapitalTabRouteName = 'index' | 'ledger' | 'invoices' | 'reports' | 'account';

export type CapitalTabConfig = {
  routeName: CapitalTabRouteName;
  href: Href;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  visualRtlIndex: number;
  accessibilityLabel: string;
};

export function getCapitalTabByRouteName(routeName: string) {
  return capitalTabs.find((tab) => tab.routeName === routeName) ?? capitalTabs[0];
}
