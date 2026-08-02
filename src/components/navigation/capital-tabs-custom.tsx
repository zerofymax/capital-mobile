import { Tabs } from 'expo-router';

import { MemoizedCapitalTabBar } from './capital-tab-bar';

export default function CapitalTabsCustom() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          shadowOpacity: 0,
        },
      }}
      tabBar={(props) => <MemoizedCapitalTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'الرئيسية' }} />
      <Tabs.Screen name="ledger" options={{ title: 'العمليات' }} />
      <Tabs.Screen name="invoices" options={{ title: 'الفواتير' }} />
      <Tabs.Screen name="reports" options={{ title: 'النمو' }} />
      <Tabs.Screen name="account" options={{ title: 'المزيد' }} />
    </Tabs>
  );
}
