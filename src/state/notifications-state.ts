import { useCallback, useSyncExternalStore } from 'react';

import {
  prototypeNotifications,
  type CapitalNotification,
} from '@/screens/operations/notification-data';

type NotificationsState = {
  deletedIds: Record<string, boolean>;
  readIds: Record<string, boolean>;
};

const listeners = new Set<() => void>();

let state: NotificationsState = {
  deletedIds: {},
  readIds: {},
};

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function isNotificationRead(notification: CapitalNotification, readIds = state.readIds) {
  return !notification.unread || Boolean(readIds[notification.id]);
}

export function useNotificationsState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const notifications = prototypeNotifications.filter((notification) => !snapshot.deletedIds[notification.id]);

  const markAsRead = useCallback((notificationId: string) => {
    state = {
      ...state,
      readIds: {
        ...state.readIds,
        [notificationId]: true,
      },
    };
    emitChange();
  }, []);

  const markAllAsRead = useCallback((notificationIds?: string[]) => {
    const targetIds = notificationIds ?? notifications.map((notification) => notification.id);
    const readIds = { ...state.readIds };

    targetIds.forEach((notificationId) => {
      readIds[notificationId] = true;
    });

    state = {
      ...state,
      readIds,
    };
    emitChange();
  }, [notifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    state = {
      ...state,
      deletedIds: {
        ...state.deletedIds,
        [notificationId]: true,
      },
    };
    emitChange();
  }, []);

  return {
    deletedIds: snapshot.deletedIds,
    deleteNotification,
    isRead: (notification: CapitalNotification) => isNotificationRead(notification, snapshot.readIds),
    markAllAsRead,
    markAsRead,
    notifications,
    readIds: snapshot.readIds,
    unreadCount: notifications.filter((notification) => !isNotificationRead(notification, snapshot.readIds)).length,
  };
}
