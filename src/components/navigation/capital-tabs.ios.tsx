import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { colors } from '@/theme/colors';

export default function CapitalTabs() {
  return (
    <NativeTabs minimizeBehavior="never" tintColor={colors.brand.green}>
      <NativeTabs.Trigger accessibilityLabel="المزيد، تبويب" name="account">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'ellipsis.circle', selected: 'ellipsis.circle.fill' }}
        />
        <NativeTabs.Trigger.Label>المزيد</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger accessibilityLabel="النمو، تبويب" name="reports">
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
        <NativeTabs.Trigger.Label>النمو</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger accessibilityLabel="الفواتير، تبويب" name="invoices">
        <NativeTabs.Trigger.Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
        <NativeTabs.Trigger.Label>الفواتير</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger accessibilityLabel="العمليات، تبويب" name="ledger">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
        />
        <NativeTabs.Trigger.Label>العمليات</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger accessibilityLabel="الرئيسية، تبويب" name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <NativeTabs.Trigger.Label>الرئيسية</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
