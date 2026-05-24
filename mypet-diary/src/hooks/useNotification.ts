import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

const isNative = Capacitor.isNativePlatform();

async function nativePermission(): Promise<Permission> {
  const status = await LocalNotifications.checkPermissions();
  if (status.display === 'granted') return 'granted';
  if (status.display === 'denied') return 'denied';
  return 'default';
}

export function useNotification() {
  const [permission, setPermission] = useState<Permission>('default');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (isNative) {
        const p = await nativePermission();
        if (mounted) setPermission(p);
        return;
      }
      if (typeof window === 'undefined' || !('Notification' in window)) {
        if (mounted) setPermission('unsupported');
        return;
      }
      if (mounted) setPermission(window.Notification.permission as Permission);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const request = useCallback(async () => {
    if (isNative) {
      const result = await LocalNotifications.requestPermissions();
      const next: Permission =
        result.display === 'granted'
          ? 'granted'
          : result.display === 'denied'
          ? 'denied'
          : 'default';
      setPermission(next);
      return next;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported' as const;
    }
    const result = await window.Notification.requestPermission();
    setPermission(result as Permission);
    return result;
  }, []);

  const notify = useCallback(
    async (title: string, body?: string) => {
      if (permission !== 'granted') return;
      if (isNative) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1_000_000),
              title,
              body: body ?? '',
              schedule: { at: new Date(Date.now() + 200) },
            },
          ],
        });
        return;
      }
      new window.Notification(title, { body });
    },
    [permission],
  );

  return { permission, request, notify };
}
