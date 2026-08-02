import { useSyncExternalStore } from 'react';

export type DeviceSessionId = 'samsung-galaxy' | 'iphone-15' | 'chrome-windows';
export type DevicePlatform = 'Android' | 'iOS' | 'Windows';
export type DeviceSessionStatus = 'active' | 'signedOut';

export type DeviceSession = {
  id: DeviceSessionId;
  deviceName: string;
  platform: DevicePlatform;
  browserOrApp: string;
  location: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
  status: DeviceSessionStatus;
};

const initialDeviceSessions: DeviceSession[] = [
  {
    id: 'samsung-galaxy',
    deviceName: 'Samsung Galaxy',
    platform: 'Android',
    browserOrApp: 'تطبيق Capital',
    location: 'الرياض، السعودية',
    lastActiveAt: 'الآن',
    isCurrentDevice: true,
    status: 'active',
  },
  {
    id: 'iphone-15',
    deviceName: 'iPhone 15',
    platform: 'iOS',
    browserOrApp: 'تطبيق Capital',
    location: 'جدة، السعودية',
    lastActiveAt: 'منذ ساعتين',
    isCurrentDevice: false,
    status: 'active',
  },
  {
    id: 'chrome-windows',
    deviceName: 'Chrome على Windows',
    platform: 'Windows',
    browserOrApp: 'متصفح Chrome',
    location: 'الرياض، السعودية',
    lastActiveAt: 'منذ 3 أيام',
    isCurrentDevice: false,
    status: 'active',
  },
];

let deviceSessions = initialDeviceSessions;
const listeners = new Set<() => void>();

function emitDeviceSessionsChange() {
  listeners.forEach((listener) => listener());
}

export function getDeviceSessions() {
  return deviceSessions;
}

export function subscribeDeviceSessions(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useDeviceSessions() {
  return useSyncExternalStore(subscribeDeviceSessions, getDeviceSessions, getDeviceSessions);
}

export function signOutDevice(id: DeviceSessionId) {
  deviceSessions = deviceSessions.map((session) =>
    session.id === id && !session.isCurrentDevice ? { ...session, status: 'signedOut', lastActiveAt: 'تم تسجيل الخروج' } : session,
  );
  emitDeviceSessionsChange();
}

export function signOutOtherDevices() {
  deviceSessions = deviceSessions.map((session) =>
    session.isCurrentDevice ? session : { ...session, status: 'signedOut', lastActiveAt: 'تم تسجيل الخروج' },
  );
  emitDeviceSessionsChange();
}

export function resetDeviceSessions() {
  deviceSessions = initialDeviceSessions;
  emitDeviceSessionsChange();
}

export function getActiveDeviceSessions(sessions: readonly DeviceSession[]) {
  return sessions.filter((session) => session.status === 'active');
}

export function getSignedOutDeviceSessions(sessions: readonly DeviceSession[]) {
  return sessions.filter((session) => session.status === 'signedOut');
}

export function getPlatformIcon(platform: DevicePlatform) {
  if (platform === 'Windows') {
    return 'desktop-outline' as const;
  }

  return 'phone-portrait-outline' as const;
}
